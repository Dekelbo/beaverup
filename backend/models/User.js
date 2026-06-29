const { DataTypes } = require('sequelize');
const { LEVEL_VALUES } = require('../src/utils/levels');

module.exports = sequelize => {
    const User = sequelize.define(
        'User',
        {
            userId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            firstName: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            userRole: {
                type: DataTypes.ENUM('admin', 'manager', 'user'),
                allowNull: false,
                defaultValue: 'user'
            },
            userNativeLanguage: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            languageToLearn: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            currentLevel: {
                type: DataTypes.ENUM(...LEVEL_VALUES),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            passwordHash: {
                type: DataTypes.STRING(255),
                allowNull: false
            }
        },
        {
            tableName: 'users',
            timestamps: true,
            createdAt: 'createDate',
            updatedAt: 'updateDate'
        }
    );

    return User;
};
