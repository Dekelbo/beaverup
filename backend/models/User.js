const { DataTypes } = require('sequelize');

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
                type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
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
