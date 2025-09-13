'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class EmailTemplate extends Model {
        static associate(models) {
            // define association here
        }
    }
    EmailTemplate.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            subject: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
            },
        },
        {
            sequelize,
            modelName: 'EmailTemplate',
        }
    );
    return EmailTemplate;
};
