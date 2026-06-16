const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    const Interaction = sequelize.define(
        'Interaction',
        {
            interactionId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            mode: {
                type: DataTypes.ENUM('conversation', 'story', 'translate'),
                allowNull: false
            },
            interactionType: {
                type: DataTypes.ENUM('conversation_turn', 'story_start', 'story_followup', 'translate_request'),
                allowNull: false
            },
            language: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            level: {
                type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
                allowNull: false
            },
            topic: {
                type: DataTypes.STRING(150),
                allowNull: true
            },
            previousTopic: {
                type: DataTypes.STRING(150),
                allowNull: true
            },
            previousInteractionId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            wordGroup: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: []
            },
            userInput: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            nativeRewrite: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            higherLevelRewrite: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            storyText: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            wordTranslations: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: []
            },
            translation: {
                type: DataTypes.JSON,
                allowNull: true
            },
            nextPrompt: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            tableName: 'interactions',
            timestamps: true
        }
    );

    return Interaction;
};
