const express = require('express');
const BorrowController = require('../controllers/borrow.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const validate = require('../validations/validate');
const { requestBorrowSchema, approveBorrowSchema, getBorrowItemsSchema } = require('../validations/borrowValidations');

const router = express.Router();



/**
 * @swagger
 * /api/borrow/request:
 *   post:
 *     summary: Request multiple equipment items (Student only)
 *     description: 
 *       Students can create a borrow request with multiple items in a single request.
 *       Serial number is NOT required at this stage.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - collectionDateTime
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     equipmentID:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     description:
 *                       type: string
 *                       example: "Needed for class project"
 *               collectionDateTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-15T10:00:00Z"
 *     responses:
 *       201:
 *         description: Borrow request submitted
 *       400:
 *         description: Invalid request data or user/equipment not found
 *       403:
 *         description: Unauthorized - User is not a Student
 */
router.post('/request', authMiddleware, roleMiddleware(['Student']),validate(requestBorrowSchema), BorrowController.requestEquipment);

/**
 * @swagger
 * /api/borrow/approve/{requestID}:
 *   put:
 *     summary: Approve a borrow request (Admin only)
 *     description: 
 *       Admin can approve a Pending borrow request. The request body includes an array 
 *       of items (each with BorrowedItemID) that can be updated with serial numbers, 
 *       or marked allowed = false if admin doesn't permit that specific item.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestID
 *         in: path
 *         required: true
 *         description: The ID of the borrow request to approve
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - returnDate
 *               - items
 *             properties:
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-01T00:00:00Z"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     borrowedItemID:
 *                       type: integer
 *                       example: 10
 *                     allow:
 *                       type: boolean
 *                       example: true
 *                     description:
 *                       type: string
 *                       example: "Admin-updated description"
 *                     serialNumber:
 *                       type: string
 *                       example: "XYZ5678"
 *     responses:
 *       200:
 *         description: Borrow request approved
 *       400:
 *         description: Request not found or invalid item
 *       403:
 *         description: Unauthorized - User is not an Admin
 */
router.put('/approve/:requestID', authMiddleware, roleMiddleware(['Admin']),validate(approveBorrowSchema), BorrowController.approveRequest);

/**
 * @swagger
 * /api/borrow/return/{requestID}:
 *   put:
 *     summary: Return borrowed equipment (Admin only)
 *     description: 
 *       Admin can mark an approved borrow request as returned.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestID
 *         in: path
 *         required: true
 *         description: The ID of the borrow request to mark as returned
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipment returned successfully
 *       400:
 *         description: Invalid return request or request not in Approved status
 *       403:
 *         description: Unauthorized - User is not an Admin
 */
router.put('/return/:requestID', authMiddleware, roleMiddleware(['Admin']), BorrowController.returnEquipment);

/**
 * @swagger
 * /api/borrow/send-reminder:
 *   post:
 *     summary: Send return reminders (Admin only)
 *     description: 
 *       Admin triggers email reminders for upcoming due dates. 
 *       If no requests match, a message indicates no reminders sent.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminders sent successfully or "No due requests found"
 *       400:
 *         description: Error processing reminders
 *       403:
 *         description: Unauthorized - User is not an Admin
 */
router.post('/send-reminder', authMiddleware, roleMiddleware(['Admin']), BorrowController.sendReminder);

/**
 * @swagger
 * /api/borrow/all-requests:
 *   get:
 *     summary: Get all borrow requests
 *     description: If user is Admin, returns all requests. If user is Student, returns only that student's requests.
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all relevant borrow requests
 *       400:
 *         description: Error fetching requests
 */
 router.get('/all-requests', authMiddleware, BorrowController.getAllRequests);

 /**
  * @swagger
  * /api/borrow/pending-requests:
  *   get:
  *     summary: Get pending borrow requests
  *     description: If user is Admin, returns all pending requests. If user is Student, returns only that student's pending requests.
  *     tags: [Borrow]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: List of pending requests
  *       400:
  *         description: Error fetching requests
  */
 router.get('/pending-requests', authMiddleware, BorrowController.getPendingRequests);
 
/**
 * @swagger
 * /api/borrow/{requestID}/items:
 *   get:
 *     summary: Get all items for a specific borrow request
 *     description: Return the BorrowedItem records associated with this request
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the borrow request
 *     responses:
 *       200:
 *         description: Returns list of items for that request
 *       404:
 *         description: Request not found
 */
router.get(
    '/:requestID/items',
    authMiddleware,
    validate(getBorrowItemsSchema, 'params'), // second arg in validate can indicate "req.params"
    BorrowController.getItemsForRequest
  );


/**
 * @swagger
 * /api/borrow/logs:
 *   get:
 *     summary: Retrieve all audit logs (Admin only)
 *     description: Returns all entries in the AuditLog table
 *     tags: [Borrow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all logs
 *       403:
 *         description: Unauthorized - Admin only
 */
router.get(
  '/logs',
  authMiddleware,
  roleMiddleware(['Admin']), 
  BorrowController.getAllLogs
);

module.exports = router;
