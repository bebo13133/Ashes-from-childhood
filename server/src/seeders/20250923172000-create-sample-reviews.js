'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Only run in development/test environments, skip in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Skipping sample reviews seeder in production environment');
            return;
        }

        // Generate reviews with realistic distribution from today back to 8 months ago
        const reviews = [];
        const now = new Date();

        // Customer names (same as orders for consistency)
        const customers = [
            'Иван Петров',
            'Мария Георгиева',
            'Петър Димитров',
            'Анна Стоянова',
            'Георги Иванов',
            'Елена Николова',
            'Димитър Петров',
            'Светлана Георгиева',
            'Николай Стоянов',
            'Радка Димитрова',
            'Стоян Георгиев',
            'Пенка Димитрова',
            'Красимир Стоянов',
            'Венета Петрова',
            'Борислав Иванов',
            'Цветана Николова',
            'Димитър Георгиев',
            'Емилия Стоянова',
            'Пламен Димитров',
            'Румяна Петрова',
        ];

        // Review comments in Bulgarian
        const positiveComments = [
            'Невероятна книга! Много дълбоко и трогателно четиво.',
            'Препоръчвам я на всеки! Историята е много красива.',
            'Отлична книга, която заслужава да се прочете.',
            'Много добра книга с интересна история.',
            'Прекрасно написана книга, която ме впечатли.',
            'Силно препоръчвам! Книгата е страхотна.',
            'Много добра книга, която заслужава внимание.',
            'Отлична книга с красива история.',
            'Препоръчвам я на всички! Много добра книга.',
            'Книгата е прекрасна и много добре написана.',
            'Невероятна история, която ме впечатли дълбоко.',
            'Отлична книга, която заслужава да се прочете.',
            'Много добра книга с интересен сюжет.',
            'Прекрасно четиво, което препоръчвам на всички.',
            'Книгата е страхотна и много добре написана.',
        ];

        const neutralComments = [
            'Добра книга, но не е най-добрата, която съм чел.',
            'Интересна история, но има по-добри книги.',
            'Книгата е добра, но не ме впечатли особено.',
            'Средна книга с интересен сюжет.',
            'Добра книга, но не е нещо изключително.',
            'Интересна история, но има по-добри варианти.',
            'Книгата е добра, но не е най-добрата.',
            'Средна книга, която може да се прочете.',
            'Добра книга, но не ме впечатли дълбоко.',
            'Интересна история, но не е нещо изключително.',
        ];

        const negativeComments = [
            'Книгата не ме впечатли особено.',
            'Не е най-добрата книга, която съм чел.',
            'Историята не е толкова интересна, колкото очаквах.',
            'Книгата е донякъде разочароваща.',
            'Не е толкова добра, колкото очаквах.',
            'Историята не ме впечатли особено.',
            'Книгата не е най-добрата.',
            'Не е толкова интересна, колкото очаквах.',
            'Историята е донякъде разочароваща.',
            'Книгата не ме впечатли дълбоко.',
        ];

        // Review statuses (weighted towards approved reviews)
        const statuses = ['approved', 'approved', 'approved', 'approved', 'approved', 'pending', 'rejected'];

        // Realistic review distribution (50 total reviews)
        const reviewDistribution = [
            { period: 'today', count: 2, description: 'Today' },
            { period: 'this_week', count: 4, description: 'This week (excluding today)' },
            { period: 'this_month', count: 18, description: 'This month (excluding this week)' },
            { period: 'last_month', count: 12, description: 'Last month' },
            { period: '2_months_ago', count: 8, description: '2 months ago' },
            { period: '3_months_ago', count: 4, description: '3 months ago' },
            { period: '4_months_ago', count: 2, description: '4 months ago' },
        ];

        let reviewIndex = 0;

        // Generate reviews for each period
        for (const period of reviewDistribution) {
            for (let i = 0; i < period.count; i++) {
                let reviewDate;

                // Generate date based on period
                switch (period.period) {
                    case 'today':
                        // Today with random time
                        reviewDate = new Date(now);
                        reviewDate.setHours(Math.floor(Math.random() * 24));
                        reviewDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case 'this_week':
                        // This week (1-6 days ago)
                        reviewDate = new Date(now);
                        reviewDate.setDate(now.getDate() - (Math.floor(Math.random() * 6) + 1));
                        reviewDate.setHours(Math.floor(Math.random() * 24));
                        reviewDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case 'this_month':
                        // This month (7-30 days ago)
                        reviewDate = new Date(now);
                        reviewDate.setDate(now.getDate() - (Math.floor(Math.random() * 24) + 7));
                        reviewDate.setHours(Math.floor(Math.random() * 24));
                        reviewDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case 'last_month':
                        // Last month
                        reviewDate = new Date(now);
                        reviewDate.setMonth(now.getMonth() - 1);
                        reviewDate.setDate(Math.floor(Math.random() * 30) + 1);
                        reviewDate.setHours(Math.floor(Math.random() * 24));
                        reviewDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case '2_months_ago':
                        reviewDate = new Date(now);
                        reviewDate.setMonth(now.getMonth() - 2);
                        reviewDate.setDate(Math.floor(Math.random() * 30) + 1);
                        reviewDate.setHours(Math.floor(Math.random() * 24));
                        reviewDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case '3_months_ago':
                        reviewDate = new Date(now);
                        reviewDate.setMonth(now.getMonth() - 3);
                        reviewDate.setDate(Math.floor(Math.random() * 30) + 1);
                        reviewDate.setHours(Math.floor(Math.random() * 24));
                        reviewDate.setMinutes(Math.floor(Math.random() * 60));
                        break;

                    case '4_months_ago':
                        reviewDate = new Date(now);
                        reviewDate.setMonth(now.getMonth() - 4);
                        reviewDate.setDate(Math.floor(Math.random() * 30) + 1);
                        reviewDate.setHours(Math.floor(Math.random() * 24));
                        reviewDate.setMinutes(Math.floor(Math.random() * 60));
                        break;
                }

                // Generate rating (weighted towards positive ratings)
                const ratingWeights = [1, 1, 2, 3, 4, 5, 5, 5, 5, 5]; // More 4s and 5s
                const rating = ratingWeights[Math.floor(Math.random() * ratingWeights.length)];

                // Generate comment based on rating
                let comment = null;
                if (Math.random() < 0.8) {
                    // 80% chance of having a comment
                    if (rating >= 4) {
                        comment = positiveComments[Math.floor(Math.random() * positiveComments.length)];
                    } else if (rating === 3) {
                        comment = neutralComments[Math.floor(Math.random() * neutralComments.length)];
                    } else {
                        comment = negativeComments[Math.floor(Math.random() * negativeComments.length)];
                    }
                }

                // Random customer
                const customer = customers[Math.floor(Math.random() * customers.length)];

                // Random status
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                // Random anonymous (20% chance)
                const isAnonymous = Math.random() < 0.2;

                // Random helpful votes (0-5, weighted towards lower numbers)
                const helpfulWeights = [0, 0, 0, 1, 1, 2, 2, 3, 4, 5];
                const helpful = helpfulWeights[Math.floor(Math.random() * helpfulWeights.length)];

                reviews.push({
                    name: isAnonymous ? null : customer,
                    is_anonymous: isAnonymous,
                    rating: rating,
                    comment: comment,
                    helpful: helpful,
                    status: status,
                    created_at: reviewDate,
                    updated_at: reviewDate,
                });

                reviewIndex++;
            }
        }

        // Sort reviews by creation date (newest first)
        reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        await queryInterface.bulkInsert('Reviews', reviews);
    },

    async down(queryInterface, Sequelize) {
        // Only run in development/test environments, skip in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Skipping sample reviews seeder rollback in production environment');
            return;
        }
        // Delete all reviews that were created by this seeder
        // We'll identify them by the comment pattern or just delete all for simplicity
        await queryInterface.bulkDelete('Reviews', {
            comment: {
                [Sequelize.Op.like]: '%книга%',
            },
        });
    },
};
