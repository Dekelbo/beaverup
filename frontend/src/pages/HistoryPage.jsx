function HistoryPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">History</p>
        <h1>Review previous practice chats.</h1>
        <p>Past interactions are shown like conversations so they are easy to revisit.</p>
      </div>

      <div className="history-list">
        <article className="history-card">
          <div className="history-meta">Conversation · Spanish · B1 · Travel</div>
          <div className="message user-message">
            <span>You</span>
            <p>I want go to train station.</p>
          </div>
          <div className="message beaver-message">
            <span>BeaverUP</span>
            <p>Native version: I want to go to the train station.</p>
            <p>Higher-level version: I'd like to get to the train station.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default HistoryPage;
