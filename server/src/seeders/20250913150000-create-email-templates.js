'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('EmailTemplates', [
            {
                name: 'Промоционален имейл',
                subject: '"Пепел от детството" - една книга, която трябва да прочетете',
                content: `Здравейте,

Бихте ли се заинтересували от една силна и емоционална история?

"Пепел от детството" е книга, която засяга дълбоко и оставя следа в сърцето на всеки читател.

🌟 Над [Рейтинг] звезди средна оценка
📖 Вече повече от [Брой поръчки] доволни читатели
💝 Доставка до офис или адрес

Цена: само [Обща цена] лв.

Поръчайте сега и се потопете в една незабравима история.

Поздрави,
Авторът`,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('EmailTemplates', null, {});
    },
};
