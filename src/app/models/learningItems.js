// --- Mock learning items database in-memory ---
let learningItems = [
    {
        itemId: 1,
        userId: 1,
        language: 'Spanish',
        type: 'phrase',
        sourceText: "I'd like to get to...",
        meaning: 'A polite way to say I want to go to...',
        context: 'travel conversation'
    },
    {
        itemId: 2,
        userId: 2,
        language: 'French',
        type: 'word',
        sourceText: 'boulangerie',
        meaning: 'bakery',
        context: 'daily errands'
    },
    {
        itemId: 3,
        userId: 1,
        language: 'Spanish',
        type: 'rewrite',
        sourceText: 'Could you tell me where the station is?',
        meaning: 'A natural way to ask for directions.',
        context: 'asking for directions'
    }
];

module.exports = learningItems;
