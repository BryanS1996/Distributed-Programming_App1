const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Prueba de conexión inicial
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error conectando a Postgres:', err.stack);
  } else {
    console.log('Conexión exitosa a la base de datos:', res.rows[0].now);
  }
});

module.exports = pool;