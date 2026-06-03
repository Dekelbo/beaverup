import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  userNativeLanguage: '',
  languageToLearn: '',
  currentLevel: 'A2'
};

// --- Render signup form ---
function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Update signup form ---
  function handleChange(event) {
    const { name, value } = event.target;
    setForm(currentForm => ({ ...currentForm, [name]: value }));
  }

  // --- Submit signup request ---
  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <img className="auth-logo" src="/assets/main-logo.png" alt="BeaverUP" />
        <p className="eyebrow">Create account</p>
        <h1>Start building natural fluency.</h1>
        {error && <p className="status-message error-message">{error}</p>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            First name
            <input name="firstName" onChange={handleChange} required type="text" value={form.firstName} />
          </label>
          <label>
            Last name
            <input name="lastName" onChange={handleChange} required type="text" value={form.lastName} />
          </label>
          <label>
            Email
            <input name="email" onChange={handleChange} required type="email" value={form.email} />
          </label>
          <label>
            Password
            <input name="password" onChange={handleChange} minLength="6" required type="password" value={form.password} />
          </label>
          <label>
            Native language
            <input name="userNativeLanguage" onChange={handleChange} placeholder="Hebrew, English, Spanish..." required type="text" value={form.userNativeLanguage} />
          </label>
          <label>
            Language to learn
            <input name="languageToLearn" onChange={handleChange} placeholder="Spanish, German, English..." required type="text" value={form.languageToLearn} />
          </label>
          <label>
            Current level
            <select name="currentLevel" onChange={handleChange} required value={form.currentLevel}>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </label>
          <button className="span-two" disabled={loading} type="submit">
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default SignupPage;
