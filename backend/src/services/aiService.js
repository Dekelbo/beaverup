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
'displayMessage is the ONLY coaching text the learner reads - the app shows nextPrompt, storyText, and translation separately on their own, so never restate or re-quote those. When there is a userInput to react to, displayMessage must fully stand on its own and cover everything needed in natural prose: a short positive reinforcement, then exactly one of these two cases - (a) if nativeRewrite is identical or almost identical to userInput (nothing meaningful to fix), say explicitly that it already sounds natural/correct, do NOT invent a correction just to have one; (b) if nativeRewrite genuinely differs from userInput, state what was fixed and quote the corrected sentence in the target language. After that, if higherLevelRewrite offers a genuinely more fluent/advanced alternative beyond nativeRewrite, mention it as an optional upgrade ("a more advanced way to say this:") quoted in the target language - never frame it as a required correction. Never mention technical concepts like source, context, database, record, or field. Never leave displayMessage empty - write a short encouraging line when there is nothing to react to (e.g. the first message of a session). Write displayMessage entirely in the learner\'s native language (given as nativeLanguage) - never in the target language - with full grammatical correctness for that language (correct gender, number, and verb agreement, natural word order); proofread it mentally before finalizing.',
        'Write glossary and learningItems meanings/translations in the learner\'s native language (nativeLanguage), with the same full grammatical correctness, never in the target language.',
        'Conversation mode with no userInput: start the session by returning only one first question in nextPrompt (and its translation in nextPromptTranslation) in the target language, and a short friendly displayMessage in nativeLanguage that does not repeat the question. Leave rewrites null and learningItems and glossary empty.',
        'Conversation mode with userInput: set nativeRewrite to userInput unchanged when it is already natural and correct for the learner\'s level - do not force a different rewrite just to have one. Only make nativeRewrite differ from userInput when a real correction is needed. Always also return higherLevelRewrite as an optional more-fluent alternative (it may equal nativeRewrite if there is no further improvement worth offering), wordTranslations as an empty array, translation as null, and exactly one nextPrompt with its nextPromptTranslation.',
        'Story mode: generate storyText up to 100 words in the target language, return wordTranslations for requested words, and write displayMessage - a short nativeLanguage line asking which words or phrases were difficult or interesting, without repeating the story itself.',
        'Story follow-up: use a topic completely different from the previousTopic when provided.',
        'Translate mode: return direct natural translations in translation, with no long explanation. Include at most two options for ambiguous terms. The translation object\'s keys must be exactly the target language name(s) given in the language field (split by comma if there is more than one), each mapped to the translated text - never use keys like "sourceText" or "translation". Do not set nextPrompt in translate mode; leave it null.',
        'Curate learningItems carefully: propose at most 3 items, and only when they are genuinely worth remembering (useful new vocabulary, natural expressions, reusable phrases, recurring mistakes). Never include punctuation fixes, trivial wording changes, or vocabulary the learner already clearly knows at their level. It is fine and expected to return an empty array when nothing is worth saving.',
        'Whenever nextPrompt (or storyText) is present, also return glossary: 3-6 words or short phrases from that text that are likely difficult for the learner\'s stated level and native language, each with a short translation into the learner\'s native language. Do not explain basic words the learner already knows at their level. Return an empty array when nothing needs explaining.',
'If recentTurns is provided, use it only to keep the topic coherent and ask better follow-up questions - do not repeat earlier questions or re-explain things already covered.',
        'avoidRepeating, when provided, is the exact text of the question you asked last turn. nextPrompt must be a genuinely different, new question that moves the conversation forward from the learner\'s most recent answer - never output avoidRepeating again verbatim or reworded, even if it still feels relevant. This check matters every single turn, not only when the learner explicitly asks to change the question.',
        'Prioritize natural expression, structure, grammar, and precision. Keep tone professional, direct, and efficient.',
        'Reminder: displayMessage is read by the learner in their own voice, not the target language, so write it in nativeLanguage every single time, in every mode, including the very first message of a session and every story follow-up.',
        'Worked example A (userInput already natural) - target language Spanish, nativeLanguage English, userInput "Me gusta mucho la pasta.": {"displayMessage": "Nice, that already sounds exactly like a native speaker! If you want to sound a bit more expressive, you could also say: \\"Me encanta la pasta, sobre todo cuando lleva mucho queso.\\"", "nativeRewrite": "Me gusta mucho la pasta.", "higherLevelRewrite": "Me encanta la pasta, sobre todo cuando lleva mucho queso.", "nextPrompt": "¿Qué otros platos te gustan?", "nextPromptTranslation": "What other dishes do you like?"} - nativeRewrite equals userInput unchanged because nothing needed fixing.',
        'Worked example B (userInput needs a correction) - same languages, userInput "Yo gusta mucho comer pizza": {"displayMessage": "Great effort! Just one small fix: it\'s \\"me gusta\\", not \\"yo gusta\\". Corrected: \\"Me gusta mucho comer pizza.\\" A more advanced way to say it: \\"Me encanta comer pizza, sobre todo los fines de semana.\\"", "nativeRewrite": "Me gusta mucho comer pizza.", "higherLevelRewrite": "Me encanta comer pizza, sobre todo los fines de semana.", "nextPrompt": "¿Qué otros platos te gustan?", "nextPromptTranslation": "What other dishes do you like?"} - displayMessage alone carries the full correction and the optional upgrade; the app does not show nativeRewrite/higherLevelRewrite separately.',
        'Worked example C (story mode) - same languages: {"displayMessage": "Nice continuation! One small note: it\'s \\"los champiñones\\" (masculine), not \\"las champiñones\\".", "storyText": "Un día, fui al mercado y compré champiñones frescos...", "nextPrompt": "¿Qué cocinaste con ellos?", "nextPromptTranslation": "What did you cook with them?"} - notice displayMessage is 100% English even though storyText and nextPrompt are 100% Spanish. Match this pattern exactly, for every language pair, every mode, and every turn.'
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
