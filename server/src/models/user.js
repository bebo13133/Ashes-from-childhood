'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {}

        // Helper method to add a refresh token
        async addRefreshToken(refreshTokenId, expiryDate) {
            const currentTokens = this.refreshTokens || [];
            const newTokens = [
                ...currentTokens,
                {
                    token: refreshTokenId,
                    createdAt: new Date(),
                    expiresAt: expiryDate,
                },
            ];

            await this.update({ refreshTokens: newTokens });
        }

        // Helper method to remove a refresh token
        async removeRefreshToken(refreshTokenId) {
            const tokens = this.refreshTokens || [];
            const filteredTokens = tokens.filter((t) => t.token !== refreshTokenId);

            await this.update({ refreshTokens: filteredTokens });
        }

        // Helper method to check if refresh token exists
        hasRefreshToken(refreshTokenId) {
            const tokens = this.refreshTokens || [];
            return tokens.some((t) => t.token === refreshTokenId);
        }

        // Clean expired refresh tokens
        async cleanupExpiredRefreshTokens() {
            const now = new Date();
            const tokens = this.refreshTokens || [];
            const validTokens = tokens.filter((t) => new Date(t.expiresAt) > now);

            if (validTokens.length !== tokens.length) {
                await this.update({ refreshTokens: validTokens });
            }
        }

        // Clear all refresh tokens
        async clearAllRefreshTokens() {
            await this.update({ refreshTokens: [] });
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
            refreshTokens: {
                type: DataTypes.JSON,
                field: 'refresh_tokens',
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
