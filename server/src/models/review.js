'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            // Reviews don't need foreign keys for now, but we can add book association later if needed
        }

        // Helper method to approve review
        async approve() {
            await this.update({
                status: 'approved',
            });
        }

        // Helper method to reject review
        async reject() {
            await this.update({
                status: 'rejected',
            });
        }

        // Helper method to increment helpful votes
        async incrementHelpful() {
            await this.update({
                helpful: this.helpful + 1,
            });
        }

        // Getter for formatted review date
        get formattedCreatedAt() {
            return new Date(this.createdAt).toLocaleDateString('bg-BG');
        }

        // Getter for display name (handles anonymous reviews)
        get displayName() {
            return this.isAnonymous ? 'Анонимен читател' : this.name;
        }

        // Static method to get average rating (excluding NULLs)
        static async getAverageRating() {
            const result = await this.findOne({
                attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']],
                where: {
                    status: 'approved',
                    rating: {
                        [sequelize.Op.ne]: null,
                    },
                },
                raw: true,
            });
            return result ? parseFloat(result.averageRating).toFixed(1) : '0.0';
        }

        // Static method to get total approved reviews count
        static async getTotalApprovedReviews() {
            return await this.count({
                where: { status: 'approved' },
            });
        }
    }

    Review.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isAnonymous: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_anonymous',
            },
            rating: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 1,
                    max: 5,
                },
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            helpful: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected', 'hidden'),
                allowNull: false,
                defaultValue: 'pending',
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
            modelName: 'Review',
            tableName: 'Reviews',
            timestamps: true,
            underscored: true,
        }
    );

    return Review;
};
