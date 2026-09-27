const { DifficultyFeedback, Interaction, LearningItem, User, sequelize } = require('../../models');
const { getLoggedInUser } = require('../middleware/auth');
const { generatePracticeResponse } = require('../services/aiService');
const { getAdjacentLevel } = require('../utils/levels');
const { sendError, sendSuccess } = require('../utils/responses');

const RECENT_TURNS_LIMIT = 5;
const FEEDBACK_PATTERN_LIMIT = 5;

const canAccessUserData = (req, userId) => {
    const loggedInUser = getLoggedInUser(req);
    return loggedInUser.role === 'admin' || String(loggedInUser.userId) === String(userId);
};

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

const validateInteractionInput = body => {
    const interactionType = getInteractionType(body.mode, body.interactionType);

    const isConversationStart =
        body.mode === 'conversation' &&
        interactionType === 'conversation_turn' &&
        (body.userInput === undefined || body.userInput === '' || body.userInput === null);

    if (
        interactionType !== 'story_start' &&
        !isConversationStart &&
        (body.userInput === undefined || body.userInput === '' || body.userInput === null)
    ) {
        return { message: 'Missing required interaction fields.', details: { missingFields: ['userInput'] } };
    }

    if (body.mode === 'story' && body.interactionType && !['story_start', 'story_followup'].includes(body.interactionType)) {
        return {
            message: 'Invalid story interaction type.',
            details: { mode: 'story', allowedValues: ['story_start', 'story_followup'] }
        };
    }

    if (body.mode === 'conversation' && body.interactionType && body.interactionType !== 'conversation_turn') {
        return {
            message: 'Invalid conversation interaction type.',
            details: { mode: 'conversation', allowedValues: ['conversation_turn'] }
        };
    }

    if (body.mode === 'translate' && body.interactionType && body.interactionType !== 'translate_request') {
        return {
            message: 'Invalid translate interaction type.',
            details: { mode: 'translate', allowedValues: ['translate_request'] }
        };
    }

    return null;
};

const serializeInteraction = interaction => {
    const plainInteraction = typeof interaction.get === 'function' ? interaction.get({ plain: true }) : interaction;
    return {
        ...plainInteraction,
        learningItems: plainInteraction.learningItems || [],
        suggestedLearningItems: plainInteraction.suggestedLearningItems || []
    };
};

const findInteractionWithLearningItems = interactionId => {
    return Interaction.findByPk(interactionId, {
        include: [{ model: LearningItem, as: 'learningItems' }]
    });
};

const getRecentTurns = async (userId, language) => {
    const interactions = await Interaction.findAll({
        where: { userId, language },
        order: [['interactionId', 'DESC']],
        limit: RECENT_TURNS_LIMIT
    });

    return interactions
        .reverse()
        .map(interaction => ({
            userInput: interaction.userInput,
            nativeRewrite: interaction.nativeRewrite,
            nextPrompt: interaction.nextPrompt
        }));
};

const normalizeConversationResult = (interactionInput, aiResult) => {
    const hasUserInput = Boolean(String(interactionInput.userInput || '').trim());

    if (interactionInput.mode !== 'conversation') {
        return aiResult;
    }

    if (!hasUserInput) {
        return {
            ...aiResult,
            nativeRewrite: null,
            higherLevelRewrite: null,
            wordTranslations: [],
            translation: null,
            learningItems: []
        };
    }

    const fallbackRewrite =
        aiResult.nativeRewrite ||
        aiResult.higherLevelRewrite ||
        (aiResult.translation ? Object.values(aiResult.translation)[0] : null) ||
        null;

    return {
        ...aiResult,
        nativeRewrite: aiResult.nativeRewrite || fallbackRewrite,
        higherLevelRewrite: aiResult.higherLevelRewrite || fallbackRewrite,
        storyText: null,
        wordTranslations: [],
        translation: null
    };
};

const getAllInteractions = async (req, res) => {
    try {
        const interactions = await Interaction.findAll({
            include: [{ model: LearningItem, as: 'learningItems' }],
            order: [['interactionId', 'ASC']]
        });

        return sendSuccess(res, 200, interactions.map(serializeInteraction));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get interactions.');
    }
};

