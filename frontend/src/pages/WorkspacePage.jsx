function WorkspacePage() {
  return (
    <section className="workspace">
      <div className="chat-panel">
        <div className="chat-header">
          <div>
            <p className="eyebrow">Practice</p>
            <h1>Conversation workspace</h1>
          </div>
          <span className="level-pill">A2</span>
        </div>

        <div className="chat-thread">
          <div className="message beaver-message">
            <span>BeaverUP</span>
            <p>Let us practice a simple travel conversation. Where would you like to go today?</p>
          </div>
          <div className="message user-message">
            <span>You</span>
            <p>I want go to train station.</p>
          </div>
          <div className="message beaver-message">
            <span>BeaverUP</span>
            <p>Native version: I want to go to the train station.</p>
            <p>Higher-level version: I would like to get to the train station.</p>
            <p>New question: How would you ask for a ticket?</p>
          </div>
        </div>

        <form className="chat-input">
          <input type="text" placeholder="Write your answer..." />
          <button type="button">Send</button>
        </form>
      </div>

      <aside className="side-card">
        <p className="eyebrow">Session settings</p>
        <label>
          Mode
          <select defaultValue="conversation">
            <option value="conversation">Conversation</option>
            <option value="story">Story</option>
            <option value="translate">Translate</option>
          </select>
        </label>
        <label>
          Language
          <input type="text" defaultValue="German" />
        </label>
        <label>
          Level
          <select defaultValue="A2">
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
            <option>C2</option>
          </select>
        </label>
        <label>
          Topic
          <input type="text" placeholder="Optional: travel, work, food..." />
        </label>
      </aside>
    </section>
  );
}

export default WorkspacePage;
