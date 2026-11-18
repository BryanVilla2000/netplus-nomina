const fs = require('fs/promises');
const { ZodError } = require('zod');
const db = require('../config/db');

const leerExcel = require('../utils/leerExcel');
const calcularHash = require('../utils/calcularHash');
const ErrorNegocio = require('../utils/ErrorNegocio');
const { normalizarMarcacion } = require('../utils/normalizarDatos');

const {
  crearImportacion,
  finalizarImportacion,
  registrarError,
} = require('../services/importacionesService');

const {
  registrarMarcacion,
} = require('../services/marcacionesService');

function mensajeDeError(error) {
  if (error instanceof ZodError) {
    return error.issues.map((problema) => problema.message).join('; ');
  }

  return error.message;
}

async function importarMarcaciones(req, res, next) {
  const rutaArchivo = req.file?.path;
  let importacionId = null;

  let procesados = 0;
  let errores = 0;
  let duplicados = 0;

  try {
    if (!req.file) {
      throw new ErrorNegocio(
        'Debes seleccionar un archivo Excel',
        400,
        'SIN_ARCHIVO'
      );
    }

    const hashArchivo = await calcularHash(rutaArchivo);

    const importacionExistente = await db('importaciones')
      .where({ hash_archivo: hashArchivo, estado: 'completada' })
      .first();

    if (importacionExistente) {
      throw new ErrorNegocio(
        'Este archivo ya fue importado anteriormente',
        409,
        'ARCHIVO_REPETIDO'
      );
    }

    const resultadoExcel = await leerExcel(rutaArchivo);

    const importacion = await db.transaction((trx) =>
      crearImportacion(trx, {
        nombreArchivo: req.file.originalname,
        hashArchivo,
        usuarioId: req.usuario.id,
        totalRegistros: resultadoExcel.totalFilas,
      })
    );

    importacionId = importacion.id;

    for (const fila of resultadoExcel.filas) {
      try {
        const datos = normalizarMarcacion(fila.datos);

        const resultado = await db.transaction((trx) =>
          registrarMarcacion(trx, importacionId, datos)
        );

        procesados++;

        if (resultado.duplicada) {
          duplicados++;
        }
      } catch (error) {
        errores++;

        await db.transaction((trx) =>
          registrarError(trx, {
            importacionId,
            numeroFila: fila.numeroFila,
            mensaje: mensajeDeError(error),
            datos: fila.datos,
          })
        );
      }
    }

    const estado =
      errores > 0 ? 'completada_con_errores' : 'completada';

    await db.transaction((trx) =>
      finalizarImportacion(trx, {
        importacionId,
        estado,
        registrosProcesados: procesados,
        registrosError: errores,
        observaciones: `Marcaciones duplicadas: ${duplicados}`,
      })
    );

    return res.status(200).json({
      ok: true,
      mensaje: 'Importación procesada',
      resultado: {
        importacionId,
        totalRegistros: resultadoExcel.totalFilas,
        procesados,
        errores,
        duplicados,
        estado,
      },
    });
  } catch (error) {
    if (importacionId) {
      try {
        await db.transaction((trx) =>
          finalizarImportacion(trx, {
            importacionId,
            estado: 'error',
            registrosProcesados: procesados,
            registrosError: errores,
            observaciones: error.message,
          })
        );
      } catch (errorBD) {
        error.finalizacionError = errorBD.message;
      }
    }

    next(error);
  } finally {
    if (rutaArchivo) {
      await fs.unlink(rutaArchivo).catch(() => {});
    }
  }
}

module.exports = {
  importarMarcaciones,
};