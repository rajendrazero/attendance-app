require('dotenv').config();
const sequelize = require('../config/db');
const { seeder } = require('./index');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await seeder.up();
    console.log('All seeders have been execu    ted successfully.');
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
