const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    let filter = {};
    const { projectId, status, priority, assignedTo } = req.query;

    // Apply filters
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Members only see tasks assigned to them
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Members can only view tasks assigned to them
    if (
      req.user.role !== 'admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, projectId } =
      req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      projectId,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role !== 'admin') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task',
        });
      }
      // Members can only update status
      const allowedFields = ['status'];
      const updateFields = Object.keys(req.body);
      const isAllowed = updateFields.every((field) =>
        allowedFields.includes(field)
      );
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status',
        });
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    let filter = {};

    // Members only see their own stats
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({
      ...filter,
      status: 'completed',
    });
    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: { $in: ['todo', 'in-progress'] },
    });
    const overdueTasks = await Task.countDocuments({
      ...filter,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() },
    });

    const todoTasks = await Task.countDocuments({ ...filter, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: 'in-progress',
    });

    const highPriority = await Task.countDocuments({
      ...filter,
      priority: 'high',
      status: { $ne: 'completed' },
    });

    // Recent tasks
    const recentTasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .sort('-createdAt')
      .limit(5);

    // Active projects count
    let activeProjects;
    if (req.user.role === 'admin') {
      activeProjects = await Project.countDocuments({ status: 'active' });
    } else {
      activeProjects = await Project.countDocuments({
        status: 'active',
        $or: [{ members: req.user._id }, { createdBy: req.user._id }],
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        todoTasks,
        inProgressTasks,
        highPriority,
        activeProjects,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
};
