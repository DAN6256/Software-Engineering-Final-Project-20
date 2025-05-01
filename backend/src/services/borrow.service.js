/**
 * BorrowService
 *
 * Implements the core business logic for managing equipment borrow workflows:
 * - requestEquipment: Students submit new borrow requests.
 * - approveRequest: Admins approve or modify pending requests.
 * - returnEquipment: Admins mark approved requests as returned.
 * - sendReminderForDueReturns: System sends reminders for upcoming due dates.
 * - getAllRequests: Fetch all requests, scoped by user role.
 * - getPendingRequests: Fetch only pending requests, scoped by user role.
 * - getItemsForRequest: Retrieve line‐items for a specific request with access control.
 * - getAllLogs: Retrieve audit log entries for all borrow activities.
 */

const { BorrowRequest, BorrowedItem, Equipment, User, Reminder, AuditLog } = require('../models');
const EmailService = require('./email.service');
const { Op } = require('sequelize');

const BorrowService = {
  /**
   * Create a new borrow request.
   *
   * @param {number} userID               - ID of the student making the request
   * @param {Array}  items                - Array of objects: { equipmentID, quantity, description? }
   * @param {Date}   collectionDateTime   - Desired pickup date/time
   * @returns {Promise<BorrowRequest>}    The created borrow request instance
   * @throws {Error} If user is not a student, no admin exists, or equipment not found
   */
  requestEquipment: async (userID, items, collectionDateTime) => {
    // Ensure the requester is a valid student
    const student = await User.findByPk(userID);
    if (!student || student.Role !== 'Student') {
      throw new Error('Invalid student or role');
    }

    // Locate an admin user to notify
    const admin = await User.findOne({ where: { Role: 'Admin' } });
    if (!admin) {
      throw new Error('No admin found');
    }

    // Create the borrow request record
    const borrowRequest = await BorrowRequest.create({
      UserID: userID,
      BorrowDate: new Date(),
      Status: 'Pending',
      ReturnDate: null,
      CollectionDateTime: collectionDateTime
    });

    // Create a BorrowedItem for each equipment in the request
    for (const item of items) {
      const equip = await Equipment.findByPk(item.equipmentID);
      if (!equip) {
        throw new Error(`Equipment not found: ID=${item.equipmentID}`);
      }
      await BorrowedItem.create({
        RequestID: borrowRequest.RequestID,
        EquipmentID: item.equipmentID,
        Description: item.description || null,
        SerialNumber: null,
        Quantity: item.quantity
      });
    }

    // Audit log entry for the borrow request
    const userLabel = student.Role === 'Admin' ? 'the admin' : student.Name;
    await AuditLog.create({
      UserID: userID,
      Action: 'Borrow',
      RequestID: borrowRequest.RequestID,
      Details: `${userLabel} requested some item(s)`,
      Timestamp: new Date()
    });

    // Retrieve full borrowed item details for email
    const borrowedItems = await BorrowedItem.findAll({
      where: { RequestID: borrowRequest.RequestID },
      include: [{ model: Equipment }]
    });

    // Send email notifications to student and admin
    await EmailService.sendBorrowRequestNotification(
      student.Name,
      student.Email,
      admin.Email,
      borrowRequest.RequestID,
      borrowedItems,
      borrowRequest.CollectionDateTime
    );

    return borrowRequest;
  },

  /**
   * Approve or modify a pending borrow request.
   *
   * @param {number} requestID   - ID of the request to approve
   * @param {Date}   returnDate  - Deadline for return
   * @param {Array}  items       - Array of objects: { borrowedItemID, allow, description?, serialNumber? }
   * @returns {Promise<BorrowRequest>} The updated borrow request
   * @throws {Error} If request is not pending or items invalid
   */
  approveRequest: async (requestID, returnDate, items) => {
    // Fetch the existing request
    const request = await BorrowRequest.findByPk(requestID);
    if (!request || request.Status !== 'Pending') {
      throw new Error('Request not found or already processed');
    }

    // Process each item: either remove or update details
    for (const itemData of items) {
      const { borrowedItemID, allow, description, serialNumber } = itemData;
      const borrowedItem = await BorrowedItem.findByPk(borrowedItemID);

      if (!borrowedItem || borrowedItem.RequestID !== requestID) {
        throw new Error(`BorrowedItem not found: ID=${borrowedItemID}`);
      }
      if (allow === false) {
        // Remove disallowed items
        await borrowedItem.destroy();
      } else {
        // Update description/serial number if provided
        if (description)     borrowedItem.Description  = description;
        if (serialNumber)    borrowedItem.SerialNumber = serialNumber;
        await borrowedItem.save();
      }
    }

    // Update request status based on remaining items
    const remainingItems = await BorrowedItem.findAll({ where: { RequestID: requestID } });
    if (remainingItems.length === 0) {
      request.Status = 'Returned';
    } else {
      request.Status    = 'Approved';
      request.ReturnDate = returnDate;
    }
    await request.save();

    // Notify student of approval
    const student = await User.findByPk(request.UserID);
    const updatedItems = await BorrowedItem.findAll({
      where: { RequestID: requestID },
      include: [{ model: Equipment }]
    });
    if (student) {
      await EmailService.sendApprovalNotification(
        student.Name,
        student.Email,
        requestID,
        returnDate,
        updatedItems
      );
    }

    // Audit log entry for approval
    await AuditLog.create({
      UserID: request.UserID,
      RequestID: requestID,
      Action: 'Approve',
      Details: `Admin approved request #${requestID}, ReturnDate: ${returnDate}`,
      Timestamp: new Date()
    });

    return request;
  },

  /**
   * Mark an approved request as returned.
   *
   * @param {number} requestID   - ID of the borrow request to return
   * @returns {Promise<BorrowRequest>} The updated borrow request
   * @throws {Error} If request is not in 'Approved' status
   */
  returnEquipment: async (requestID) => {
    const request = await BorrowRequest.findByPk(requestID);
    if (!request || request.Status !== 'Approved') {
      throw new Error('Invalid return request');
    }

    // Update status to returned
    request.Status = 'Returned';
    await request.save();

    // Audit log entry for return
    const returningUser = await User.findByPk(request.UserID);
    const userLabel = returningUser && returningUser.Role === 'Admin'
      ? 'the admin'
      : returningUser
        ? returningUser.Name
        : 'Unknown user';
    await AuditLog.create({
      UserID: request.UserID,
      RequestID: requestID,
      Action: 'Return',
      Details: `${userLabel} returned borrow request #${requestID}`,
      Timestamp: new Date()
    });

    // Notify student of return confirmation
    const student = await User.findByPk(request.UserID, { unscoped: true });
    if (student) {
      await EmailService.sendReturnConfirmation(
        student.Name,
        student.Email,
        requestID
      );
    }

    return request;
  },

  /**
   * Send reminder emails for items due within the next two days.
   *
   * @returns {Promise<{ remindersSent: number, cutoffDate: Date }>}
   *          Count of reminders sent and the cutoff timestamp used
   */
  sendReminderForDueReturns: async () => {
    const now = new Date();
    // Calculate end-of-day two days ahead in UTC
    const cutoff = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 2,
      23, 59, 59, 999
    ));

    // Find all approved requests with a returnDate up to the cutoff
    const dueRequests = await BorrowRequest.findAll({
      where: {
        Status: 'Approved',
        ReturnDate: { [Op.lte]: cutoff }
      }
    });

    let remindersSent = 0;
    for (const request of dueRequests) {
      const student = await User.findByPk(request.UserID);
      if (!student) continue;

      // Send email reminder and record it
      await EmailService.sendReminder(
        student.Name,
        student.Email,
        request.RequestID,
        request.ReturnDate
      );
      await Reminder.create({
        RequestID: request.RequestID,
        ReminderDate: new Date(),
        Sent: true
      });

      // Audit log entry for reminder
      await AuditLog.create({
        UserID: request.UserID,
        RequestID: request.RequestID,
        Action: 'Notify',
        Details: `Reminder sent to ${student.Name} for request #${request.RequestID}`,
        Timestamp: new Date()
      });

      remindersSent++;
    }

    return { remindersSent, cutoffDate: cutoff };
  },

  /**
   * Retrieve all borrow requests, filtered by user role.
   *
   * @param {Object} user   - Authenticated user object with Role and UserID
   * @returns {Promise<Array<BorrowRequest>>} Array of borrow requests
   */
  getAllRequests: async (user) => {
    const query = {
      order: [['RequestID', 'DESC']],
      include: [User]
    };
    // Non-admin users see only their own requests
    if (user.Role !== 'Admin') {
      query.where = { UserID: user.UserID };
    }
    return await BorrowRequest.findAll(query);
  },

  /**
   * Retrieve only pending borrow requests, filtered by user role.
   *
   * @param {Object} user   - Authenticated user object
   * @returns {Promise<Array<BorrowRequest>>} Array of pending requests
   */
  getPendingRequests: async (user) => {
    const base = {
      where: { Status: 'Pending' },
      order: [['RequestID', 'DESC']],
      include: [User]
    };
    if (user.Role !== 'Admin') {
      base.where.UserID = user.UserID;
    }
    return await BorrowRequest.findAll(base);
  },

  /**
   * Retrieve the borrowed items for a specific request, with access control.
   *
   * @param {Object} user       - Authenticated user object
   * @param {number} requestID  - ID of the borrow request
   * @returns {Promise<Array<BorrowedItem>>} List of borrowed item records
   * @throws {Error} If request not found or unauthorized access
   */
  getItemsForRequest: async (user, requestID) => {
    // Validate request existence
    const request = await BorrowRequest.findByPk(requestID);
    if (!request) {
      throw new Error('Request not found');
    }
    // Students may only view their own requests
    if (user.Role === 'Student' && request.UserID !== user.UserID) {
      throw new Error('You do not have permission to view items for this request');
    }
    return await BorrowedItem.findAll({
      where: { RequestID: requestID },
      include: [{ model: Equipment }]
    });
  },

  /**
   * Retrieve all audit logs for borrow activities.
   *
   * @returns {Promise<Array<AuditLog>>} Array of audit log entries
   */
  getAllLogs: async () => {
    return await AuditLog.findAll({
      order: [['LogID', 'DESC']],
      include: [User]
    });
  }
};

module.exports = BorrowService;
