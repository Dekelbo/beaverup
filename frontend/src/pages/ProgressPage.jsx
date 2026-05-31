import { useEffect, useMemo, useState } from 'react';
import { getLearningItems } from '../services/api';

// --- Render learning progress table ---
function ProgressPage() {
  const [items, setItems] = useState([]);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Load learning items ---
  useEffect(() => {
    async function loadItems() {
      try {
        const learningItems = await getLearningItems();
        setItems(learningItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  const languages = useMemo(() => [...new Set(items.map(item => item.language))], [items]);
  const filteredItems = languageFilter === 'all' ? items : items.filter(item => item.language === languageFilter);

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Progress shelf</p>
        <h1>Your collected learning items.</h1>
        <p>Words, phrases, rewrites, and expressions from your practice sessions will appear here.</p>
      </div>

      <div className="filter-bar">
        <label>
          Filter by language
          <select onChange={event => setLanguageFilter(event.target.value)} value={languageFilter}>
            <option value="all">All languages</option>
            {languages.map(language => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="status-message">Loading progress...</p>}
      {error && <p className="status-message error-message">{error}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Language</th>
              <th>Source</th>
              <th>Meaning</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.itemId}>
                <td>{item.type}</td>
                <td>{item.language}</td>
                <td>{item.sourceText}</td>
                <td>{item.meaning}</td>
                <td>{item.context || 'General'}</td>
              </tr>
            ))}
            {!loading && filteredItems.length === 0 && (
              <tr>
                <td colSpan="5">No progress items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ProgressPage;
