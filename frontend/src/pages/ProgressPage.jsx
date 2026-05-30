function ProgressPage() {
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
          <select defaultValue="all">
            <option value="all">All languages</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </label>
      </div>

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
            <tr>
              <td>Phrase</td>
              <td>Spanish</td>
              <td>I'd like to get to...</td>
              <td>A polite way to say I want to go to...</td>
              <td>Travel conversation</td>
            </tr>
            <tr>
              <td>Word</td>
              <td>French</td>
              <td>boulangerie</td>
              <td>Bakery</td>
              <td>Daily errands</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ProgressPage;
