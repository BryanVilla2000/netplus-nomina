const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const db = require('./config/db');
const authRutas = require('./routes/auth'); // NUEVO
const marcacionesRutas = require('./routes/marcaciones');
const reportesRutas = require('./routes/reportes');
const { noEncontrado, manejadorErrores } = require('./middleware/errores');

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json({ limit: '10kb' }));



app.use('/api/auth', authRutas); // 
app.use('/api/marcaciones', marcacionesRutas);
app.use('/api/reportes', reportesRutas);


app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;