
const { sincronizarEmpleado } = require('./empleadosService');

async function registrarMarcacion(trx, importacionId, datos) {
    const empleadoId = await sincronizarEmpleado(trx, datos);


    const existente = await trx('marcaciones')
        .where({
            empleado_id: empleadoId,
            fecha_hora: datos.fechaHora,
            tipo_marcacion: datos.tipoMarcacion,
        })
        .first();


    if (existente) {
        return {
            registrada: false,
            duplicada: true,
            marcacionId: existente.id,
        };
    }

    const [nueva] = await trx('marcaciones')
        .insert({
            empleado_id: empleadoId,
            importacion_id: importacionId,
            fecha_hora: datos.fechaHora,
            tipo_marcacion: datos.tipoMarcacion,
            fuente_datos: datos.fuenteDatos || null,
            datos_originales: datos.datosOriginales,
        })
        .returning('id');

    return {
        registrada: true,
        duplicada: false,
        marcacionId: nueva.id,
    };
}

module.exports = {
    registrarMarcacion,
};
