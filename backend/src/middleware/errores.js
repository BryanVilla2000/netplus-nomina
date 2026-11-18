const ErrorNegocio = require('../utils/ErrorNegocio');    

function noEncontrado(req, res) {
  res.status(404).json({
    ok: false,
    mensaje: 'Ruta no encontrada',
    codigo: 'NO_ENCONTRADO',
  });
}

function manejadorErrores(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      ok: false,
      mensaje: 'El cuerpo de la petición no es un JSON válido',
      codigo: 'JSON_INVALIDO',
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      ok: false,
      mensaje: 'La petición es demasiado grande',
      codigo: 'PETICION_GRANDE',
    });
  }

  if (err.name === 'MulterError') {
    const erroresMulter = {
      LIMIT_FILE_SIZE: {
        estado: 413,
        mensaje: 'El archivo supera el límite permitido de 30 MB',
        codigo: 'ARCHIVO_GRANDE',
      },
      LIMIT_FILE_COUNT: {
        estado: 400,
        mensaje: 'Solo puedes cargar un archivo por importación',
        codigo: 'DEMASIADOS_ARCHIVOS',
      },
      LIMIT_UNEXPECTED_FILE: {
        estado: 400,
        mensaje: 'El campo del archivo no es válido',
        codigo: 'CAMPO_ARCHIVO_INVALIDO',
      },
    };

    const errorMulter = erroresMulter[err.code];

    if (errorMulter) {
      return res.status(errorMulter.estado).json({
        ok: false,
        mensaje: errorMulter.mensaje,
        codigo: errorMulter.codigo,
      });
    }
  }

  if (err instanceof ErrorNegocio) {
    return res.status(err.estado).json({
      ok: false,
      mensaje: err.message,
      codigo: err.codigo,
    });
  }

  console.error(err);

  return res.status(500).json({
    ok: false,
    mensaje: 'Error interno del servidor',
    codigo: 'ERROR_INTERNO',
  });
}

module.exports = {
  noEncontrado,
  manejadorErrores,
};
