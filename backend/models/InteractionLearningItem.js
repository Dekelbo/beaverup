const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    const InteractionLearningItem = sequelize.define(
        'InteractionLearningItem',
        {
            interactionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            itemId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            }
        },
        {
            tableName: 'interaction_learning_items',
            timestamps: true
        }
    );

    return InteractionLearningItem;
};
