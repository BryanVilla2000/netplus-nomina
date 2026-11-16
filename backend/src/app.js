const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const db = require('./config/db');
const authRutas = require('./routes/auth'); // NUEVO
const { noEncontrado, manejadorErrores } = require('./middleware/errores');

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json({ limit: '10kb' }));

// Ruta de prueba: responde si el servidor está vivo y conectado a la base
app.get('/api/salud', async (req, res) => {
  await db.raw('select 1');
  res.json({ ok: true, bd: 'conectada' });
});

app.use('/api/auth', authRutas); // NUEVO

app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;