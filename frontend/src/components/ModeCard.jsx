// --- Render a reusable mode card ---
function ModeCard({ title, description, action }) {
  return (
    <article className="mode-card">
      <div>
        <p className="eyebrow">Training mode</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <button type="button">{action}</button>
    </article>
  );
}

export default ModeCard;
