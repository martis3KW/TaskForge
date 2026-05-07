import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardCheck, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineExclamation, HiOutlineFolder, HiOutlineFire,
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await tasksAPI.getDashboardStats();
      setStats(res.data.data);
    } catch (error) { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  const completionRate = stats?.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p>Here's an overview of your workspace.</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: <HiOutlineClipboardCheck />, color: 'blue', value: stats?.totalTasks || 0, label: 'Total Tasks' },
          { icon: <HiOutlineCheckCircle />, color: 'green', value: stats?.completedTasks || 0, label: 'Completed' },
          { icon: <HiOutlineClock />, color: 'yellow', value: stats?.pendingTasks || 0, label: 'Pending' },
          { icon: <HiOutlineExclamation />, color: 'red', value: stats?.overdueTasks || 0, label: 'Overdue' },
          { icon: <HiOutlineFolder />, color: 'cyan', value: stats?.activeProjects || 0, label: 'Projects' },
          { icon: <HiOutlineFire />, color: 'red', value: stats?.highPriority || 0, label: 'High Priority' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-card-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {stats?.totalTasks > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>Completion</span>
            <span style={{ fontSize: '12px', color: 'var(--color-primary-light)', fontWeight: '600' }}>{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '14px' }}>
            {[
              { n: stats.todoTasks, l: 'Todo', c: 'var(--text-muted)' },
              { n: stats.inProgressTasks, l: 'In Progress', c: 'var(--color-secondary)' },
              { n: stats.completedTasks, l: 'Done', c: 'var(--color-success)' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: item.c }}>{item.n}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header"><h3>Recent Tasks</h3></div>
        {stats?.recentTasks?.length > 0 ? (
          <table>
            <thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead>
            <tbody>
              {stats.recentTasks.map((task) => (
                <tr key={task._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{task.title}</td>
                  <td>{task.projectId?.title || '—'}</td>
                  <td><span className={`badge badge-${task.status}`}>
                    {task.status === 'in-progress' ? 'In Progress' : task.status}
                  </span></td>
                  <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                  <td>{task.dueDate ? formatDate(task.dueDate) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Tasks will appear here once created.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
