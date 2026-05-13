import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize();

async function initialize() {
  try {
    const mysqlUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    let sequelize;

    if (mysqlUrl) {
      console.log('Connecting to database using connection string...');
      sequelize = new Sequelize(mysqlUrl, {
        dialect: 'mysql',
        dialectOptions: {
          ssl: {
            rejectUnauthorized: false
          }
        },
        logging: console.log
      });
    } else {
      const host = process.env.MYSQLHOST || process.env.DB_HOST || config.database.host;
      const port = Number(process.env.MYSQLPORT || process.env.DB_PORT) || config.database.port;
      const user = process.env.MYSQLUSER || process.env.DB_USER || config.database.user;
      const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || config.database.password;
      const database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || config.database.database;

      console.log(`Initializing database at ${host}:${port}...`);

      // Connect to the database with Sequelize
      sequelize = new Sequelize(database, user, password, { 
        host, 
        port, 
        dialect: 'mysql',
        dialectOptions: {
          ssl: {
            rejectUnauthorized: false
          }
        },
        logging: console.log
      });
    }

    // Initialize models
    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    // Define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    // Sync models (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}