import { useLocation } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';

const Header = ({ onMenuClick }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path === '/tasks') return 'Tasks';
    if (path === '/team') return 'Team Members';
    if (path === '/profile') return 'Profile';
    return 'TaskForge';
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <HiOutlineMenu />
        </button>
        <h2 className="header-title">{getPageTitle()}</h2>
      </div>
    </header>
  );
};

export default Header;
