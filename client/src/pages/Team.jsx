import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally { setLoading(false); }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h2>Team Members</h2><p>View all team members in the organization</p></div>
      </div>

      <div className="table-container">
        <div className="table-header"><h3>All Members ({users.length})</h3></div>
        {users.length > 0 ? (
          <table>
            <thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar">{getInitials(user.name)}</div>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No team members</h3>
            <p>Team members will appear here after they sign up.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
