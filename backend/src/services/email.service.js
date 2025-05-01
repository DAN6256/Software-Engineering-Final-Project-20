/**
 * EmailService
 *
 * Handles all email notifications for the FabTrack application using Nodemailer.
 * - sendBorrowRequestNotification: Notify student & admin upon new borrow request.
 * - sendApprovalNotification: Notify student when their request is approved.
 * - sendReturnConfirmation: Notify student when equipment is marked returned.
 * - sendReminder: Remind student one day before return due date.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the SMTP transporter using Gmail credentials.
// TLS rejectUnauthorized is false to accommodate self-signed certs in some environments.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,           // Sender email address
    pass: process.env.EMAIL_PASSWORD   // SMTP password or app-specific password
  },
  tls: {
    rejectUnauthorized: false          // Allow self-signed certificates
  }
});

const EmailService = {
  /**
   * Send notification emails when a new borrow request is submitted.
   *
   * @param {string} studentName          - Full name of the requesting student
   * @param {string} studentEmail         - Student's email address
   * @param {string} adminEmail           - Admin's email address for notification
   * @param {number} requestID            - Identifier of the borrow request
   * @param {Array}  borrowedItems        - List of borrowed items with Equipment and Quantity
   * @param {Date}   collectionDateTime   - Scheduled pickup date/time
   */
  sendBorrowRequestNotification: async (
    studentName,
    studentEmail,
    adminEmail,
    requestID,
    borrowedItems,
    collectionDateTime
  ) => {
    // Construct a human-readable list of items
    let itemDetails = '';
    for (const item of borrowedItems) {
      const equipName = item.Equipment?.Name ?? 'Unknown Equipment';
      const qty       = item.Quantity || 1;
      const desc      = item.Description ? ` | Description: "${item.Description}"` : '';
      itemDetails += ` - ${equipName} (Qty: ${qty}${desc})\n`;
    }

    // Email to the student confirming submission
    const mailOptionsStudent = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Submitted`,
      text: [
        `Dear ${studentName},`,
        ``,
        `Your borrow request #${requestID} has been submitted with the following items:`,
        ``,
        itemDetails,
        `You will need to collect the items at the Fab Lab on: ${collectionDateTime}`,
        ``,
        `Regards,`,
        `FabTrack`
      ].join('\n')
    };

    // Email to the admin notifying of new request
    let adminBody = [
      `A new borrow request #${requestID} has been submitted by ${studentName} with the following items:`,
      ``,
      itemDetails
    ].join('\n');
    if (collectionDateTime) {
      adminBody += `Requested pick-up date/time: ${collectionDateTime}\n\n`;
    }
    adminBody += [
      `Please prepare the component(s) for pickup and verify issuance.`,
      ``,
      `Regards,`,
      `FabTrack`
    ].join('\n');

    const mailOptionsAdmin = {
      from: process.env.EMAIL,
      to: adminEmail,
      subject: `New Borrow Request #${requestID}`,
      text: adminBody
    };

    // Send both emails sequentially
    await transporter.sendMail(mailOptionsStudent);
    await transporter.sendMail(mailOptionsAdmin);
  },

  /**
   * Notify the student when their borrow request has been approved.
   *
   * @param {string} studentName   - Full name of the student
   * @param {string} studentEmail  - Student's email address
   * @param {number} requestID     - Identifier of the approved request
   * @param {Date}   returnDate    - Deadline for returning the items
   * @param {Array}  approvedItems - Final list of items with Equipment, Quantity, SerialNumber, and Description
   */
  sendApprovalNotification: async (
    studentName,
    studentEmail,
    requestID,
    returnDate,
    approvedItems
  ) => {
    // Build a detailed list including serial numbers & descriptions
    let itemDetails = '';
    for (const item of approvedItems) {
      const equipName = item.Equipment?.Name ?? 'Unknown Equipment';
      const qty       = item.Quantity || 1;
      const sn        = item.SerialNumber ? ` (SN: ${item.SerialNumber})` : '';
      const desc      = item.Description ? ` | Description: "${item.Description}"` : '';
      itemDetails += ` - ${equipName} x${qty}${sn}${desc}\n`;
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Approved`,
      text: [
        `Dear ${studentName},`,
        ``,
        `Your borrow request #${requestID} has been approved.`,
        `Return deadline: ${returnDate}`,
        ``,
        `Approved items:`,
        itemDetails,
        ``,
        `Please return items by the deadline.`,
        ``,
        `Regards,`,
        `FabTrack`
      ].join('\n')
    };

    await transporter.sendMail(mailOptions);
  },

  /**
   * Confirm to the student that their items have been marked as returned.
   *
   * @param {string} studentName  - Full name of the student
   * @param {string} studentEmail - Student's email address
   * @param {number} requestID    - Identifier of the returned request
   */
  sendReturnConfirmation: async (studentName, studentEmail, requestID) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Returned`,
      text: [
        `Dear ${studentName},`,
        ``,
        `Your borrow request #${requestID} has been marked as returned by the admin.`,
        `If you have any questions, please contact the lab staff.`,
        ``,
        `Regards,`,
        `FabTrack`
      ].join('\n')
    };
    await transporter.sendMail(mailOptions);
  },

  /**
   * Send a reminder email one day before the return due date.
   *
   * @param {string} studentName  - Full name of the student
   * @param {string} studentEmail - Student's email address
   * @param {number} requestID    - Identifier of the request due soon
   * @param {Date}   returnDate   - Scheduled return date/time
   */
  sendReminder: async (studentName, studentEmail, requestID, returnDate) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: 'Equipment Return Reminder',
      text: [
        `Dear ${studentName},`,
        ``,
        `This is a reminder that your borrow request #${requestID} is due on ${returnDate}.`,
        ``,
        `Regards,`,
        `FabTrack`
      ].join('\n')
    };

    await transporter.sendMail(mailOptions);
  }
};

module.exports = EmailService;
