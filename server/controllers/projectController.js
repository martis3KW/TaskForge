const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      // Admin can see all projects
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort('-createdAt');
    } else {
      // Members can only see projects they belong to
      projects = await Project.find({
        $or: [{ members: req.user._id }, { createdBy: req.user._id }],
      })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort('-createdAt');
    }

    // Add task count for each project
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        const completedTasks = await Task.countDocuments({
          projectId: project._id,
          status: 'completed',
        });
        return {
          ...project.toObject(),
          taskCount,
          completedTasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithTaskCount.length,
      data: projectsWithTaskCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check access for members
    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString()) &&
      project.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project',
      });
    }

    // Get tasks for this project
    const tasks = await Task.find({ projectId: project._id })
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: { ...project.toObject(), tasks },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { title, description, members } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const { title, description, members, status } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, members, status },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: project._id });

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
