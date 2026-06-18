const { sequelize, syncModels } = require('../../models');

const run = async () => {
    try {
        await syncModels({ alter: true });
        console.log('Database tables are synced.');
    } finally {
        await sequelize.close();
    }
};

run().catch(error => {
    console.error('Database sync failed.');
    console.error(error.message);
    process.exit(1);
});
