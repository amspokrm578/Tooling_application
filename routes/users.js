const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Authentication routes
router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/logout', userController.logout);
router.get('/me', userController.getCurrentUser);

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router; 