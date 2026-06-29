const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Mandarin Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Hindi',
  'Hebrew',
  'Dutch',
  'Turkish',
  'Polish',
  'Swedish',
  'Greek',
  'Thai',
  'Vietnamese'
];

function parseLanguages(value) {
  if (Array.isArray(value)) {
    return value.map(language => String(language).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map(language => language.trim())
    .filter(Boolean);
}

function formatLanguages(value) {
  return parseLanguages(value).join(', ');
}

function getLearningLanguages(user) {
  return parseLanguages(user?.languageToLearn);
}

export { COMMON_LANGUAGES, formatLanguages, getLearningLanguages, parseLanguages };
