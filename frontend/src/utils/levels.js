const LEVELS = [
  {
    code: 'A1',
    name: 'Beginner',
    description: 'Use basic survival language. Focus on simple greetings, personal details, numbers, objects, and very short present-tense sentences.'
  },
  {
    code: 'A1+',
    name: 'Explorer',
    description: 'Help the learner explore familiar topics with support. Focus on simple questions, short answers, basic descriptions, and confidence using known vocabulary.'
  },
  {
    code: 'A2',
    name: 'Elementary',
    description: 'Support everyday communication. Focus on routine situations like food, travel, work, shopping, hobbies, and simple past/future sentences.'
  },
  {
    code: 'A2+',
    name: 'Growing',
    description: 'Help the learner expand from short answers to small conversations. Focus on giving reasons, describing experiences, and using connectors like because, then, after, but.'
  },
  {
    code: 'B1',
    name: 'Intermediate',
    description: 'Build independent communication. Focus on stories, opinions, explanations, plans, problems, and conversations that continue for several turns.'
  },
  {
    code: 'B1+',
    name: 'Conversational',
    description: 'Develop smoother real-life speaking. Focus on fluency, natural phrasing, follow-up questions, and expressing thoughts without translating word by word.'
  },
  {
    code: 'B2',
    name: 'Independent',
    description: 'Challenge the learner with broader topics. Focus on clear arguments, comparisons, professional/social situations, and more precise vocabulary.'
  },
  {
    code: 'B2+',
    name: 'Confident',
    description: 'Refine natural expression. Focus on nuance, better word choice, collocations, idioms, and correcting awkward but understandable phrasing.'
  },
  {
    code: 'C1',
    name: 'Advanced',
    description: 'Push complex communication. Focus on abstract topics, structured arguments, tone, register, advanced vocabulary, and subtle grammar accuracy.'
  },
  {
    code: 'C1+',
    name: 'Fluent',
    description: 'Polish near-native communication. Focus on elegance, rhythm, idiomatic language, cultural references, and sounding natural in different contexts.'
  },
  {
    code: 'C2',
    name: 'Proficient',
    description: 'Use full native-level complexity. Focus on precision, sophistication, humor, persuasion, technical topics, and flexible formal/informal language.'
  },
  {
    code: 'C2+',
    name: 'Master',
    description: 'Treat the learner as almost native. Focus on refinement only: sharper wording, rhetorical strength, subtle nuance, style, and the most natural possible phrasing.'
  }
];

const LEVEL_VALUES = LEVELS.map(level => level.code);

function getLevelLabel(code) {
  const level = LEVELS.find(item => item.code === code);
  return level ? `${level.code} - ${level.name}` : code || 'Not set';
}

export { LEVELS, LEVEL_VALUES, getLevelLabel };
