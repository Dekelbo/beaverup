import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Define main navigation links ---
const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workspace', label: 'Practice' },
  { to: '/progress', label: 'Progress' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' }
];

// --- Render logged-in navigation ---
function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // --- Logout and return to login ---
  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <NavLink className="brand" to="/dashboard">
        <span className="brand-mark">
          <img src="/assets/pic-logo.png" alt="" />
        </span>
        <span>BeaverUP</span>
      </NavLink>

      <nav className="nav-links" aria-label="Main navigation">
        {links.map(link => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-user">
        <span>{user?.firstName || 'User'}</span>
        <button className="logout-link" onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
