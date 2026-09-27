const { LearningItem } = require('../../models');

const normalizeSourceText = sourceText => {
    return String(sourceText || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

const findOrCreateLearningItems = async ({ userId, language, items, transaction }) => {
    const savedItems = [];

    for (const item of items) {
        const normalizedSourceText = normalizeSourceText(item.sourceText);
        const [learningItem] = await LearningItem.findOrCreate({
            where: {
                userId,
                language,
                type: item.type,
                normalizedSourceText
            },
            defaults: {
                sourceText: item.sourceText,
                meaning: item.meaning,
                context: item.context || null
            },
            transaction
        });

        savedItems.push(learningItem);
    }

    return savedItems;
};

module.exports = {
    findOrCreateLearningItems,
    normalizeSourceText
};
