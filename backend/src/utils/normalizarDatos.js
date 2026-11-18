const { esquemaMarcacion } = require('../validators/marcacionesValidator');

function obtenerValor(valor) {
    if (valor === null || valor === undefined) return '';

    if (valor instanceof Date) return valor;

    if (typeof valor === 'object' && valor.result !== undefined) {
        return obtenerValor(valor.result);
    }

    if (typeof valor === 'object' && valor.text !== undefined) {
        return String(valor.text).trim();
    }

    return String(valor).trim();
}

function normalizarIdentificador(valor, campo) {
    const resultado = obtenerValor(valor);

    if (!resultado || !/^\d+$/.test(String(resultado))) {
        throw new Error(`${campo} debe ser un identificador numérico válido`);
    }

    return String(resultado);
}

function normalizarTexto(valor) {
    return String(obtenerValor(valor))
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizarFecha(valor) {
    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
        const anio = valor.getUTCFullYear();
        const mes = valor.getUTCMonth() + 1;
        const dia = valor.getUTCDate();

        return [
            anio,
            String(mes).padStart(2, '0'),
            String(dia).padStart(2, '0'),
        ].join('-');
    }

    const texto = String(obtenerValor(valor));

    const coincidencia = texto.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

    if (coincidencia) {
        const dia = Number(coincidencia[1]);
        const mes = Number(coincidencia[2]);
        const anio = Number(coincidencia[3]);

        const fecha = new Date(Date.UTC(anio, mes - 1, dia));

        if (
            fecha.getUTCFullYear() !== anio ||
            fecha.getUTCMonth() !== mes - 1 ||
            fecha.getUTCDate() !== dia
        ) {
            throw new Error(`Fecha inválida: ${texto}`);
        }

        return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }

    const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (iso) {
        const anio = Number(iso[1]);
        const mes = Number(iso[2]);
        const dia = Number(iso[3]);

        const fecha = new Date(Date.UTC(anio, mes - 1, dia));

        if (
            fecha.getUTCFullYear() === anio &&
            fecha.getUTCMonth() === mes - 1 &&
            fecha.getUTCDate() === dia
        ) {
            return texto;
        }
    }

    throw new Error(`Fecha inválida: ${texto}`);
}

function normalizarHora(valor) {
    if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
        return [
            String(valor.getUTCHours()).padStart(2, '0'),
            String(valor.getUTCMinutes()).padStart(2, '0'),
            String(valor.getUTCSeconds()).padStart(2, '0'),
        ].join(':');
    }

    const texto = String(obtenerValor(valor));
    const coincidencia = texto.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

    if (!coincidencia) {
        throw new Error(`Hora inválida: ${texto}`);
    }

    const horas = Number(coincidencia[1]);
    const minutos = Number(coincidencia[2]);
    const segundos = Number(coincidencia[3] || 0);

    if (horas > 23 || minutos > 59 || segundos > 59) {
        throw new Error(`Hora inválida: ${texto}`);
    }

    return [
        String(horas).padStart(2, '0'),
        String(minutos).padStart(2, '0'),
        String(segundos).padStart(2, '0'),
    ].join(':');
}

function normalizarMarcacion(datos) {
    const fecha = normalizarFecha(datos.Fecha);
    const hora = normalizarHora(datos.Hora);

    const resultado = {
        empleadoId: normalizarIdentificador(
            datos['Id del Empleado'],
            'ID del empleado'
        ),
        nombres: normalizarTexto(datos.Nombres),
        departamentoId: normalizarIdentificador(
            datos['ID de Departamento'],
            'ID del departamento'
        ),
        departamento: normalizarTexto(datos.Departamento),
        cargoId: normalizarIdentificador(
            datos['ID del Cargo'],
            'ID del cargo'
        ),
        fecha,
        hora,
        fechaHora: `${fecha} ${hora}`,
        tipoMarcacion: normalizarTexto(datos['Tipo de Marcación']),
        tipo: normalizarTexto(datos.Tipo),
        fuenteDatos: normalizarTexto(datos['Fuente de Datos']),
        datosOriginales: datos,
    };

    return esquemaMarcacion.parse(resultado);
}

module.exports = {
    normalizarMarcacion,
};
