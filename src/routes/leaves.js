// src/routes/leaves.js (Updated)

const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');

// ROUTE: POST /api/leaves
// DESC: Apply for a new leave
router.post('/', async (req, res) => {
  // ... (previous code for applying for leave remains unchanged)
  try {
    const { employeeId, startDate, endDate, reason } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    const leaveBalance = await LeaveBalance.findOne({ employeeId: employeeId });
    if (!leaveBalance) {
      return res.status(404).json({ message: 'Leave balance for this employee not found.' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const joining = new Date(employee.joiningDate);
    if (end < start) {
      return res.status(400).json({ message: 'Invalid dates: End date cannot be before the start date.' });
    }
    if (start < joining) {
      return res.status(400).json({ message: 'Leave cannot be applied for a date before the employee\'s joining date.' });
    }
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const availableLeaves = leaveBalance.totalLeaves - leaveBalance.leavesTaken;
    if (duration > availableLeaves) {
      return res.status(400).json({ message: `Insufficient leave balance. Available leaves: ${availableLeaves}, Requested: ${duration}` });
    }
    const overlappingRequest = await LeaveRequest.findOne({
      employeeId: employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [ { startDate: { $lte: end }, endDate: { $gte: start } } ],
    });
    if (overlappingRequest) {
      return res.status(400).json({ message: 'An overlapping leave request already exists for these dates.' });
    }
    const newLeaveRequest = new LeaveRequest({ employeeId, startDate, endDate, reason });
    const savedRequest = await newLeaveRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Server error while applying for leave.' });
  }
});


// --- NEW ROUTE ---
// ROUTE: PUT /api/leaves/:id/status
// DESC: Approve or reject a leave request
// ACCESS: Public (for now, should be HR/Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const leaveRequestId = req.params.id;

    // Validate the new status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const leaveRequest = await LeaveRequest.findById(leaveRequestId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    // Ensure the request is still pending
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: `This leave request has already been ${leaveRequest.status}.` });
    }

    // If approving the leave, update the employee's leave balance
    if (status === 'approved') {
      const duration = Math.ceil((leaveRequest.endDate - leaveRequest.startDate) / (1000 * 60 * 60 * 24)) + 1;

      // Atomically find and update the leave balance
      await LeaveBalance.updateOne(
        { employeeId: leaveRequest.employeeId },
        { $inc: { leavesTaken: duration } }
      );
    }

    // Update the status of the leave request
    leaveRequest.status = status;
    const updatedRequest = await leaveRequest.save();

    res.status(200).json(updatedRequest);

  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Server error while updating leave status.' });
  }
});

module.exports = router;