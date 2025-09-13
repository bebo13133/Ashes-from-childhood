'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('EmailTemplates', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
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

        await queryInterface.addIndex('EmailTemplates', ['name'], {
            name: 'idx_email_templates_name',
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('EmailTemplates', 'idx_email_templates_name');
        await queryInterface.dropTable('EmailTemplates');
    },
};
