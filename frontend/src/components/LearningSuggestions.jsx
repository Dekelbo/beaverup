import { useState } from 'react';
import { createLearningItem } from '../services/api';

// --- Render AI-curated save-worthy items for one interaction ---
function LearningSuggestions({ interactionId, language, onSaved, suggestions }) {
  const [savingKey, setSavingKey] = useState(null);
  const [savedKeys, setSavedKeys] = useState([]);
  const [error, setError] = useState('');

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const itemKey = item => `${item.type}:${item.sourceText}`;

  async function handleSave(item) {
    const key = itemKey(item);
    setError('');
    setSavingKey(key);

    try {
      await createLearningItem({
        language,
        type: item.type,
        sourceText: item.sourceText,
        meaning: item.meaning,
        context: item.context || null,
        interactionId
      });
      setSavedKeys(current => [...current, key]);
      onSaved?.(item);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  }

  const visibleSuggestions = suggestions.filter(item => !savedKeys.includes(itemKey(item)));

  if (visibleSuggestions.length === 0) {
    return <p className="suggestions-saved-note">Saved to your learning journal.</p>;
  }

  return (
    <div className="learning-suggestions">
      <p className="suggestions-heading">Suggested for your journal</p>
      {error && <p className="status-message error-message">{error}</p>}
      <div className="suggestion-list">
        {visibleSuggestions.map(item => (
          <div className="suggestion-chip" key={itemKey(item)}>
            <div className="suggestion-chip-text">
              <strong>⭐ {item.sourceText}</strong>
              <span>{item.meaning}</span>
            </div>
            <button disabled={savingKey === itemKey(item)} onClick={() => handleSave(item)} type="button">
              {savingKey === itemKey(item) ? 'Saving...' : 'Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LearningSuggestions;