const getInteractionById = async (req, res) => {
    try {
        const interaction = await findInteractionWithLearningItems(req.params.id);
        if (!interaction) {
            return sendError(res, 404, 'INTERACTION_NOT_FOUND', 'Interaction not found.');
        }

        if (!canAccessUserData(req, interaction.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: interaction.userId
            });
        }

        return sendSuccess(res, 200, serializeInteraction(interaction));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get interaction.');
    }
};

const getInteractionDetails = getInteractionById;

const getInteractionsByUserId = async (req, res) => {
    try {
        const interactions = await Interaction.findAll({
            where: { userId: req.params.userId },
            include: [{ model: LearningItem, as: 'learningItems' }],
            order: [['interactionId', 'ASC']]
        });

        return sendSuccess(res, 200, interactions.map(serializeInteraction));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not get user interactions.');
    }
};

const createInteraction = async (req, res) => {
    try {
        const validationError = validateInteractionInput(req.body);
        if (validationError) {
            return sendError(res, 400, 'VALIDATION_ERROR', validationError.message, validationError.details);
        }

        const userId = parseInt(req.body.userId, 10);
        const interactionType = getInteractionType(req.body.mode, req.body.interactionType);
        const [user, recentTurns] = await Promise.all([
            User.findByPk(userId),
            getRecentTurns(userId, req.body.language)
        ]);

        const interactionInput = {
            ...req.body,
            interactionType,
            nativeLanguage: user ? user.userNativeLanguage : null,
            recentTurns,
            avoidRepeating: req.body.changeQuestion
                ? req.body.avoidRepeating || req.body.previousTopic || null
                : null
        };

        const aiResult = normalizeConversationResult(interactionInput, await generatePracticeResponse(interactionInput));
        const transaction = await sequelize.transaction();

        try {
            const interaction = await Interaction.create(
                {
                    userId,
                    mode: req.body.mode,
                    interactionType,
                    language: req.body.language,
                    level: req.body.level,
                    topic: req.body.topic || null,
                    previousTopic: req.body.previousTopic || null,
                    previousInteractionId: req.body.previousInteractionId ? parseInt(req.body.previousInteractionId, 10) : null,
                    wordGroup: req.body.wordGroup || [],
                    userInput: req.body.userInput || null,
                    nativeRewrite: aiResult.nativeRewrite,
                    higherLevelRewrite: aiResult.higherLevelRewrite,
                    storyText: aiResult.storyText,
                    wordTranslations: aiResult.wordTranslations,
                    translation: aiResult.translation,
                    nextPrompt: aiResult.nextPrompt,
                    displayMessage: aiResult.displayMessage,
                    glossary: aiResult.glossary,
                    nextPromptTranslation: aiResult.nextPromptTranslation,
                    suggestedLearningItems: aiResult.learningItems
                },
                { transaction }
            );

            await transaction.commit();

            const savedInteraction = await findInteractionWithLearningItems(interaction.interactionId);
            return sendSuccess(res, 201, serializeInteraction(savedInteraction));
        } catch (error) {
            await transaction.rollback();
            return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not create interaction.');
        }
    } catch (error) {
        if (error.code === 'AI_NOT_CONFIGURED') {
            return sendError(res, 500, 'AI_NOT_CONFIGURED', 'AI API key is not configured.');
        }

        if (error.code === 'AI_QUOTA_EXCEEDED') {
            return sendError(res, 429, 'AI_QUOTA_EXCEEDED', 'OpenAI quota is exceeded. Check billing or use another API key.');
        }

        if (error.code === 'AI_AUTH_FAILED') {
            return sendError(res, 401, 'AI_AUTH_FAILED', 'OpenAI API key was rejected.');
        }

        if (error.code === 'AI_RATE_LIMITED') {
            return sendError(res, 429, 'AI_RATE_LIMITED', 'OpenAI rate limit was reached. Try again later.');
        }

        if (error.code === 'AI_INVALID_RESPONSE') {
            return sendError(res, 500, 'AI_INVALID_RESPONSE', 'AI response was not valid JSON.');
        }

        return sendError(res, 500, 'AI_REQUEST_FAILED', 'Could not create AI practice response.');
    }
};

