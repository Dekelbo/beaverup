import { useEffect, useState } from 'react';
import { deleteInteraction, getInteractions } from '../services/api';

// --- Render previous practice chats ---
function HistoryPage() {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // --- Load interaction history ---
  useEffect(() => {
    async function loadInteractions() {
      try {
        const userInteractions = await getInteractions();
        setInteractions(userInteractions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInteractions();
  }, []);

  async function handleDelete(interactionId) {
    setError('');
    setMessage('');
    setDeletingId(interactionId);

    try {
      await deleteInteraction(interactionId);
      setInteractions(currentInteractions =>
        currentInteractions.filter(interaction => interaction.interactionId !== interactionId)
      );
      setMessage('Interaction deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">History</p>
        <h1>Review previous practice chats.</h1>
        <p>Past interactions are shown like conversations so they are easy to revisit.</p>
      </div>

      {loading && <p className="status-message">Loading history...</p>}
      {error && <p className="status-message error-message">{error}</p>}
      {message && <p className="status-message success-message">{message}</p>}

      <div className="history-list">
        {interactions.map(interaction => (
          <article className="history-card" key={interaction.interactionId}>
            <div className="history-card-header">
              <div className="history-meta">
                {interaction.mode} | {interaction.language} | {interaction.level} | {interaction.topic || 'General'}
              </div>
              <button disabled={deletingId === interaction.interactionId} onClick={() => handleDelete(interaction.interactionId)} type="button">
                {deletingId === interaction.interactionId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {interaction.userInput && (
              <div className="message user-message">
                <span>You</span>
                <p>{interaction.userInput}</p>
              </div>
            )}
            <div className="message beaver-message">
              <span>BeaverUP</span>
              {interaction.nativeRewrite && <p>Native version: {interaction.nativeRewrite}</p>}
              {interaction.higherLevelRewrite && <p>Higher-level version: {interaction.higherLevelRewrite}</p>}
              {interaction.storyText && <p>{interaction.storyText}</p>}
              {interaction.translation &&
                Object.entries(interaction.translation).map(([language, translation]) => (
                  <p key={language}>
                    {language}: {translation}
                  </p>
                ))}
              {interaction.nextPrompt && <p>Next: {interaction.nextPrompt}</p>}
            </div>
          </article>
        ))}
        {!loading && interactions.length === 0 && <p className="status-message">No history yet.</p>}
      </div>
    </section>
  );
}

export default HistoryPage;
