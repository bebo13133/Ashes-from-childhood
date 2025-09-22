'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const adminEmail = process.env.admin_email;
        const adminPass = process.env.admin_password;
        const hashedPassword = await bcrypt.hash(adminPass, 10);

        await queryInterface.bulkInsert('Users', [
            {
                email: adminEmail,
                password: hashedPassword,
                refresh_tokens: JSON.stringify([]),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        const adminEmail = process.env.admin_email;
        await queryInterface.bulkDelete('Users', {
            email: adminEmail,
        });
    },
};
