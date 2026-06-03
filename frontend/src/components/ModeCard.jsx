import { Link } from 'react-router-dom';

// --- Render a reusable mode card ---
function ModeCard({ title, description, action, mode }) {
  return (
    <article className="mode-card">
      <div>
        <p className="eyebrow">Training mode</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Link className="primary-button" to={`/workspace?mode=${mode}`}>
        {action}
      </Link>
    </article>
  );
}

export default ModeCard;
