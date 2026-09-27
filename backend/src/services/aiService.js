const OpenAI = require('openai');
const env = require('../config/env');
const { getLevelDetails } = require('../utils/levels');

const client = env.ai.apiKey
    ? new OpenAI({
          apiKey: env.ai.apiKey
      })
    : null;

const jsonSchema = {
    name: 'beaverup_practice_response',
    schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
            displayMessage: { type: ['string', 'null'] },
            nativeRewrite: { type: ['string', 'null'] },
            higherLevelRewrite: { type: ['string', 'null'] },
            storyText: { type: ['string', 'null'] },
            wordTranslations: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        sourceText: { type: 'string' },
                        translation: { type: 'string' }
                    },
                    required: ['sourceText', 'translation']
                }
            },
            translation: {
                type: ['object', 'null'],
                additionalProperties: { type: 'string' }
            },
            learningItems: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        type: { type: 'string', enum: ['word', 'phrase', 'rewrite', 'expression', 'grammar', 'culture', 'song'] },
                        sourceText: { type: 'string' },
                        meaning: { type: 'string' },
                        context: { type: ['string', 'null'] }
                    },
                    required: ['type', 'sourceText', 'meaning', 'context']
                }
            },
            glossary: {
                type: 'array',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        sourceText: { type: 'string' },
                        translation: { type: 'string' }
                    },
                    required: ['sourceText', 'translation']
                }
            },
            nextPrompt: { type: ['string', 'null'] },
            nextPromptTranslation: { type: ['string', 'null'] }
        },
        required: [
            'displayMessage',
            'nativeRewrite',
            'higherLevelRewrite',
            'storyText',
            'wordTranslations',
            'translation',
            'learningItems',
            'glossary',
            'nextPrompt',
            'nextPromptTranslation'
        ]
    },
    strict: true
};

const getSystemInstructions = () => {
    return [
        'You are BeaverUP, a warm and intelligent CEFR-based language coach for spoken fluency.',
        'Return only valid JSON that matches the provided schema.',
        'Use the selected mode exactly: conversation, story, or translate.',
        'Always write displayMessage as the natural, human-facing message the learner sees: friendly, calm, encouraging, and easy to understand. Never mention technical concepts like source, context, database, record, or field. Include a short positive reinforcement, the polished version (quoted in the target language), and a concise explanation of the most meaningful improvements when there is a rewrite to explain. Write displayMessage itself in the learner\'s native language (given as nativeLanguage) so the coaching is always fully understood, except for quoted target-language phrases and the next question itself, which stay in the target language.',
        'Write glossary and learningItems meanings/translations in the learner\'s native language (nativeLanguage), never in the target language.',
        'Conversation mode with no userInput: start the session by returning only one first question in nextPrompt (and its translation in nextPromptTranslation), a short friendly displayMessage introducing the question. Leave rewrites null and learningItems and glossary empty.',
        'Conversation mode with userInput: always return nativeRewrite and higherLevelRewrite for the exact userInput, wordTranslations as an empty array, translation as null, and exactly one nextPrompt with its nextPromptTranslation.',
        'Story mode: generate storyText up to 100 words, return wordTranslations for requested words, ask which words or phrases were difficult or interesting in displayMessage.',
        'Story follow-up: use a topic completely different from the previousTopic when provided.',
        'Translate mode: return direct natural translations in translation, with no long explanation. Include at most two options for ambiguous terms.',
        'Curate learningItems carefully: propose at most 3 items, and only when they are genuinely worth remembering (useful new vocabulary, natural expressions, reusable phrases, recurring mistakes). Never include punctuation fixes, trivial wording changes, or vocabulary the learner already clearly knows at their level. It is fine and expected to return an empty array when nothing is worth saving.',
        'Whenever nextPrompt (or storyText) is present, also return glossary: 3-6 words or short phrases from that text that are likely difficult for the learner\'s stated level and native language, each with a short translation into the learner\'s native language. Do not explain basic words the learner already knows at their level. Return an empty array when nothing needs explaining.',
        'If recentTurns is provided, use it only to keep the topic coherent and ask better follow-up questions - do not repeat earlier questions or re-explain things already covered.',
        'If avoidRepeating is provided, generate a different question or story angle than the one described there, at the same language, level, and topic.',
        'Prioritize natural expression, structure, grammar, and precision. Keep tone professional, direct, and efficient.'
    ].join('\n');
};

