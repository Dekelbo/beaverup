import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Render login form ---
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Update login form ---
  function handleChange(event) {
    const { name, value } = event.target;
    setForm(currentForm => ({ ...currentForm, [name]: value }));
  }

  // --- Submit login request ---
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <img className="auth-logo" src="/assets/main-logo.png" alt="BeaverUP" />
        <p className="eyebrow">Welcome to BeaverUP</p>
        <h1>Train your language until it sounds natural.</h1>
        {error && <p className="status-message error-message">{error}</p>}
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" onChange={handleChange} placeholder="you@example.com" required type="email" value={form.email} />
          </label>
          <label>
            Password
            <input name="password" onChange={handleChange} placeholder="At least 6 characters" minLength="6" required type="password" value={form.password} />
          </label>
          <button disabled={loading} type="submit">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
