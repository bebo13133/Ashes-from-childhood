'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            bookId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'book_id',
                references: {
                    model: 'Books',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            orderNumber: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'order_number',
            },
            customerName: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'customer_name',
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'phone_number',
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            bookTitle: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'book_title',
            },
            paymentMethod: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'payment_method',
            },
            orderDate: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'order_date',
            },
            priceAtOrder: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                field: 'price_at_order',
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
            },
            completedAt: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'completed_at',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'created_at',
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                field: 'updated_at',
            },
        });

        await queryInterface.addIndex('Orders', ['order_number']);
        await queryInterface.addIndex('Orders', ['status']);
        await queryInterface.addIndex('Orders', ['email']);
        await queryInterface.addIndex('Orders', ['created_at']);
        await queryInterface.addIndex('Orders', ['book_id']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Orders');
    },
};
