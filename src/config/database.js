require('dotenv').config({ override: true });

module.exports = {
  dialect: 'mariadb',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  define: {
    timestamps: true,
  },
  dialectOptions: {
    timezone: '-03:00',
    // TiDB Serverless só aceita conexão criptografada (ligado via DATABASE_SSL)
    ...(process.env.DATABASE_SSL === 'true'
      ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
      : {}),
  },
};