const buildUserPrompt = interaction => {
    const levelDetails = getLevelDetails(interaction.level);
    const nativeLanguage = interaction.nativeLanguage || null;

    return JSON.stringify(
        {
            task: 'Create a BeaverUP practice response.',
            instruction: nativeLanguage
                ? `Write displayMessage's coaching text, every glossary translation, and every learningItems meaning in ${nativeLanguage}. Only the target-language phrases you are quoting or asking (the polished sentence, the nextPrompt question, storyText) should be in ${interaction.language}. Do not write displayMessage in ${interaction.language}.`
                : undefined,
            mode: interaction.mode,
            interactionType: interaction.interactionType,
            language: interaction.language,
            level: interaction.level,
            levelDetails,
            nativeLanguage,
            topic: interaction.topic || null,
            previousTopic: interaction.previousTopic || null,
            wordGroup: interaction.wordGroup || [],
            userInput: interaction.userInput || null,
            recentTurns: interaction.recentTurns || [],
            avoidRepeating: interaction.avoidRepeating || null
        },
        null,
        2
    );
};

const parseAiJson = response => {
    const outputText = response.output_text || '';
    try {
        return JSON.parse(outputText);
    } catch (error) {
        const invalidResponseError = new Error('AI response was not valid JSON.');
        invalidResponseError.code = 'AI_INVALID_RESPONSE';
        throw invalidResponseError;
    }
};

const ensurePracticeShape = result => {
    return {
        displayMessage: result.displayMessage || null,
        nativeRewrite: result.nativeRewrite || null,
        higherLevelRewrite: result.higherLevelRewrite || null,
        storyText: result.storyText || null,
        wordTranslations: Array.isArray(result.wordTranslations) ? result.wordTranslations : [],
        translation: result.translation || null,
        learningItems: Array.isArray(result.learningItems) ? result.learningItems.slice(0, 3) : [],
        glossary: Array.isArray(result.glossary) ? result.glossary : [],
        nextPrompt: result.nextPrompt || null,
        nextPromptTranslation: result.nextPromptTranslation || null
    };
};

const normalizeModeResult = (interaction, result) => {
    const shapedResult = ensurePracticeShape(result);
    const hasUserInput = Boolean(String(interaction.userInput || '').trim());

    if (interaction.mode === 'conversation') {
        return {
            ...shapedResult,
            storyText: null,
            wordTranslations: [],
            translation: null,
            learningItems: hasUserInput ? shapedResult.learningItems : []
        };
    }

    return shapedResult;
};

const generatePracticeResponse = async interaction => {
    if (!client || env.ai.apiKey.includes('replace_with')) {
        const error = new Error('AI API key is not configured.');
        error.code = 'AI_NOT_CONFIGURED';
        throw error;
    }

    try {
        const response = await client.responses.create({
            model: env.ai.model,
            max_output_tokens: env.ai.maxOutputTokens,
            input: [
                {
                    role: 'system',
                    content: getSystemInstructions()
                },
                {
                    role: 'user',
                    content: buildUserPrompt(interaction)
                }
            ],
            text: {
                format: {
                    type: 'json_schema',
                    ...jsonSchema
                }
            }
        });

        return normalizeModeResult(interaction, parseAiJson(response));
    } catch (error) {
        if (error.code === 'AI_INVALID_RESPONSE') {
            throw error;
        }

        if (error.code === 'insufficient_quota') {
            const quotaError = new Error('OpenAI quota is exceeded.');
            quotaError.code = 'AI_QUOTA_EXCEEDED';
            throw quotaError;
        }

        if (error.status === 401) {
            const authError = new Error('OpenAI API key was rejected.');
            authError.code = 'AI_AUTH_FAILED';
            throw authError;
        }

        if (error.status === 429) {
            const rateLimitError = new Error('OpenAI rate limit was reached.');
            rateLimitError.code = 'AI_RATE_LIMITED';
            throw rateLimitError;
        }

        const requestError = new Error('OpenAI request failed.');
        requestError.code = 'AI_REQUEST_FAILED';
        throw requestError;
    }
};

module.exports = {
    generatePracticeResponse
};
