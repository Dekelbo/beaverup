import { useState } from 'react';

// --- Small helper controls near the current question ---
function HelperToolbar({ glossary, nextPromptTranslation, onChangeQuestion, sendingChangeQuestion, showChangeQuestion }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const hasGlossary = glossary && glossary.length > 0;

  return (
    <div className="helper-toolbar">
      <div className="helper-toolbar-buttons">
        {nextPromptTranslation && (
          <button
            className="helper-button"
            onClick={() => setShowTranslation(current => !current)}
            type="button"
          >
            {showTranslation ? 'Hide translation' : 'Show translation'}
          </button>
        )}
        {hasGlossary && (
          <button className="helper-button" onClick={() => setShowGlossary(current => !current)} type="button">
            {showGlossary ? 'Hide difficult words' : 'Explain difficult words'}
          </button>
        )}
        {showChangeQuestion && (
          <button className="helper-button" disabled={sendingChangeQuestion} onClick={onChangeQuestion} type="button">
            {sendingChangeQuestion ? 'Changing...' : 'Change question'}
          </button>
        )}
      </div>

      {showTranslation && nextPromptTranslation && <p className="helper-translation">{nextPromptTranslation}</p>}

      {showGlossary && hasGlossary && (
        <div className="glossary-list">
          {glossary.map(entry => (
            <span className="glossary-term" key={entry.sourceText}>
              <strong>{entry.sourceText}</strong> — {entry.translation}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default HelperToolbar;
