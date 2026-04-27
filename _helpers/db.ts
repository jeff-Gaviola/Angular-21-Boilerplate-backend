import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

initialize();

async function initialize() {
  const { host, port, user, password, database } = (config as any).database;

  const connection = await mysql.createConnection({ host, port, user, password });

  // Create database if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);

  // Connect to the database with Sequelize
  const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

  // Initialize models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  // Define relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  // Sync models (create tables if they don't exist)
  await sequelize.sync();
}