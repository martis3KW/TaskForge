import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, projectsAPI, authAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    dueDate: '', assignedTo: '', projectId: '',
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        tasksAPI.getAll(), projectsAPI.getAll(), authAPI.getUsers(),
      ]);
      setTasks(tasksRes.data.data);
      setProjects(projectsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask._id, formData);
        toast.success('Task updated');
      } else {
        await tasksAPI.create(formData);
        toast.success('Task created');
      }
      setShowModal(false); resetForm(); fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '', projectId: task.projectId?._id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      toast.success('Task deleted');
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await tasksAPI.update(id, { status });
      toast.success('Status updated');
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '', projectId: '' });
    setEditingTask(null);
  };

  const filtered = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h2>Tasks</h2><p>Manage and track all tasks</p></div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <HiOutlinePlus /> New Task
          </button>
        )}
      </div>

      <div className="filter-bar">
        <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="form-control" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="table-container">
        <div className="table-header"><h3>All Tasks ({filtered.length})</h3></div>
        {filtered.length > 0 ? (
          <table>
            <thead>
              <tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{task.title}</td>
                  <td>{task.projectId?.title || 'N/A'}</td>
                  <td>
                    <select className="form-control" value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '12px', maxWidth: '140px', backgroundSize: '10px' }}>
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                  <td>{task.assignedTo?.name || 'Unassigned'}</td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>
                    <div className="action-buttons">
                      {(isAdmin || task.assignedTo) && (
                        <button className="btn-icon" onClick={() => handleEdit(task)}><HiOutlinePencil /></button>
                      )}
                      {isAdmin && (
                        <button className="btn-icon" onClick={() => handleDelete(task._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>No tasks found</h3>
            <p>{isAdmin ? 'Create your first task.' : 'No tasks assigned to you yet.'}</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        footer={<><button className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editingTask ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label>
            <input type="text" className="form-control" placeholder="Task title" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="form-group"><label>Description</label>
            <textarea className="form-control" placeholder="Task description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Status</label>
              <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group"><label>Priority</label>
              <select className="form-control" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Project</label>
            <select className="form-control" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Assign To</label>
              <select className="form-control" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Due Date</label>
              <input type="date" className="form-control" value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
