import { useState } from 'react';
import { submitDifficultyFeedback } from '../services/api';

const options = [
  { value: 'too_easy', label: 'Too easy' },
  { value: 'just_right', label: 'Just right' },
  { value: 'too_hard', label: 'Too hard' }
];

// --- Collect a lightweight difficulty signal for one exercise ---
function DifficultyFeedback({ interactionId, onResult }) {
  const [sending, setSending] = useState(false);
  const [sentValue, setSentValue] = useState(null);
  const [error, setError] = useState('');

  async function handleClick(value) {
    if (sentValue) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const result = await submitDifficultyFeedback(interactionId, value);
      setSentValue(value);
      onResult?.(result.levelSuggestion);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="difficulty-feedback">
      <p className="difficulty-feedback-heading">{sentValue ? 'Thanks for the feedback.' : 'How was this?'}</p>
      {error && <p className="status-message error-message">{error}</p>}
      <div className="difficulty-feedback-buttons">
        {options.map(option => (
          <button
            className={`difficulty-button ${sentValue === option.value ? 'is-selected' : ''}`}
            disabled={sending || Boolean(sentValue)}
            key={option.value}
            onClick={() => handleClick(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DifficultyFeedback;
