'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Only run in development/test environments, skip in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Skipping sample orders seeder in production environment');
            return;
        }

        // Generate orders with realistic distribution from today back to 8 months ago
        const orders = [];
        const now = new Date();

        // Price variations over time (simulating price changes)
        const priceHistory = [
            { month: 0, price: 20.0 }, // 8 months ago
            { month: 1, price: 22.0 }, // 7 months ago
            { month: 2, price: 25.0 }, // 6 months ago
            { month: 3, price: 25.0 }, // 5 months ago
            { month: 4, price: 28.0 }, // 4 months ago
            { month: 5, price: 30.0 }, // 3 months ago
            { month: 6, price: 30.0 }, // 2 months ago
            { month: 7, price: 32.0 }, // 1 month ago
            { month: 8, price: 35.0 }, // current month
        ];

        // Customer data
        const customers = [
            { name: 'Иван Петров', email: 'ivan.petrov@email.com', phone: '+359888123456', city: 'София' },
            { name: 'Мария Георгиева', email: 'maria.georgieva@email.com', phone: '+359888123457', city: 'Пловдив' },
            { name: 'Петър Димитров', email: 'petar.dimitrov@email.com', phone: '+359888123458', city: 'Варна' },
            { name: 'Анна Стоянова', email: 'anna.stoyanova@email.com', phone: '+359888123459', city: 'Бургас' },
            { name: 'Георги Иванов', email: 'georgi.ivanov@email.com', phone: '+359888123460', city: 'Русе' },
            { name: 'Елена Николова', email: 'elena.nikolova@email.com', phone: '+359888123461', city: 'Стара Загора' },
            { name: 'Димитър Петров', email: 'dimitar.petrov@email.com', phone: '+359888123462', city: 'Плевен' },
            { name: 'Светлана Георгиева', email: 'svetlana.georgieva@email.com', phone: '+359888123463', city: 'Добрич' },
            { name: 'Николай Стоянов', email: 'nikolay.stoyanov@email.com', phone: '+359888123464', city: 'Шумен' },
            { name: 'Радка Димитрова', email: 'radka.dimitrova@email.com', phone: '+359888123465', city: 'Перник' },
        ];

        // Addresses
        const addresses = [
            'ул. Витоша 15, ап. 3',
            'бул. Цариградско шосе 45',
            'ул. Марица 22, ет. 2',
            'бул. Славянска 8, ап. 12',
            'ул. Христо Ботев 33',
            'бул. България 67, ет. 4',
            'ул. Драган Цанков 11, ап. 7',
            'бул. Тодор Александров 89',
            'ул. Стефан Караджа 44, ет. 1',
            'бул. Христо Смирненски 56, ап. 9',
        ];

        // Payment methods
        const paymentMethods = ['cash_on_delivery', 'bank_transfer', 'card_online'];

        // Order statuses (weighted towards completed orders for better statistics)
        const statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'pending', 'cancelled'];

        // Realistic order distribution (50 total orders)
        const orderDistribution = [
            { period: 'today', count: 3, description: 'Today' },
            { period: 'this_week', count: 5, description: 'This week (excluding today)' },
            { period: 'this_month', count: 20, description: 'This month (excluding this week)' },
            { period: 'last_month', count: 8, description: 'Last month' },
            { period: '2_months_ago', count: 5, description: '2 months ago' },
            { period: '3_months_ago', count: 4, description: '3 months ago' },
            { period: '4_months_ago', count: 3, description: '4 months ago' },
            { period: '5_months_ago', count: 2, description: '5 months ago' },
        ];

        let orderIndex = 0;

        // Generate orders for each period
        for (const period of orderDistribution) {
            for (let i = 0; i < period.count; i++) {
                let orderDate;

                // Generate date based on period
                switch (period.period) {
                    case 'today':
                        // Today with random time
                        orderDate = new Date(now);
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case 'this_week':
                        // This week (1-6 days ago)
                        orderDate = new Date(now);
                        orderDate.setDate(now.getDate() - (Math.floor(Math.random() * 6) + 1));
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case 'this_month':
                        // This month (7-30 days ago)
                        orderDate = new Date(now);
                        orderDate.setDate(now.getDate() - (Math.floor(Math.random() * 24) + 7));
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case 'last_month':
                        // Last month
                        orderDate = new Date(now);
                        orderDate.setMonth(now.getMonth() - 1);
                        orderDate.setDate(Math.floor(Math.random() * 30) + 1);
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case '2_months_ago':
                        orderDate = new Date(now);
                        orderDate.setMonth(now.getMonth() - 2);
                        orderDate.setDate(Math.floor(Math.random() * 30) + 1);
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case '3_months_ago':
                        orderDate = new Date(now);
                        orderDate.setMonth(now.getMonth() - 3);
                        orderDate.setDate(Math.floor(Math.random() * 30) + 1);
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case '4_months_ago':
                        orderDate = new Date(now);
                        orderDate.setMonth(now.getMonth() - 4);
                        orderDate.setDate(Math.floor(Math.random() * 30) + 1);
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case '5_months_ago':
                        orderDate = new Date(now);
                        orderDate.setMonth(now.getMonth() - 5);
                        orderDate.setDate(Math.floor(Math.random() * 30) + 1);
                        orderDate.setHours(Math.floor(Math.random() * 24));
                        orderDate.setMinutes(Math.floor(Math.random() * 60));
                        break;
                }

                const monthsDiff = Math.floor((now - orderDate) / (30 * 24 * 60 * 60 * 1000));
                const monthIndex = Math.max(0, Math.min(monthsDiff, priceHistory.length - 1));
                const currentPrice = priceHistory[monthIndex].price;

                // Random customer
                const customer = customers[Math.floor(Math.random() * customers.length)];

                // Random quantity (1-5, with some orders having multiple books)
                const quantity = Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 4) + 2;

                // Random status
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                // Random payment method
                const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

                // Random address
                const address = addresses[Math.floor(Math.random() * addresses.length)];

                // Generate order number
                const orderNumber = `Поръчка-${String(orderIndex + 1).padStart(3, '0')}`;

                // Set completed date if status is completed
                let completedAt = null;
                if (status === 'completed') {
                    // Completed 1-7 days after order date
                    const completedDays = Math.floor(Math.random() * 7) + 1;
                    completedAt = new Date(orderDate.getTime() + completedDays * 24 * 60 * 60 * 1000);
                }

                orders.push({
                    book_id: 1,
                    order_number: orderNumber,
                    customer_name: customer.name,
                    email: customer.email,
                    phone_number: customer.phone,
                    address: address,
                    city: customer.city,
                    quantity: quantity,
                    book_title: 'Пепел от детството',
                    payment_method: paymentMethod,
                    order_date: orderDate,
                    price_at_order: currentPrice,
                    status: status,
                    completed_at: completedAt,
                    created_at: orderDate,
                    updated_at: orderDate,
                });

                orderIndex++;
            }
        }

        // Sort orders by creation date (newest first)
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        await queryInterface.bulkInsert('Orders', orders);
    },

    async down(queryInterface, Sequelize) {
        // Only run in development/test environments, skip in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Skipping sample orders seeder rollback in production environment');
            return;
        }
        // Delete all orders that were created by this seeder
        await queryInterface.bulkDelete('Orders', {
            order_number: {
                [Sequelize.Op.like]: 'Поръчка-%',
            },
        });
    },
};
