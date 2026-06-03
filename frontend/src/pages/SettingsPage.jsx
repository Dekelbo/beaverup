import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getCurrentUser, updateCurrentUser } from '../services/api';

const emptyUser = {
  firstName: '',
  lastName: '',
  userRole: 'user',
  userNativeLanguage: '',
  languageToLearn: '',
  currentLevel: 'A1',
  email: ''
};

// --- Render profile and theme settings ---
function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [form, setForm] = useState(emptyUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // --- Load user settings ---
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setForm(user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // --- Update local form state ---
  function handleChange(event) {
    const { name, value } = event.target;
    setForm(currentForm => ({ ...currentForm, [name]: value }));
  }

  // --- Save user settings ---
  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updatedUser = await updateCurrentUser(form);
      setForm(updatedUser);
      setMessage('Settings saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Settings</p>
        <h1>Profile and learning preferences.</h1>
        <p>Native language, target language, and CEFR level are editable here.</p>
      </div>

      {loading && <p className="status-message">Loading settings...</p>}
      {error && <p className="status-message error-message">{error}</p>}
      {message && <p className="status-message success-message">{message}</p>}

      <form className="settings-form" onSubmit={handleSubmit}>
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
          <input name="email" onChange={handleChange} required type="email" value={form.email || ''} />
        </label>
        <label>
          Native language
          <input name="userNativeLanguage" onChange={handleChange} required type="text" value={form.userNativeLanguage} />
        </label>
        <label>
          Language to learn
          <input name="languageToLearn" onChange={handleChange} required type="text" value={form.languageToLearn} />
        </label>
        <label>
          Current level
          <select name="currentLevel" onChange={handleChange} value={form.currentLevel}>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </label>
        <div className="setting-toggle span-two">
          <div>
            <strong>Dark mode</strong>
            <span>Use a quieter dark workshop theme across BeaverUP.</span>
          </div>
          <button
            aria-pressed={isDarkMode}
            className={`switch ${isDarkMode ? 'is-on' : ''}`}
            onClick={toggleTheme}
            type="button"
          >
            <span>{isDarkMode ? 'On' : 'Off'}</span>
          </button>
        </div>
        <button disabled={saving || loading} type="submit">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}

export default SettingsPage;
