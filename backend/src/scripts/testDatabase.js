const { sequelize, testDatabaseConnection } = require('../config/database');

const run = async () => {
    try {
        await testDatabaseConnection();
        console.log('Database connection is working.');
    } finally {
        await sequelize.close();
    }
};

run().catch(error => {
    console.error('Database connection failed.');
    console.error(error.message);
    process.exit(1);
});
