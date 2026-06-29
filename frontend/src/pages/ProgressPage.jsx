import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createLearningItem, deleteLearningItem, getLearningItems, updateLearningItem } from '../services/api';
import { getLearningLanguages } from '../utils/languages';

const emptyItemForm = {
  language: '',
  type: 'word',
  sourceText: '',
  meaning: '',
  context: ''
};

// --- Render learning progress table ---
function ProgressPage() {
  const { user } = useAuth();
  const learningLanguages = getLearningLanguages(user);
  const defaultLanguage = learningLanguages[0] || '';
  const [items, setItems] = useState([]);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ ...emptyItemForm, language: defaultLanguage });
  const [editingId, setEditingId] = useState(null);

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

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm(currentForm => ({ ...currentForm, [name]: value }));
  }

  function resetForm() {
    setForm({ ...emptyItemForm, language: defaultLanguage });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.language.trim() || !form.sourceText.trim() || !form.meaning.trim()) {
      setError('Language, source, and meaning are required.');
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const updatedItem = await updateLearningItem(editingId, form);
        setItems(currentItems => currentItems.map(item => (item.itemId === editingId ? updatedItem : item)));
        setMessage('Learning item updated.');
      } else {
        const createdItem = await createLearningItem(form);
        setItems(currentItems => [...currentItems, createdItem]);
        setMessage('Learning item added.');
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.itemId);
    setForm({
      language: item.language,
      type: item.type,
      sourceText: item.sourceText,
      meaning: item.meaning,
      context: item.context || ''
    });
    setMessage('');
    setError('');
  }

  async function handleDelete(itemId) {
    setError('');
    setMessage('');

    try {
      await deleteLearningItem(itemId);
      setItems(currentItems => currentItems.filter(item => item.itemId !== itemId));
      setMessage('Learning item deleted.');

      if (editingId === itemId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Progress shelf</p>
        <h1>Your collected learning items.</h1>
        <p>Words, phrases, rewrites, and expressions from your practice sessions will appear here.</p>
      </div>

      <div className="filter-bar">
        <form className="inline-form" onSubmit={handleSubmit}>
          <label>
            Language
            <select name="language" onChange={handleFormChange} value={form.language}>
              {learningLanguages.length === 0 && <option value="">Choose languages in settings first</option>}
              {learningLanguages.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select name="type" onChange={handleFormChange} value={form.type}>
              <option value="word">word</option>
              <option value="phrase">phrase</option>
              <option value="rewrite">rewrite</option>
              <option value="expression">expression</option>
            </select>
          </label>
          <label>
            Source
            <input name="sourceText" onChange={handleFormChange} placeholder="Useful word or phrase" value={form.sourceText} />
          </label>
          <label>
            Meaning
            <input name="meaning" onChange={handleFormChange} placeholder="Short meaning" value={form.meaning} />
          </label>
          <label>
            Context
            <input name="context" onChange={handleFormChange} placeholder="Optional" value={form.context} />
          </label>
          <div className="inline-actions">
            <button disabled={saving} type="submit">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button onClick={resetForm} type="button">
                Cancel
              </button>
            )}
          </div>
        </form>

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
      {message && <p className="status-message success-message">{message}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Language</th>
              <th>Source</th>
              <th>Meaning</th>
              <th>Context</th>
              <th>Actions</th>
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
                <td>
                  <div className="table-actions">
                    <button onClick={() => startEdit(item)} type="button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.itemId)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredItems.length === 0 && (
              <tr>
                <td colSpan="6">No progress items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ProgressPage;
