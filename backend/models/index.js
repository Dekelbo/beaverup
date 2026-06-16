const { sequelize } = require('../src/config/database');
const createAdminModel = require('./Admin');
const createInteractionModel = require('./Interaction');
const createInteractionLearningItemModel = require('./InteractionLearningItem');
const createLearningItemModel = require('./LearningItem');
const createUserModel = require('./User');

const User = createUserModel(sequelize);
const Admin = createAdminModel(sequelize);
const Interaction = createInteractionModel(sequelize);
const LearningItem = createLearningItemModel(sequelize);
const InteractionLearningItem = createInteractionLearningItemModel(sequelize);

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

const syncModels = async options => {
    await sequelize.sync(options);
};

module.exports = {
    sequelize,
    syncModels,
    Admin,
    Interaction,
    InteractionLearningItem,
    LearningItem,
    User
};
