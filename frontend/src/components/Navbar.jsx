import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workspace', label: 'Practice' },
  { to: '/progress', label: 'Progress' },
  { to: '/history', label: 'History' },
  { to: '/settings', label: 'Settings' }
];

function Navbar() {
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
        <span>Dekel</span>
        <NavLink className="logout-link" to="/login">
          Logout
        </NavLink>
      </div>
    </header>
  );
}

export default Navbar;