const updateInteraction = async (req, res) => {
    try {
        const interaction = await Interaction.findByPk(req.params.id);
        if (!interaction) {
            return sendError(res, 404, 'INTERACTION_NOT_FOUND', 'Interaction not found.');
        }

        if (!canAccessUserData(req, interaction.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: interaction.userId
            });
        }

        const allowedFields = [
            'mode',
            'interactionType',
            'language',
            'level',
            'topic',
            'previousTopic',
            'previousInteractionId',
            'wordGroup',
            'userInput',
            'nativeRewrite',
            'higherLevelRewrite',
            'storyText',
            'wordTranslations',
            'translation',
            'nextPrompt',
            'displayMessage',
            'glossary',
            'nextPromptTranslation',
            'suggestedLearningItems'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                interaction[field] = req.body[field];
            }
        });

        await interaction.save();
        const savedInteraction = await findInteractionWithLearningItems(interaction.interactionId);
        return sendSuccess(res, 200, serializeInteraction(savedInteraction));
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not update interaction.');
    }
};

const deleteInteraction = async (req, res) => {
    try {
        const interaction = await Interaction.findByPk(req.params.id);
        if (!interaction) {
            return sendError(res, 404, 'INTERACTION_NOT_FOUND', 'Interaction not found.');
        }

        if (!canAccessUserData(req, interaction.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: interaction.userId
            });
        }

        await interaction.destroy();
        return sendSuccess(res, 200, { interactionId: req.params.id, message: 'Interaction deleted successfully.' });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not delete interaction.');
    }
};

const buildLevelSuggestion = (level, tooEasyCount, tooHardCount) => {
    if (tooEasyCount >= 4) {
        const suggestedLevel = getAdjacentLevel(level, 'up');
        if (suggestedLevel !== level) {
            return {
                direction: 'up',
                suggestedLevel,
                message: 'Looks like this level is becoming easy for you. Want to try a slightly higher level?'
            };
        }
    }

    if (tooHardCount >= 3) {
        const suggestedLevel = getAdjacentLevel(level, 'down');
        if (suggestedLevel !== level) {
            return {
                direction: 'down',
                suggestedLevel,
                message: "Let's make the next few questions lighter so you can build confidence, then move forward again."
            };
        }
    }

    return null;
};

const submitDifficultyFeedback = async (req, res) => {
    try {
        const interaction = await Interaction.findByPk(req.params.id);
        if (!interaction) {
            return sendError(res, 404, 'INTERACTION_NOT_FOUND', 'Interaction not found.');
        }

        if (!canAccessUserData(req, interaction.userId)) {
            return sendError(res, 403, 'FORBIDDEN', 'You can only access your own data or must be an admin.', {
                requiredOwnerId: interaction.userId
            });
        }

        const { feedback } = req.body;
        if (!['too_easy', 'just_right', 'too_hard'].includes(feedback)) {
            return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid difficulty feedback value.', {
                allowedValues: ['too_easy', 'just_right', 'too_hard']
            });
        }

        await DifficultyFeedback.create({
            userId: interaction.userId,
            interactionId: interaction.interactionId,
            language: interaction.language,
            level: interaction.level,
            feedback
        });

        const recentFeedback = await DifficultyFeedback.findAll({
            where: { userId: interaction.userId, language: interaction.language },
            order: [['id', 'DESC']],
            limit: FEEDBACK_PATTERN_LIMIT
        });

        const tooEasyCount = recentFeedback.filter(entry => entry.feedback === 'too_easy').length;
        const tooHardCount = recentFeedback.filter(entry => entry.feedback === 'too_hard').length;
        const levelSuggestion =
            recentFeedback.length >= FEEDBACK_PATTERN_LIMIT
                ? buildLevelSuggestion(interaction.level, tooEasyCount, tooHardCount)
                : null;

        return sendSuccess(res, 201, { feedbackSaved: true, levelSuggestion });
    } catch (error) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not save difficulty feedback.');
    }
};

module.exports = {
    createInteraction,
    deleteInteraction,
    getAllInteractions,
    getInteractionById,
    getInteractionDetails,
    getInteractionsByUserId,
    submitDifficultyFeedback,
    updateInteraction
};
