
async function crearImportacion(trx, datos) {
  const [importacion] = await trx('importaciones')
    .insert({
      tipo: 'marcaciones',
      nombre_archivo: datos.nombreArchivo,
      hash_archivo: datos.hashArchivo,
      estado: 'procesando',
      usuario_id: datos.usuarioId,
      total_registros: datos.totalRegistros,
      registros_procesados: 0,
      registros_error: 0,
    })
    .returning('*');

  return importacion;
}

async function finalizarImportacion(trx, datos) {
  await trx('importaciones')
    .where({ id: datos.importacionId })
    .update({
      estado: datos.estado,
      registros_procesados: datos.registrosProcesados,
      registros_error: datos.registrosError,
      observaciones: datos.observaciones || null,
      finalizado_en: trx.fn.now(),
    });
}

async function registrarError(trx, datos) {
  await trx('bitacora_importaciones').insert({
    importacion_id: datos.importacionId,
    numero_fila: datos.numeroFila,
    tipo: 'error',
    mensaje: datos.mensaje,
    datos: datos.datos || null,
  });
}

module.exports = {
  crearImportacion,
  finalizarImportacion,
  registrarError,
};
