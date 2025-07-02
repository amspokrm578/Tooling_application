const express = require('express');
const router = express.Router();
const userRoutes = require('./users');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Sample hello route
router.get('/hello', (req, res) => {
  res.json({
    success: true,
    message: 'Hello from the API!',
    data: {
      greeting: 'Welcome to the Tooling Application API',
      version: '1.0.0'
    }
  });
});

// Mount user routes
router.use('/users', userRoutes);

module.exports = router; 