import { useState } from 'react';
import { COMMON_LANGUAGES, formatLanguages, parseLanguages } from '../utils/languages';

const MAX_LEARNING_LANGUAGES = 5;

function LanguageMultiSelect({
  allowSelectAll = false,
  id = 'languageToLearn',
  maxSelections = MAX_LEARNING_LANGUAGES,
  name,
  onChange,
  options = COMMON_LANGUAGES,
  placeholder,
  value
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguages = parseLanguages(value);
  const selectionLimit = maxSelections || options.length;
  const selectedLabel = selectedLanguages.length > 0
    ? formatLanguages(selectedLanguages)
    : placeholder || `Choose up to ${selectionLimit} languages`;

  function emitChange(nextLanguages) {
    onChange({
      target: {
        name,
        value: formatLanguages(nextLanguages)
      }
    });
  }

  function handleToggle(language) {
    const isSelected = selectedLanguages.includes(language);
    const nextLanguages = isSelected
      ? selectedLanguages.filter(selectedLanguage => selectedLanguage !== language)
      : [...selectedLanguages, language].slice(0, selectionLimit);

    emitChange(nextLanguages);
  }

  function handleSelectAll() {
    emitChange(options.slice(0, selectionLimit));
  }

  return (
    <div className="language-picker">
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="language-picker-button"
        id={id}
        onClick={() => setIsOpen(current => !current)}
        type="button"
      >
        <span>{selectedLabel}</span>
        <strong>{selectedLanguages.length}/{selectionLimit}</strong>
      </button>
      {isOpen && (
        <div aria-labelledby={id} className="language-picker-menu" role="listbox">
          <div className="language-picker-options">
            {allowSelectAll && options.length > 1 && (
              <button className="language-select-all" onClick={handleSelectAll} type="button">
                Select all
              </button>
            )}
            {options.map(language => {
              const isSelected = selectedLanguages.includes(language);
              const isDisabled = !isSelected && selectedLanguages.length >= selectionLimit;

              return (
                <label className="language-option" key={language}>
                  <input
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggle(language)}
                    type="checkbox"
                  />
                  <span>{language}</span>
                </label>
              );
            })}
          </div>
          <button className="language-picker-done" onClick={() => setIsOpen(false)} type="button">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export { MAX_LEARNING_LANGUAGES };
export default LanguageMultiSelect;
