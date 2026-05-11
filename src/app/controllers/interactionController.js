const interactions = require('../models/interactions'); // --- Import mock data ---

// --- Send a standard error response ---
const sendError = (res, status, code, message, details = {}) => {
    return res.status(status).json({
        success: false,
        data: null,
        error: { code, message, details }
    });
};

// --- Check owner or admin access ---
const canAccessUserData = (req, userId) => {
    const role = req.headers['x-user-role'];
    const loggedInUserId = parseInt(req.headers['x-user-id']);
    return role === 'admin' || loggedInUserId === userId;
};

// --- Validate CEFR level ---
const isValidLevel = (level) => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level);

// --- Validate interaction mode ---
const isValidMode = (mode) => ['conversation', 'story', 'translate'].includes(mode);

// ***
// --- Validate interaction type ---
const isValidInteractionType = (type) => ['conversation_turn', 'story_start', 'story_followup', 'translate_request'].includes(type);
// ***

// --- Validate required interaction fields ---
const validateInteractionInput = (body, requireAllFields = true) => {
    const interactionType = body.interactionType || `${body.mode}_request`;
    const requiredFields = requireAllFields ? ['userId', 'mode', 'language', 'level'] : [];

    if (requireAllFields && interactionType !== 'story_start') {
        requiredFields.push('userInput');
    }

    const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === '' || body[field] === null);

    if (missingFields.length > 0) {
        return { message: 'Missing required interaction fields.', details: { missingFields } };
    }

    if (body.userId !== undefined && Number.isNaN(parseInt(body.userId))) {
        return { message: 'Invalid user id.', details: { field: 'userId' } };
    }

    if (body.mode && !isValidMode(body.mode)) {
        return { message: 'Invalid interaction mode.', details: { field: 'mode', allowedValues: ['conversation', 'story', 'translate'] } };
    }

    if (body.interactionType && !isValidInteractionType(body.interactionType)) {
        return { message: 'Invalid interaction type.', details: { field: 'interactionType', allowedValues: ['conversation_turn', 'story_start', 'story_followup', 'translate_request'] } };
    }

    if (body.mode === 'story' && body.interactionType && !['story_start', 'story_followup'].includes(body.interactionType)) {
        return { message: 'Invalid story interaction type.', details: { mode: 'story', allowedValues: ['story_start', 'story_followup'] } };
    }

    if (body.mode === 'conversation' && body.interactionType && body.interactionType !== 'conversation_turn') {
        return { message: 'Invalid conversation interaction type.', details: { mode: 'conversation', allowedValues: ['conversation_turn'] } };
    }

    if (body.mode === 'translate' && body.interactionType && body.interactionType !== 'translate_request') {
        return { message: 'Invalid translate interaction type.', details: { mode: 'translate', allowedValues: ['translate_request'] } };
    }

    if (body.level && !isValidLevel(body.level)) {
        return { message: 'Invalid level.', details: { field: 'level', allowedValues: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] } };
    }

    if (body.wordGroup !== undefined && !Array.isArray(body.wordGroup)) {
        return { message: 'Invalid word group.', details: { field: 'wordGroup', expectedType: 'array' } };
    }

    if (body.previousInteractionId !== undefined && body.previousInteractionId !== null && Number.isNaN(parseInt(body.previousInteractionId))) {
        return { message: 'Invalid previous interaction id.', details: { field: 'previousInteractionId' } };
    }

    return null;
};

// ***
// --- Get default interaction type ---
const getInteractionType = (mode, interactionType) => {
    if (interactionType) {
        return interactionType;
    }

    if (mode === 'story') {
        return 'story_start';
    }

    if (mode === 'conversation') {
        return 'conversation_turn';
    }

    return 'translate_request';
};
// ***

// --- Build a mock AI result ---
const buildMockAiResult = ({ mode, interactionType, language, level, topic, userInput, wordGroup = [], previousTopic }) => {
    const learnerLevel = level || 'B1';
    const currentInteractionType = getInteractionType(mode, interactionType);

    if (mode === 'translate') {
        return {
            nativeRewrite: null,
            higherLevelRewrite: null,
            storyText: null,
            wordTranslations: [],
            translation: {
                [language]: `Natural ${language} translation for a ${learnerLevel} learner: ${userInput}`
            },
            learningItems: [
                {
                    type: 'phrase',
                    sourceText: userInput,
                    meaning: `Useful ${language} translation practice for level ${learnerLevel}.`
                }
            ],
            nextPrompt: null
        };
    }

    if (mode === 'story') {
        const selectedWords = currentInteractionType === 'story_start'
            ? wordGroup
            : String(userInput || '').split(',').map(word => word.trim()).filter(Boolean);

        const storyTopic = currentInteractionType === 'story_followup'
            ? `a new topic different from ${previousTopic || topic || 'the previous story'}`
            : (topic || 'daily life');

        return {
            nativeRewrite: null,
            higherLevelRewrite: null,
            storyText: `Mock ${learnerLevel} ${language} story about ${storyTopic} that uses ${selectedWords.length > 0 ? selectedWords.join(', ') : 'simple level-appropriate words'}.`,
            wordTranslations: selectedWords.map(word => ({
                sourceText: word,
                translation: `Mock ${language} translation for ${word}`
            })),
            translation: null,
            learningItems: selectedWords.map(word => ({
                type: 'word',
                sourceText: word,
                meaning: `Useful ${language} word for ${learnerLevel}-level story practice.`
            })),
            nextPrompt: 'Which words or phrases were difficult or interesting?'
        };
    }

    return {
        nativeRewrite: `Natural ${learnerLevel}-level rewrite: I want to go to the train station.`,
        higherLevelRewrite: `Higher-level version for a ${learnerLevel} learner: I'd like to get to the train station.`,
        storyText: null,
        wordTranslations: [],
        translation: null,
        learningItems: [
            {
                type: 'phrase',
                sourceText: "I'd like to get to...",
                meaning: `A polite phrase that helps a ${learnerLevel} learner sound more natural.`
            }
        ],
        nextPrompt: `Answer at ${learnerLevel} level: How would you ask for a ticket?`
    };
};

