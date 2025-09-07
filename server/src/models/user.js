'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // define association here
        }

        // Helper method to add a session token
        async addSessionToken(sessionToken, expiryDate) {
            const currentTokens = this.sessionTokens || [];
            const newTokens = [
                ...currentTokens,
                {
                    token: sessionToken,
                    createdAt: new Date(),
                    expiresAt: expiryDate,
                },
            ];

            await this.update({ sessionTokens: newTokens });
        }

        // Helper method to remove a session token
        async removeSessionToken(sessionToken) {
            const tokens = this.sessionTokens || [];
            const filteredTokens = tokens.filter((t) => t.token !== sessionToken);

            await this.update({ sessionTokens: filteredTokens });
        }

        // Helper method to check if session token exists
        hasSessionToken(sessionToken) {
            const tokens = this.sessionTokens || [];
            return tokens.some((t) => t.token === sessionToken);
        }

        // Clean expired tokens when user logs in or refreshes
        async cleanupExpiredTokens() {
            const now = new Date();
            const tokens = this.sessionTokens || [];
            const validTokens = tokens.filter((t) => new Date(t.expiresAt) > now);

            if (validTokens.length !== tokens.length) {
                await this.update({ sessionTokens: validTokens });
            }
        }
    }
    User.init(
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            sessionTokens: {
                type: DataTypes.JSON,
                field: 'session_tokens',
                allowNull: true,
                defaultValue: [],
            },
            resetToken: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'reset_token',
            },
            tokenExpiration: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'token_expiration',
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
            modelName: 'User',
        }
    );
    return User;
};
