import { useTheme } from '../context/ThemeContext';

function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Settings</p>
        <h1>Profile and learning preferences.</h1>
        <p>Native language, target language, and CEFR level are editable here.</p>
      </div>

      <form className="settings-form">
        <label>
          First name
          <input type="text" defaultValue="Dekel" />
        </label>
        <label>
          Last name
          <input type="text" defaultValue="Boneh" />
        </label>
        <label>
          Email
          <input type="email" defaultValue="dekel@example.com" />
        </label>
        <label>
          Native language
          <input type="text" defaultValue="Hebrew" />
        </label>
        <label>
          Language to learn
          <input type="text" defaultValue="German" />
        </label>
        <label>
          Current level
          <select defaultValue="A2">
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
            <option>C2</option>
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
        <button type="button">Save changes</button>
      </form>
    </section>
  );
}

export default SettingsPage;
