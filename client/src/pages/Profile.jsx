import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><div><h2>Profile</h2><p>Manage your account settings</p></div></div>

      <div className="card profile-card">
        <div className="profile-header">
          <div className="avatar avatar-lg">{getInitials(user?.name)}</div>
          <div className="profile-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <span className={`badge badge-${user?.role}`} style={{ marginTop: '4px' }}>{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label>
            <input type="text" className="form-control" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-group"><label>Email</label>
            <input type="email" className="form-control" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div className="form-group"><label>Role</label>
            <input type="text" className="form-control" value={user?.role} disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
