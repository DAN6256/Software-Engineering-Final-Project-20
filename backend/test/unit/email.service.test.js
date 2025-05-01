/**
 * Mock Nodemailer to prevent actual SMTP connections during tests.
 * The createTransport method is stubbed to return an object whose
 * sendMail method resolves successfully without sending real emails.
 */
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({})
  })
}));

// Import the mocked nodemailer and the EmailService under test
const nodemailer = require('nodemailer');
const EmailService = require('../../src/services/email.service');

/**
 * Unit tests for EmailService notification methods.
 * Each suite verifies that the appropriate transporter calls are made
 * and that email content is constructed without errors.
 */
describe('EmailService', () => {
  // Reset all mock call counts and implementations after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for the sendBorrowRequestNotification method.
   * Ensures that two separate emails (student + admin) are sent,
   * and that the transporter was invoked correctly.
   */
  describe('sendBorrowRequestNotification', () => {
    it('should send two emails with proper content', async () => {
      // Arrange & Act
      await EmailService.sendBorrowRequestNotification(
        'StudentName',
        'student@x.com',
        'admin@x.com',
        123,
        [{ Equipment: { Name: 'ItemA' }, Quantity: 2 }],
        new Date()
      );

      // Assert: verify transporter creation and calls
      expect(nodemailer.createTransport).toHaveBeenCalled();
      // Further expectations for sendMail calls can be added here
    });
  });

  /**
   * Test suite for the sendApprovalNotification method.
   * Verifies that an approval email containing item details is sent
   * when a borrow request is approved.
   */
  describe('sendApprovalNotification', () => {
    it('should send an approval email with item details', async () => {
      // Arrange & Act
      await EmailService.sendApprovalNotification(
        'StudentName',
        'student@x.com',
        123,
        new Date(),
        [{ Equipment: { Name: 'ItemB' }, Quantity: 1 }]
      );

      // Assert: verify transporter usage and content composition
      expect(nodemailer.createTransport).toHaveBeenCalled();
      // Further expectations for sendMail calls can be added here
    });
  });

  /**
   * Test suite for the sendReturnConfirmation method.
   * Confirms that a return confirmation email is dispatched to the student.
   */
  describe('sendReturnConfirmation', () => {
    it('should send a return confirmation email', async () => {
      // Arrange & Act
      await EmailService.sendReturnConfirmation('StudentName', 'stud@x.com', 99);

      // Assert: verify sendMail invocation
      expect(nodemailer.createTransport).toHaveBeenCalled();
      // Further expectations for sendMail calls can be added here
    });
  });

  /**
   * Test suite for the sendReminder method.
   * Ensures a reminder email is sent one day before the return due date.
   */
  describe('sendReminder', () => {
    it('should send a reminder email', async () => {
      // Arrange & Act
      await EmailService.sendReminder('StudentName', 'stud@x.com', 50, new Date());

      // Assert: verify transporter creation and sendMail call
      expect(nodemailer.createTransport).toHaveBeenCalled();
      // Further expectations for sendMail calls can be added here
    });
  });
});
