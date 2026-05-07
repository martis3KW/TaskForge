import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, authAPI } from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineFolder, HiOutlineUserGroup,
} from 'react-icons/hi';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', members: [] });

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data.data);
    } catch (error) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.data);
    } catch (error) { console.error('Failed to load users'); }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject._id, formData);
        toast.success('Project updated');
      } else {
        await projectsAPI.create(formData);
        toast.success('Project created');
      }
      setShowModal(false); resetForm(); fetchProjects();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title, description: project.description,
      members: project.members.map((m) => m._id),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', members: [] });
    setEditingProject(null);
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  const getInitials = (name) => name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h2>Projects</h2><p>Manage your team's projects</p></div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <HiOutlinePlus /> New Project
          </button>
        )}
      </div>

      {projects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {projects.map((project) => (
            <div className="card" key={project._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', color: 'white',
                  }}>
                    <HiOutlineFolder />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{project.title}</h3>
                    <span className={`badge badge-${project.status || 'active'}`}>{project.status || 'Active'}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => handleEdit(project)}><HiOutlinePencil /></button>
                    <button className="btn-icon" onClick={() => handleDelete(project._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash /></button>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiOutlineUserGroup style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{project.members?.length || 0} members</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{project.completedTasks || 0}/{project.taskCount || 0} tasks</span>
                  {project.taskCount > 0 && (
                    <div className="progress-bar" style={{ width: '60px' }}>
                      <div className="progress-bar-fill" style={{ width: `${(project.completedTasks / project.taskCount) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <h3>No projects yet</h3>
            <p>{isAdmin ? 'Create your first project to get started.' : 'No projects assigned to you yet.'}</p>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editingProject ? 'Update' : 'Create'}</button>
        </>}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Title</label>
            <input type="text" className="form-control" placeholder="Project title" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="form-group"><label>Description</label>
            <textarea className="form-control" placeholder="Project description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div className="form-group"><label>Team Members</label>
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}>
              {users.map((u) => (
                <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={formData.members.includes(u._id)} onChange={() => handleMemberToggle(u._id)} style={{ accentColor: 'var(--color-primary)' }} />
                  <div className="avatar avatar-sm">{getInitials(u.name)}</div>
                  {u.name}
                  <span className={`badge badge-${u.role}`} style={{ marginLeft: 'auto' }}>{u.role}</span>
                </label>
              ))}
              {users.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No users found</p>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
