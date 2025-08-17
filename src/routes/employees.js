// src/routes/employees.js (Updated)

const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const LeaveBalance = require('../models/LeaveBalance');

// ROUTE: POST /api/employees
// DESC: Add a new employee
router.post('/', async (req, res) => {
  // ... (previous code for creating an employee remains unchanged)
  try {
    const { name, email, department, joiningDate } = req.body;

    if (!name || !email || !department || !joiningDate) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    const existingEmployee = await Employee.findOne({ email: email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'An employee with this email already exists.' });
    }
    const newEmployee = new Employee({ name, email, department, joiningDate });
    const savedEmployee = await newEmployee.save();
    const newLeaveBalance = new LeaveBalance({ employeeId: savedEmployee._id });
    await newLeaveBalance.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error while creating employee.' });
  }
});

// --- NEW ROUTE ---
// ROUTE: GET /api/employees/:id/balance
// DESC: Fetch the leave balance for an employee
// ACCESS: Public (for now)
router.get('/:id/balance', async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Find the leave balance record for the given employee ID
    const leaveBalance = await LeaveBalance.findOne({ employeeId: employeeId });

    if (!leaveBalance) {
      return res.status(404).json({ message: 'Leave balance for this employee not found.' });
    }

    // Calculate the available leaves
    const availableLeaves = leaveBalance.totalLeaves - leaveBalance.leavesTaken;

    // Send a formatted response
    res.status(200).json({
      total: leaveBalance.totalLeaves,
      taken: leaveBalance.leavesTaken,
      available: availableLeaves,
    });

  } catch (error) {
    console.error('Error fetching leave balance:', error);
    // Also handle cases where the provided ID is not a valid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.status(500).json({ message: 'Server error while fetching leave balance.' });
  }
});

module.exports = router;