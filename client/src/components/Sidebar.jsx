import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineClipboardCheck,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineLogout,
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <HiOutlineViewGrid />,
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: <HiOutlineFolder />,
    },
    {
      label: 'Tasks',
      path: '/tasks',
      icon: <HiOutlineClipboardCheck />,
    },
    {
      label: 'Team Members',
      path: '/team',
      icon: <HiOutlineUserGroup />,
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: <HiOutlineUser />,
    },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <h1>TaskForge</h1>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="sidebar-section-label">Account</div>
          <button
            className="sidebar-link"
            onClick={logout}
            style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <span className="icon">
              <HiOutlineLogout />
            </span>
            Logout
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
