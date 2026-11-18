
const multer = require('multer');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const ErrorNegocio = require('../utils/ErrorNegocio');

const almacenamiento = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, os.tmpdir());
  },

  filename: (req, file, callback) => {
    const nombreTemporal = `${crypto.randomUUID()}.xlsx`;
    callback(null, nombreTemporal);
  },
});

const filtroArchivo = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== '.xlsx') {
    return callback(
      new ErrorNegocio(
        'Solo se permiten archivos Excel con extensión .xlsx',
        400,
        'FORMATO_ARCHIVO_INVALIDO'
      )
    );
  }

  callback(null, true);
};

const validarArchivo = multer({
  storage: almacenamiento,
  fileFilter: filtroArchivo,
  limits: {
    fileSize: 30 * 1024 * 1024,
    files: 1,
  },
}).single('archivo');

module.exports = validarArchivo;
