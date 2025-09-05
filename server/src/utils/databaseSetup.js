const { exec } = require('child_process');
const { sequelize } = require('../config/modelsConfig');

async function setupDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }

    await runMigrations();

    try {
        await sequelize.sync({ force: false });
        console.log('✅ Models synchronized successfully.');
    } catch (error) {
        console.error('❌ Models could not be synced:', error);
    }

    await seedAdminIfNeeded();
}

async function runMigrations() {
    try {
        console.log('🔄 Checking for pending migrations...');

        const pendingMigrations = await new Promise((resolve, reject) => {
            exec('npx sequelize-cli db:migrate:status', (error, stdout, stderr) => {
                if (error) {
                    reject(`Error checking migration status: ${error.message}`);
                } else if (stderr) {
                    reject(`Error during migration status check: ${stderr}`);
                } else {
                    resolve(stdout.includes('down'));
                }
            });
        });

        if (pendingMigrations) {
            console.log('🔄 Running pending migrations...');
            const result = await new Promise((resolve, reject) => {
                exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
                    if (error) {
                        reject(`Error running migrations: ${error.message}`);
                    } else if (stderr) {
                        reject(`Error during migrations: ${stderr}`);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.log('✅ Migrations executed successfully.');
            if (result.trim()) console.log(result);
        } else {
            console.log('✅ No pending migrations found.');
        }
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }
}

async function seedAdminIfNeeded() {
    try {
        const modelsConfig = require('../config/modelsConfig');

        if (!modelsConfig.Admin) {
            console.log('✅ No Admin model found, skipping admin seeding.');
            return;
        }

        const { Admin } = modelsConfig;
        const adminExists = await Admin.findOne({ where: { username: 'admin' } });

        if (!adminExists) {
            console.log('🔄 Seeding admin account...');
            await runSeedingCommand('npx sequelize-cli db:seed:all', 'admin account');
        } else {
            console.log('✅ Admin account already exists.');
        }
    } catch (error) {
        console.error('❌ Seeding error:', error);
    }
}

async function runSeedingCommand(command, description) {
    try {
        const result = await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error seeding ${description}: ${error.message}`);
                } else if (stderr) {
                    reject(`Error during ${description} seeding: ${stderr}`);
                } else {
                    resolve(stdout);
                }
            });
        });
        console.log(`✅ ${description} seeded successfully.`);
        if (result.trim()) console.log(result);
    } catch (error) {
        console.error(`❌ ${description} seeding failed:`, error);
        throw error;
    }
}

module.exports = {
    setupDatabase,
    runMigrations,
    seedAdminIfNeeded,
};
