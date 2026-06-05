import { useEffect, useState } from 'react';
import ModeCard from '../components/ModeCard';
import { useAuth } from '../context/AuthContext';
import { getLearningItems } from '../services/api';

// --- Define available practice modes ---
const modes = [
  {
    title: 'Conversation',
    mode: 'conversation',
    description: 'Practice real answers, get a more natural version, then keep the conversation moving.',
    action: 'Start talking'
  },
  {
    title: 'Story',
    mode: 'story',
    description: 'Read a short story at your level, choose interesting words, and meet them again in a new story.',
    action: 'Read a story'
  },
  {
    title: 'Translate',
    mode: 'translate',
    description: 'Turn words or phrases into natural language across several languages at once.',
    action: 'Translate text'
  }
];

// --- Render mode selection dashboard ---
function DashboardPage() {
  const { authSource, user } = useAuth();
  const [progressCount, setProgressCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState('');

  // --- Load progress summary ---
  useEffect(() => {
    async function loadProgressCount() {
      try {
        const learningItems = await getLearningItems();
        setProgressCount(learningItems.length);
      } catch (err) {
        setProgressError(err.message);
      } finally {
        setLoadingProgress(false);
      }
    }

    loadProgressCount();
  }, []);

  return (
    <section className="page">
      <div className="page-heading">
        <img className="dashboard-logo" src="/assets/main-logo.png" alt="BeaverUP" />
        <p className="eyebrow">Dashboard</p>
        <h1>{authSource === 'signup' ? 'Welcome' : 'Welcome back'}, {user?.firstName || 'friend'}.</h1>
        <p>Choose how you want to train today.</p>
      </div>

      <div className="mode-grid">
        {modes.map(mode => (
          <ModeCard key={mode.title} {...mode} />
        ))}
      </div>

      <article className="learning-summary">
        <div>
          <span>Current language</span>
          <strong>{user?.languageToLearn || 'Not set'}</strong>
        </div>
        <div>
          <span>Saved progress items</span>
          <strong>{loadingProgress ? '...' : progressCount}</strong>
        </div>
        <div>
          <span>Current level</span>
          <strong>{user?.currentLevel || 'Not set'}</strong>
        </div>
      </article>
      {progressError && <p className="status-message error-message">{progressError}</p>}
    </section>
  );
}

export default DashboardPage;
