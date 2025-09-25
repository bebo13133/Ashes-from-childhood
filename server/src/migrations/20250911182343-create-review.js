'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Reviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            isAnonymous: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_anonymous',
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            helpful: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected', 'hidden'),
                allowNull: false,
                defaultValue: 'pending',
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

        await queryInterface.addIndex('Reviews', ['status']);
        await queryInterface.addIndex('Reviews', ['rating']);
        await queryInterface.addIndex('Reviews', ['created_at']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Reviews');
    },
};
