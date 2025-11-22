'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Books', [
            {
                title: 'Пепел от детството',
                price: 28.0,
                currency: 'BGN',
                is_active: true,
                stock: 234,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Books', {
            title: 'Пепел от детството',
        });
    },
};
