const OpenAI = require('openai');
const env = require('../config/env');

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
                        type: { type: 'string', enum: ['word', 'phrase', 'rewrite', 'expression'] },
                        sourceText: { type: 'string' },
                        meaning: { type: 'string' },
                        context: { type: ['string', 'null'] }
                    },
                    required: ['type', 'sourceText', 'meaning', 'context']
                }
            },
            nextPrompt: { type: ['string', 'null'] }
        },
        required: [
            'nativeRewrite',
            'higherLevelRewrite',
            'storyText',
            'wordTranslations',
            'translation',
            'learningItems',
            'nextPrompt'
        ]
    },
    strict: true
};

const getSystemInstructions = () => {
    return [
        'You are BeaverUP, a structured CEFR-based language performance trainer for spoken fluency.',
        'Return only valid JSON that matches the provided schema.',
        'Use the selected mode exactly: conversation, story, or translate.',
        'Conversation mode with no userInput: start the session by returning only one first question in nextPrompt. Leave rewrites null and learningItems empty.',
        'Conversation mode with userInput: always return nativeRewrite and higherLevelRewrite for the exact userInput, return wordTranslations as an empty array, return translation as null, return 3 useful learningItems, and return exactly one nextPrompt.',
        'Story mode: generate storyText up to 100 words, return wordTranslations for requested words, return useful learningItems, and ask which words or phrases were difficult or interesting.',
        'Story follow-up: use a topic completely different from the previousTopic when provided.',
        'Translate mode: return direct natural translations in translation, with no long explanation. Include at most two options for ambiguous terms.',
        'Prioritize natural expression, structure, grammar, and precision. Keep tone professional, direct, and efficient.'
    ].join('\n');
};

const buildUserPrompt = interaction => {
    return JSON.stringify(
        {
            task: 'Create a BeaverUP practice response.',
            mode: interaction.mode,
            interactionType: interaction.interactionType,
            language: interaction.language,
            level: interaction.level,
            topic: interaction.topic || null,
            previousTopic: interaction.previousTopic || null,
            wordGroup: interaction.wordGroup || [],
            userInput: interaction.userInput || null
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
        nativeRewrite: result.nativeRewrite || null,
        higherLevelRewrite: result.higherLevelRewrite || null,
        storyText: result.storyText || null,
        wordTranslations: Array.isArray(result.wordTranslations) ? result.wordTranslations : [],
        translation: result.translation || null,
        learningItems: Array.isArray(result.learningItems) ? result.learningItems : [],
        nextPrompt: result.nextPrompt || null
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
