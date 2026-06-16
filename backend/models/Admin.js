const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    const Admin = sequelize.define(
        'Admin',
        {
            adminId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true
            },
            permissionsLevel: {
                type: DataTypes.STRING(100),
                allowNull: false,
                defaultValue: 'full_access'
            }
        },
        {
            tableName: 'admins',
            timestamps: true
        }
    );

    return Admin;
};
