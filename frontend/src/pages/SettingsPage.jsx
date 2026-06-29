import { useEffect, useState } from 'react';
import LanguageMultiSelect from '../components/LanguageMultiSelect';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrentUser } from '../services/api';
import { COMMON_LANGUAGES, parseLanguages } from '../utils/languages';
import { LEVELS } from '../utils/levels';

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
  const { updateUser } = useAuth();
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
    setMessage('');
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required.');
      return;
    }

    if (!form.email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (!form.userNativeLanguage.trim()) {
      setError('Native language is required.');
      return;
    }

    if (parseLanguages(form.languageToLearn).length === 0) {
      setError('Choose at least one language to learn.');
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateUser(form);
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
          <select name="currentLevel" onChange={handleChange} value={form.currentLevel}>
            {LEVELS.map(level => (
              <option key={level.code} value={level.code}>
                {level.code} - {level.name}
              </option>
            ))}
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
