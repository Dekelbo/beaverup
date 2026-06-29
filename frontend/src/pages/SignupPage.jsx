import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageMultiSelect from '../components/LanguageMultiSelect';
import { useAuth } from '../context/AuthContext';
import { COMMON_LANGUAGES, parseLanguages } from '../utils/languages';
import { LEVELS } from '../utils/levels';

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
    setError('');

    const missingField = Object.entries(form).some(([key, value]) => key !== 'languageToLearn' && !String(value).trim());
    if (missingField) {
      setError('Fill in all signup fields.');
      return;
    }

    if (parseLanguages(form.languageToLearn).length === 0) {
      setError('Choose at least one language to learn.');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

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
            <select name="userNativeLanguage" onChange={handleChange} required value={form.userNativeLanguage}>
              <option value="">Choose your native language</option>
              {COMMON_LANGUAGES.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
          <label>
            Languages to learn
            <LanguageMultiSelect name="languageToLearn" onChange={handleChange} value={form.languageToLearn} />
          </label>
          <label>
            Current level
            <select name="currentLevel" onChange={handleChange} required value={form.currentLevel}>
              {LEVELS.map(level => (
                <option key={level.code} value={level.code}>
                  {level.code} - {level.name}
                </option>
              ))}
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
