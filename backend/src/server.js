const config = require('./config');
const db = require('./db');
const app = require('./app');

async function iniciar() {
  try {
    await db.raw('select 1');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    console.error('¿Está encendido el contenedor?  docker start netplus_db');
    process.exit(1);
  }

  const servidor = app.listen(config.PORT, () => {
    console.log(`API lista en http://localhost:${config.PORT}`);
  });

  // Cierre ordenado con Ctrl+C
  const cerrar = () => {
    servidor.close(async () => {
      await db.destroy();
      process.exit(0);
    });
  };
  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
}

iniciar();