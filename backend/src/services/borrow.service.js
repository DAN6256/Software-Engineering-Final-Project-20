const { BorrowRequest, BorrowedItem, Equipment, User, Reminder, AuditLog } = require('../models');
const EmailService = require('./email.service');
const { Op } = require('sequelize');

const BorrowService = {
  requestEquipment: async (userID, items, collectionDateTime) => {
    const student = await User.findByPk(userID);
    if (!student || student.Role !== 'Student') {
      throw new Error('Invalid student or role');
    }

    const admin = await User.findOne({ where: { Role: 'Admin' } });
    if (!admin) {
      throw new Error('No admin found');
    }

    const borrowRequest = await BorrowRequest.create({
      UserID: userID,
      BorrowDate: new Date(),
      Status: 'Pending',
      ReturnDate: null,
      CollectionDateTime: collectionDateTime
    });

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

    const userLabel = student.Role === 'Admin' ? 'the admin' : student.Name;

    await AuditLog.create({
      UserID: userID,
      Action: 'Borrow',
      RequestID: borrowRequest.RequestID,
      Details: `${userLabel} requested some item(s)`, 
      Timestamp: new Date()
    });

    const borrowedItems = await BorrowedItem.findAll({
      where: { RequestID: borrowRequest.RequestID },
      include: [
        { model: Equipment }
      ]
    });

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

  approveRequest: async (requestID, returnDate, items) => {
    const request = await BorrowRequest.findByPk(requestID);
    if (!request || request.Status !== 'Pending') {
      throw new Error('Request not found or already processed');
    }

    for (const itemData of items) {
      const { borrowedItemID, allow, description, serialNumber } = itemData;

      const borrowedItem = await BorrowedItem.findByPk(borrowedItemID);
      if (!borrowedItem || borrowedItem.RequestID != requestID) {
        throw new Error(`BorrowedItem not found: ID=${borrowedItemID}`);
      }

      if (allow === false) {
        await borrowedItem.destroy();
      } else {
        if (description) borrowedItem.Description = description;
        if (serialNumber) borrowedItem.SerialNumber = serialNumber;
        await borrowedItem.save();
      }
    }

    const remainingItems = await BorrowedItem.findAll({ where: { RequestID: requestID } });
    if (remainingItems.length === 0) {
      request.Status = 'Returned';
    } else {
      request.Status = 'Approved';
      request.ReturnDate = returnDate;
    }
    await request.save();

    const student = await User.findByPk(request.UserID);

    const updatedItems = await BorrowedItem.findAll({
      where: { RequestID: requestID },
      include: [
        { model: Equipment }
      ]
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

    await AuditLog.create({
      UserID: request.UserID,
      RequestID: requestID,
      Action: 'Approve',
      Details: `Admin approved request #${requestID}, ReturnDate: ${returnDate}`,
      Timestamp: new Date()
    });

    return request;
  },

  returnEquipment: async (requestID) => {
    const request = await BorrowRequest.findByPk(requestID);
    if (!request || request.Status !== 'Approved') {
      throw new Error('Invalid return request');
    }

    request.Status = 'Returned';
    await request.save();

    const returningUser = await User.findByPk(request.UserID);
    const userLabel = returningUser && returningUser.Role === 'Admin' ? 'the admin' : (returningUser ? returningUser.Name : 'Unknown user');

    await AuditLog.create({
      UserID: request.UserID,
      RequestID: requestID,
      Action: 'Return',
      Details: `${userLabel} returned borrow request #${requestID}`, 
      Timestamp: new Date()
    });

    const student = await User.findByPk(request.UserID, { unscoped: true });
    if (student) {
      await EmailService.sendReturnConfirmation(student.Name, student.Email, requestID);
    }

    return request;
  },

  sendReminderForDueReturns: async () => {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0); // Set time to midnight for consistency

const dueRequests = await BorrowRequest.findAll({
  where: {
    Status: 'Approved',
    ReturnDate: {
      [Op.eq]: twoDaysFromNow, 
    },
  },
});

    let remindersSent = 0;

    for (const request of dueRequests) {
      const student = await User.findByPk(request.UserID);
      if (student) {
        await EmailService.sendReminder(student.Name, student.Email, request.RequestID, request.ReturnDate);
        await Reminder.create({
          RequestID: request.RequestID,
          ReminderDate: new Date(),
          Sent: true
        });

        const userLabel = student.Role === 'Admin' ? 'the admin' : student.Name;
        await AuditLog.create({
          UserID: request.UserID,
          RequestID: request.RequestID,
          Action: 'Notify',
          Details: `Reminder sent to ${userLabel} for request #${request.RequestID}`, 
          Timestamp: new Date()
        });

        remindersSent++;
      }
    }

    return {remindersSent,twoDaysFromNow};
  },

  getAllRequests: async (user) => {
    if (user.Role === 'Admin') {
      return await BorrowRequest.findAll({
        order: [['RequestID', 'DESC']],
        include: [User] 
      });
    } else {
      return await BorrowRequest.findAll({
        where: { UserID: user.UserID },
        order: [['RequestID', 'DESC']],
        include: [User]
      });
    }
  },

  getPendingRequests: async (user) => {
    if (user.Role === 'Admin') {
      return await BorrowRequest.findAll({
        where: { Status: 'Pending' },
        order: [['RequestID', 'DESC']],
        include: [User]
      });
    } else {
      return await BorrowRequest.findAll({
        where: {
          UserID: user.UserID,
          Status: 'Pending'
        },
        order: [['RequestID', 'DESC']],
        include: [User]
      });
    }
  },
  getItemsForRequest: async (user, requestID) => {
    const request = await BorrowRequest.findByPk(requestID);
    if (!request) throw new Error('Request not found');

    if (user.Role === 'Student' && request.UserID !== user.UserID) {
      throw new Error('You do not have permission to view items for this request');
    }

    const items = await BorrowedItem.findAll({
      where: { RequestID: requestID },
      include: [{ model: Equipment }]
    });

    return items;
  },
  getAllLogs: async () => {
    return await AuditLog.findAll({
      order: [['LogID', 'DESC']],
      include: [User]
    });
  }

};

module.exports = BorrowService;
