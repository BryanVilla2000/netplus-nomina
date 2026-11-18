const config = require('./src/config/config');

module.exports = {
  client: 'pg',
  connection: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  },
  pool: {
    min: 0,
    max: 10,
    afterCreate: (conexion, listo) => {
      conexion.query("SET TIME ZONE 'America/Guayaquil'", (error) => listo(error, conexion));
    },
  },
  migrations: { directory: './migrations' },
  seeds: { directory: './seeds' },
};