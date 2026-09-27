const { DataTypes } = require('sequelize');
const { LEVEL_VALUES } = require('../src/utils/levels');

module.exports = sequelize => {
    const DifficultyFeedback = sequelize.define(
        'DifficultyFeedback',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            interactionId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            language: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            level: {
                type: DataTypes.ENUM(...LEVEL_VALUES),
                allowNull: false
            },
            feedback: {
                type: DataTypes.ENUM('too_easy', 'just_right', 'too_hard'),
                allowNull: false
            }
        },
        {
            tableName: 'difficulty_feedback',
            timestamps: true,
            updatedAt: false
        }
    );

    return DifficultyFeedback;
};
