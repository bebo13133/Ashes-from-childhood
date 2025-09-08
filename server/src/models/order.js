'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.Book, { foreignKey: 'bookId' });
        }

        // Helper method to generate order number based on ID
        static generateOrderNumber(id) {
            return `Поръчка-${String(id).padStart(3, '0')}`;
        }

        // Helper method to mark order as completed
        async markAsCompleted() {
            await this.update({
                status: 'completed',
                completedAt: new Date(),
            });
        }

        // Helper method to cancel order
        async cancel() {
            await this.update({
                status: 'cancelled',
            });
        }

        // Getter for formatted total price
        get formattedTotalPrice() {
            return `${this.totalPrice} лв.`;
        }

        // Getter for formatted order date
        get formattedCreatedAt() {
            return new Date(this.createdAt).toLocaleDateString('bg-BG');
        }

        get totalPrice() {
            return this.quantity * this.priceAtOrder;
        }
    }

    Order.init(
        {
            bookId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'book_id',
            },
            orderNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'order_number',
            },
            customerName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'customer_name',
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'phone_number',
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            bookTitle: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'book_title',
            },
            paymentMethod: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'payment_method',
            },
            orderDate: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'order_date',
            },
            priceAtOrder: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                field: 'price_at_order',
            },
            status: {
                type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
            },
            completedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'completed_at',
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
            modelName: 'Order',
            tableName: 'Orders',
            timestamps: true,
            underscored: true,
            hooks: {
                afterCreate: async (order) => {
                    const orderNumber = Order.generateOrderNumber(order.id);
                    await order.update({ orderNumber });
                },
            },
        }
    );

    return Order;
};
