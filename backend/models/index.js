const { sequelize } = require('../src/config/database');
const createAdminModel = require('./Admin');
const createDifficultyFeedbackModel = require('./DifficultyFeedback');
const createInteractionModel = require('./Interaction');
const createInteractionLearningItemModel = require('./InteractionLearningItem');
const createLearningItemModel = require('./LearningItem');
const createUserModel = require('./User');

const User = createUserModel(sequelize);
const Admin = createAdminModel(sequelize);
const Interaction = createInteractionModel(sequelize);
const LearningItem = createLearningItemModel(sequelize);
const InteractionLearningItem = createInteractionLearningItemModel(sequelize);
const DifficultyFeedback = createDifficultyFeedbackModel(sequelize);

User.hasOne(Admin, {
    foreignKey: 'userId',
    as: 'adminProfile',
    onDelete: 'CASCADE'
});
Admin.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Interaction, {
    foreignKey: 'userId',
    as: 'interactions',
    onDelete: 'CASCADE'
});
Interaction.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(LearningItem, {
    foreignKey: 'userId',
    as: 'learningItems',
    onDelete: 'CASCADE'
});
LearningItem.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Interaction.belongsToMany(LearningItem, {
    through: InteractionLearningItem,
    foreignKey: 'interactionId',
    otherKey: 'itemId',
    as: 'learningItems'
});
LearningItem.belongsToMany(Interaction, {
    through: InteractionLearningItem,
    foreignKey: 'itemId',
    otherKey: 'interactionId',
    as: 'interactions'
});

Interaction.belongsTo(Interaction, {
    foreignKey: 'previousInteractionId',
    as: 'previousInteraction'
});
Interaction.hasMany(Interaction, {
    foreignKey: 'previousInteractionId',
    as: 'followupInteractions'
});

User.hasMany(DifficultyFeedback, {
    foreignKey: 'userId',
    as: 'difficultyFeedback',
    onDelete: 'CASCADE'
});
DifficultyFeedback.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Interaction.hasMany(DifficultyFeedback, {
    foreignKey: 'interactionId',
    as: 'difficultyFeedback',
    onDelete: 'SET NULL'
});
DifficultyFeedback.belongsTo(Interaction, {
    foreignKey: 'interactionId',
    as: 'interaction'
});

const syncModels = async options => {
    await sequelize.sync(options);
};

module.exports = {
    sequelize,
    syncModels,
    Admin,
    DifficultyFeedback,
    Interaction,
    InteractionLearningItem,
    LearningItem,
    User
};
