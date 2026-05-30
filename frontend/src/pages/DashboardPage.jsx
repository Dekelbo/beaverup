import ModeCard from '../components/ModeCard';

const modes = [
  {
    title: 'Conversation',
    description: 'Practice real answers, get a more natural version, then keep the conversation moving.',
    action: 'Start talking'
  },
  {
    title: 'Story',
    description: 'Read a short story at your level, choose interesting words, and meet them again in a new story.',
    action: 'Read a story'
  },
  {
    title: 'Translate',
    description: 'Turn words or phrases into natural language across several languages at once.',
    action: 'Translate text'
  }
];

function DashboardPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome back, Dekel.</h1>
        <p>Choose how you want to train today.</p>
      </div>

      <div className="stats-grid">
        <article>
          <strong>4</strong>
          <span>Practice sessions</span>
        </article>
        <article>
          <strong>3</strong>
          <span>Saved progress items</span>
        </article>
        <article>
          <strong>A2</strong>
          <span>Current learning level</span>
        </article>
      </div>

      <div className="mode-grid">
        {modes.map(mode => (
          <ModeCard key={mode.title} {...mode} />
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
