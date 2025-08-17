const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId, // Links to the Employee model
    ref: 'Employee',
    required: true,
    unique: true,
  },
  totalLeaves: {
    type: Number,
    required: true,
    default: 20, // Default annual leave count
  },
  leavesTaken: {
    type: Number,
    required: true,
    default: 0,
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear(), // Sets the current year by default
  },
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);