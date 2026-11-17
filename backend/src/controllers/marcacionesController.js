
const fs = require('fs/promises');
const db = require('../config/db');

const leerExcel = require('../utils/leerExcel');
const calcularHash = require('../utils/calcularHash');
const { normalizarMarcacion } = require('../utils/normalizarDatos');

const {
  crearImportacion,
  finalizarImportacion,
  registrarError,
} = require('../services/importacionesService');

const {
  registrarMarcacion,
} = require('../services/marcacionesService');

async function importarMarcaciones(req, res, next) {
  const rutaArchivo = req.file?.path;
  let importacionId = null;

  let procesados = 0;
  let errores = 0;
  let duplicados = 0;

  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes seleccionar un archivo Excel',
      });
    }

    const hashArchivo = await calcularHash(rutaArchivo);

    const importacionExistente = await db('importaciones')
      .where({ hash_archivo: hashArchivo })
      .whereIn('estado', ['completada', 'completada_con_errores'])
      .first();

    if (importacionExistente) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Este archivo ya fue importado anteriormente',
      });
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
            mensaje: error.message,
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
