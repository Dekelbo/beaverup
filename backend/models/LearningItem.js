const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    const LearningItem = sequelize.define(
        'LearningItem',
        {
            itemId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            language: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM('word', 'phrase', 'rewrite', 'expression'),
                allowNull: false
            },
            sourceText: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            normalizedSourceText: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            meaning: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            context: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        },
        {
            tableName: 'learning_items',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['userId', 'language', 'type', 'normalizedSourceText']
                }
            ]
        }
    );

    return LearningItem;
};
