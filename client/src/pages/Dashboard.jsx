import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineFolder,
  HiOutlineFire,
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await tasksAPI.getDashboardStats();
      setStats(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's what's happening with your projects today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <HiOutlineClipboardCheck />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.totalTasks || 0}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.completedTasks || 0}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon yellow">
            <HiOutlineClock />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.pendingTasks || 0}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon red">
            <HiOutlineExclamation />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.overdueTasks || 0}</h3>
            <p>Overdue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon cyan">
            <HiOutlineFolder />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.activeProjects || 0}</h3>
            <p>Active Projects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon red">
            <HiOutlineFire />
          </div>
          <div className="stat-card-info">
            <h3>{stats?.highPriority || 0}</h3>
            <p>High Priority</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {stats?.totalTasks > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Task Progress
          </h3>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Completion Rate
                </span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>
                  {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(stats.completedTasks / stats.totalTasks) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{stats.todoTasks}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Todo</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-secondary)' }}>
                  {stats.inProgressTasks}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>In Progress</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-success)' }}>
                  {stats.completedTasks}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Done</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Tasks</h3>
        </div>
        {stats?.recentTasks?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTasks.map((task) => (
                <tr key={task._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                    {task.title}
                  </td>
                  <td>{task.projectId?.title || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${task.status}`}>
                      {task.status === 'in-progress'
                        ? 'In Progress'
                        : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                  <td>
                    {task.dueDate ? formatDate(task.dueDate) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Tasks will appear here once they are created.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
