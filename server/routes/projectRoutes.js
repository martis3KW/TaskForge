const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { projectValidator, mongoIdValidator } = require('../validators');

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), projectValidator, validate, createProject);

router
  .route('/:id')
  .get(protect, mongoIdValidator, validate, getProject)
  .put(protect, authorize('admin'), mongoIdValidator, validate, updateProject)
  .delete(protect, authorize('admin'), mongoIdValidator, validate, deleteProject);

module.exports = router;
