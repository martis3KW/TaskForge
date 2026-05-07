const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  taskValidator,
  taskUpdateValidator,
  mongoIdValidator,
} = require('../validators');

// Dashboard stats route (must be before /:id)
router.get('/stats/dashboard', protect, getDashboardStats);

router
  .route('/')
  .get(protect, getTasks)
  .post(protect, authorize('admin'), taskValidator, validate, createTask);

router
  .route('/:id')
  .get(protect, mongoIdValidator, validate, getTask)
  .put(protect, mongoIdValidator, taskUpdateValidator, validate, updateTask)
  .delete(protect, authorize('admin'), mongoIdValidator, validate, deleteTask);

module.exports = router;
