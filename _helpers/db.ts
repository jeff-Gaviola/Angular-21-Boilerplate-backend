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
    const host = process.env.MYSQLHOST || process.env.DB_HOST || config.database.host;
    const port = Number(process.env.MYSQLPORT || process.env.DB_PORT) || config.database.port;
    const user = process.env.MYSQLUSER || process.env.DB_USER || config.database.user;
    const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || config.database.password;
    const database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || config.database.database;

    console.log(`Initializing database at ${host}:${port}...`);

    // Create database if it doesn't exist (only if not in production/Railway)
    if (process.env.NODE_ENV !== 'production') {
      const connection = await mysql.createConnection({ host, port, user, password });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
      await connection.end();
    }

    // Connect to the database with Sequelize
    const sequelize = new Sequelize(database, user, password, { 
      host, 
      port, 
      dialect: 'mysql',
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false // Required for some public cloud database connections
        }
      },
      logging: console.log // Enable detailed logging to see the exact SQL and errors
    });

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