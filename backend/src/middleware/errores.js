function noEncontrado(req, res) {
  res.status(404).json({ mensaje: 'Ruta no encontrada', codigo: 'NO_ENCONTRADO' });
}

// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido', codigo: 'JSON_INVALIDO' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ mensaje: 'La petición es demasiado grande', codigo: 'PETICION_GRANDE' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor', codigo: 'ERROR_INTERNO' });
}

module.exports = { noEncontrado, manejadorErrores };