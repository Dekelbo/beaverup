import { Link } from 'react-router-dom';

// --- Render signup form ---
function SignupPage() {
  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <img className="auth-logo" src="/assets/main-logo.png" alt="BeaverUP" />
        <p className="eyebrow">Create account</p>
        <h1>Start building natural fluency.</h1>
        <form className="form-grid">
          <label>
            First name
            <input type="text" required />
          </label>
          <label>
            Last name
            <input type="text" required />
          </label>
          <label>
            Email
            <input type="email" required />
          </label>
          <label>
            Password
            <input type="password" minLength="6" required />
          </label>
          <label>
            Language to learn
            <input type="text" placeholder="Spanish, German, English..." required />
          </label>
          <label>
            Current level
            <select defaultValue="A2" required>
              <option>A1</option>
              <option>A2</option>
              <option>B1</option>
              <option>B2</option>
              <option>C1</option>
              <option>C2</option>
            </select>
          </label>
          <Link className="primary-button span-two" to="/dashboard">
            Sign up
          </Link>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default SignupPage;
