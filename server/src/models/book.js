'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Book extends Model {
        static associate(models) {
            Book.hasMany(models.Order, { foreignKey: 'bookId' });
        }

        // Helper method to get book by title
        static async getBookByTitle(title) {
            return await this.findOne({
                where: {
                    title: title,
                    isActive: true,
                },
            });
        }

        // Helper method to update price
        async updatePrice(newPrice) {
            await this.update({ price: newPrice });
        }

        // Helper method to update stock
        async updateStock(newStock) {
            await this.update({ stock: newStock });
        }

        // Getter for formatted price
        get formattedPrice() {
            return `${this.price} ${this.currency}`;
        }
    }

    Book.init(
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            currency: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'BGN',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active',
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
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
            modelName: 'Book',
            tableName: 'Books',
            timestamps: true,
            underscored: true,
        }
    );

    return Book;
};
