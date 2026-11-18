const { z } = require('zod');
const db = require('../config/db');
const ErrorNegocio = require('../utils/ErrorNegocio');

const esquemaDiario = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD'),
  departamento: z.string().regex(/^\d+$/, 'Departamento inválido').optional(),
  buscar: z.string().trim().max(60).optional(),
});

function fechaValida(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
}

function filtrarEmpleados(consulta, { departamento, buscar }) {
  if (departamento) {
    consulta.where('e.departamento_id', Number(departamento));
  }

  if (buscar) {
    const texto = `%${buscar.replace(/[\\%_]/g, '\\$&')}%`;

    consulta.where((q) =>
      q.whereILike('e.codigo_biometrico', texto).orWhereILike('e.nombres', texto)
    );
  }
}

const RANGO_DEL_DIA = 'm.fecha_hora >= ?::date and m.fecha_hora < (?::date + 1)';

async function reporteDiario(req, res) {
  const datos = esquemaDiario.safeParse(req.query);

  if (!datos.success || !fechaValida(datos.data.fecha)) {
    throw new ErrorNegocio('Indica una fecha válida', 400, 'FECHA_INVALIDA');
  }

  const { fecha } = datos.data;
  const filtros = { departamento: datos.data.departamento, buscar: datos.data.buscar };

  const marcaciones = await db('marcaciones as m')
    .join('empleados as e', 'e.id', 'm.empleado_id')
    .leftJoin('departamentos as d', 'd.id', 'e.departamento_id')
    .whereRaw(RANGO_DEL_DIA, [fecha, fecha])
    .modify((q) => filtrarEmpleados(q, filtros))
    .select(
      'e.id as empleado_id',
      'e.codigo_biometrico as codigo',
      'e.nombres',
      'd.nombre as departamento',
      db.raw("to_char(m.fecha_hora, 'HH24:MI') as hora"),
      db.raw('extract(epoch from m.fecha_hora)::bigint as segundos')
    )
    .orderBy([{ column: 'e.id' }, { column: 'm.fecha_hora' }]);

  const porEmpleado = new Map();

  for (const marca of marcaciones) {
    if (!porEmpleado.has(marca.empleado_id)) {
      porEmpleado.set(marca.empleado_id, {
        empleadoId: marca.empleado_id,
        codigo: marca.codigo,
        nombres: marca.nombres,
        departamento: marca.departamento,
        horas: [],
        segundos: [],
      });
    }

    const empleado = porEmpleado.get(marca.empleado_id);
    empleado.horas.push(marca.hora);
    empleado.segundos.push(Number(marca.segundos));
  }

  const filas = [];

  for (const e of porEmpleado.values()) {
    const cantidad = e.horas.length;

    // se suman las parejas entrada-salida; si sobra una marcación, el día queda incompleto
    let minutos = 0;
    for (let i = 0; i + 1 < cantidad; i += 2) {
      minutos += Math.round((e.segundos[i + 1] - e.segundos[i]) / 60);
    }

    filas.push({
      empleadoId: e.empleadoId,
      codigo: e.codigo,
      nombres: e.nombres,
      departamento: e.departamento,
      entrada: e.horas[0],
      salida: cantidad >= 2 ? e.horas[cantidad - 1] : null,
      minutosTrabajados: cantidad >= 2 ? minutos : null,
      marcaciones: cantidad,
      estado: cantidad % 2 === 0 ? 'presente' : 'incompleta',
    });
  }

  const hayDatos = await db('marcaciones as m').whereRaw(RANGO_DEL_DIA, [fecha, fecha]).first('m.id');

  const sinMarcacion = hayDatos
    ? await db('empleados as e')
        .leftJoin('departamentos as d', 'd.id', 'e.departamento_id')
        .where('e.activo', true)
        .whereNotExists(function () {
          this.select(db.raw('1'))
            .from('marcaciones as m')
            .whereRaw('m.empleado_id = e.id')
            .whereRaw(RANGO_DEL_DIA, [fecha, fecha]);
        })
        .modify((q) => filtrarEmpleados(q, filtros))
        .select('e.id as empleado_id', 'e.codigo_biometrico as codigo', 'e.nombres', 'd.nombre as departamento')
    : [];

  for (const e of sinMarcacion) {
    filas.push({
      empleadoId: e.empleado_id,
      codigo: e.codigo,
      nombres: e.nombres,
      departamento: e.departamento,
      entrada: null,
      salida: null,
      minutosTrabajados: null,
      marcaciones: 0,
      estado: 'sin_marcacion',
    });
  }

  filas.sort((a, b) => Number(a.codigo) - Number(b.codigo));

  const departamentos = await db('departamentos').select('id', 'nombre').orderBy('nombre');

  res.json({
    ok: true,
    fecha,
    resumen: {
      conMarcacion: filas.filter((f) => f.estado !== 'sin_marcacion').length,
      incompletas: filas.filter((f) => f.estado === 'incompleta').length,
      sinMarcacion: filas.filter((f) => f.estado === 'sin_marcacion').length,
    },
    filas,
    departamentos,
  });
}

module.exports = { reporteDiario };