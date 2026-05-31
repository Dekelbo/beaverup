import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

// --- Wrap protected app pages ---
function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
