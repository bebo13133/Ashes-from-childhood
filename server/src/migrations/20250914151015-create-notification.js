'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            type: {
                allowNull: false,
                type: Sequelize.STRING(50),
                comment: 'Type of notification (order, review, etc.)',
            },
            message: {
                allowNull: false,
                type: Sequelize.TEXT,
            },
            read: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            related_id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                comment: 'ID of the related order, review or something else, based on type',
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

        await queryInterface.addIndex('Notifications', ['read'], {
            name: 'idx_notifications_read',
        });
        await queryInterface.addIndex('Notifications', ['type'], {
            name: 'idx_notifications_type',
        });
        await queryInterface.addIndex('Notifications', ['created_at'], {
            name: 'idx_notifications_created_at',
        });
        await queryInterface.addIndex('Notifications', ['related_id'], {
            name: 'idx_notifications_related_id',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Notifications');
    },
};
