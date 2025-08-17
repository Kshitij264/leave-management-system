// src/server.js (Updated)

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves'); // <-- NEW LINE

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// --- Database Connection ---
if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL is not defined in .env file");
  process.exit(1);
}
mongoose.connect(DATABASE_URL, { tlsAllowInvalidCertificates: true }); // Note: Using the TLS fix from before
const db = mongoose.connection;
db.on('error', (error) => console.error('Database connection error:', error));
db.once('open', () => console.log('✅ Successfully connected to the database!'));
// -------------------------

// Middleware
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
  res.send('Leave Management System API is running!');
});

// Use the routes
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes); // <-- NEW LINE

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});