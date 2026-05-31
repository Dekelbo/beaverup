import { Link } from 'react-router-dom';

// --- Render login form ---
function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <img className="auth-logo" src="/assets/main-logo.png" alt="BeaverUP" />
        <p className="eyebrow">Welcome to BeaverUP</p>
        <h1>Train your language until it sounds natural.</h1>
        <form className="form-stack">
          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="At least 6 characters" minLength="6" required />
          </label>
          <Link className="primary-button" to="/dashboard">
            Login
          </Link>
        </form>
        <p className="auth-switch">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
