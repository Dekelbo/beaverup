// --- Mock interactions database in-memory ---
let interactions = [
    {
        interactionId: 1,
        userId: 1,
        mode: 'conversation',
        interactionType: 'conversation_turn',
        language: 'Spanish',
        level: 'B1',
        topic: 'travel',
        previousTopic: null,
        previousInteractionId: null,
        wordGroup: [],
        userInput: 'I want go to train station',
        nativeRewrite: 'I want to go to the train station.',
        higherLevelRewrite: "I'd like to get to the train station.",
        storyText: null,
        wordTranslations: [],
        translation: null,
        learningItems: [
            {
                type: 'phrase',
                sourceText: "I'd like to get to...",
                meaning: 'A polite way to say I want to go to...'
            }
        ],
        nextPrompt: 'How would you ask for a ticket?'
    },
    {
        interactionId: 2,
        userId: 2,
        mode: 'translate',
        interactionType: 'translate_request',
        language: 'French',
        level: 'A2',
        topic: 'food',
        previousTopic: null,
        previousInteractionId: null,
        wordGroup: [],
        userInput: 'Where is the bakery?',
        nativeRewrite: null,
        higherLevelRewrite: null,
        storyText: null,
        wordTranslations: [],
        translation: {
            French: 'Ou est la boulangerie?'
        },
        learningItems: [
            {
                type: 'word',
                sourceText: 'boulangerie',
                meaning: 'bakery'
            }
        ],
        nextPrompt: null
    },
    {
        interactionId: 3,
        userId: 1,
        mode: 'story',
        interactionType: 'story_start',
        language: 'Spanish',
        level: 'A1',
        topic: 'family',
        previousTopic: null,
        previousInteractionId: null,
        wordGroup: ['Hola', 'casa', 'madre'],
        userInput: null,
        nativeRewrite: null,
        higherLevelRewrite: null,
        storyText: 'Mock A1 Spanish story about family that uses Hola, casa, madre.',
        wordTranslations: [
            { sourceText: 'Hola', translation: 'Mock Spanish translation for Hola' },
            { sourceText: 'casa', translation: 'Mock Spanish translation for casa' },
            { sourceText: 'madre', translation: 'Mock Spanish translation for madre' }
        ],
        translation: null,
        learningItems: [
            {
                type: 'word',
                sourceText: 'madre',
                meaning: 'mother'
            }
        ],
        nextPrompt: 'Which words or phrases were difficult or interesting?'
    },
    {
        interactionId: 4,
        userId: 1,
        mode: 'story',
        interactionType: 'story_followup',
        language: 'Spanish',
        level: 'A1',
        topic: 'market',
        previousTopic: 'family',
        previousInteractionId: 3,
        wordGroup: [],
        userInput: 'madre, casa',
        nativeRewrite: null,
        higherLevelRewrite: null,
        storyText: 'Mock A1 Spanish story about a new topic different from family that uses madre, casa.',
        wordTranslations: [
            { sourceText: 'madre', translation: 'Mock Spanish translation for madre' },
            { sourceText: 'casa', translation: 'Mock Spanish translation for casa' }
        ],
        translation: null,
        learningItems: [
            {
                type: 'word',
                sourceText: 'casa',
                meaning: 'house'
            }
        ],
        nextPrompt: 'Which words or phrases were difficult or interesting?'
    }
];

module.exports = interactions;
