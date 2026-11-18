class ErrorNegocio extends Error {
  constructor(mensaje, estado = 400, codigo = 'DATOS_INVALIDOS') {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo;
  }
}

module.exports = ErrorNegocio;