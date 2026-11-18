
const express = require('express');

const {
  importarMarcaciones,
} = require('../controllers/marcacionesController');

const {
  requiereSesion,
  requierePermiso,
} = require('../middleware/auth');

const validarArchivo = require('../middleware/validarArchivo');

const router = express.Router();

router.post(
  '/importar',
  requiereSesion,
  requierePermiso('importar'),
  validarArchivo,
  importarMarcaciones
);

module.exports = router;