// ***
// --- Get all interactions ---
const getAllInteractions = (req, res) => {
    try {
        res.status(200).json({ success: true, data: interactions, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get interactions.');
    }
};
// ***

// ***
// --- Get interaction by ID ---
const getInteractionById = (req, res) => {
    try {
        const interactionId = parseInt(req.params.id);

        if (Number.isNaN(interactionId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid interaction id.', { field: 'id' });
        }

        const interaction = interactions.find(i => i.interactionId === interactionId);
        if (!interaction) {
            return sendError(res, 404, 'INTERACTION_NOT_FOUND', 'Interaction not found.');
        }

        if (!canAccessUserData(req, interaction.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to access this interaction.');
        }

        res.status(200).json({ success: true, data: interaction, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get interaction.');
    }
};
// ***

// ***
// --- Get interactions by user ID ---
const getInteractionsByUserId = (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        if (Number.isNaN(userId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid user id.', { field: 'userId' });
        }

        if (!canAccessUserData(req, userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to access these interactions.');
        }

        const userInteractions = interactions.filter(i => i.userId === userId);
        res.status(200).json({ success: true, data: userInteractions, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user interactions.');
    }
};
// ***

// ***
// --- Create interaction with mock AI response ---
const createInteraction = (req, res) => {
    try {
        const validationError = validateInteractionInput(req.body);
        if (validationError) {
            return sendError(res, 400, 'VALIDATION_ERROR', validationError.message, validationError.details);
        }

        const userId = parseInt(req.body.userId);
        if (!canAccessUserData(req, userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to create this interaction.');
        }

        const aiResult = buildMockAiResult(req.body);
        const newId = interactions.length > 0 ? Math.max(...interactions.map(i => i.interactionId)) + 1 : 1;
        const newInteraction = {
            interactionId: newId,
            userId,
            mode: req.body.mode,
            interactionType: getInteractionType(req.body.mode, req.body.interactionType),
            language: req.body.language,
            level: req.body.level,
            topic: req.body.topic || null,
            previousTopic: req.body.previousTopic || null,
            previousInteractionId: req.body.previousInteractionId ? parseInt(req.body.previousInteractionId) : null,
            wordGroup: req.body.wordGroup || [],
            userInput: req.body.userInput || null,
            nativeRewrite: aiResult.nativeRewrite,
            higherLevelRewrite: aiResult.higherLevelRewrite,
            storyText: aiResult.storyText,
            wordTranslations: aiResult.wordTranslations,
            translation: aiResult.translation,
            learningItems: aiResult.learningItems,
            nextPrompt: aiResult.nextPrompt
        };

        interactions.push(newInteraction);
        res.status(201).json({ success: true, data: newInteraction, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not create interaction.');
    }
};
// ***

// ***
// --- Update interaction ---
const updateInteraction = (req, res) => {
    try {
        const interactionId = parseInt(req.params.id);

        if (Number.isNaN(interactionId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid interaction id.', { field: 'id' });
        }

        const validationError = validateInteractionInput(req.body, false);
        if (validationError) {
            return sendError(res, 400, 'VALIDATION_ERROR', validationError.message, validationError.details);
        }

        const interaction = interactions.find(i => i.interactionId === interactionId);
        if (!interaction) {
            return sendError(res, 404, 'INTERACTION_NOT_FOUND', 'Interaction not found.');
        }

        if (!canAccessUserData(req, interaction.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to update this interaction.');
        }

        const allowedFields = ['mode', 'interactionType', 'language', 'level', 'topic', 'previousTopic', 'previousInteractionId', 'wordGroup', 'userInput', 'nativeRewrite', 'higherLevelRewrite', 'storyText', 'wordTranslations', 'translation', 'learningItems', 'nextPrompt'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                interaction[field] = req.body[field];
            }
        });

        res.status(200).json({ success: true, data: interaction, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not update interaction.');
    }
};
// ***

// ***
// --- Delete interaction ---
const deleteInteraction = (req, res) => {
    try {
        const interactionId = parseInt(req.params.id);

        if (Number.isNaN(interactionId)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid interaction id.', { field: 'id' });
        }

        const index = interactions.findIndex(i => i.interactionId === interactionId);
        if (index === -1) {
            return sendError(res, 404, 'INTERACTION_NOT_FOUND', 'Interaction not found.');
        }

        if (!canAccessUserData(req, interactions[index].userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You do not have permission to delete this interaction.');
        }

        interactions.splice(index, 1);
        res.status(200).json({ success: true, data: { interactionId, message: 'Interaction deleted successfully.' }, error: null });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete interaction.');
    }
};
// ***

module.exports = {
    getAllInteractions,
    getInteractionById,
    getInteractionsByUserId,
    createInteraction,
    updateInteraction,
    deleteInteraction
};
