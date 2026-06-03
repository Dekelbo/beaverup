import ModeCard from '../components/ModeCard';

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
  return (
    <section className="page">
      <div className="page-heading">
        <img className="dashboard-logo" src="/assets/main-logo.png" alt="BeaverUP" />
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome back, Dekel.</h1>
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
          <strong>German</strong>
        </div>
        <div>
          <span>Saved progress items</span>
          <strong>3</strong>
        </div>
        <div>
          <span>Current level</span>
          <strong>A2</strong>
        </div>
      </article>
    </section>
  );
}

export default DashboardPage;
