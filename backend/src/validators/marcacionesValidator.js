
const { z } = require('zod');

const COLUMNAS_REQUERIDAS = [
  'Id del Empleado',
  'Nombres',
  'ID de Departamento',
  'Departamento',
  'ID del Cargo',
  'Fecha',
  'Hora',
  'Tipo de Marcación',
  'Tipo',
  'Fuente de Datos',
];

const esquemaMarcacion = z.object({
  empleadoId: z.string().regex(/^\d+$/, 'ID de empleado inválido'),
  nombres: z.string().min(1, 'Los nombres son obligatorios'),
  departamentoId: z.string().regex(/^\d+$/, 'ID de departamento inválido'),
  departamento: z.string().min(1, 'El departamento es obligatorio'),
  cargoId: z.string().regex(/^\d+$/, 'ID de cargo inválido'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  hora: z.string().min(1, 'La hora es obligatoria'),
  tipoMarcacion: z.string().min(1, 'El tipo de marcación es obligatorio'),
  tipo: z.string().optional(),
  fuenteDatos: z.string().optional(),
  datosOriginales: z.record(z.string(), z.unknown()),
});

function validarColumnas(columnas) {
  const normalizar = (valor) =>
    String(valor ?? '').trim().toLowerCase();

  const disponibles = columnas.map(normalizar);

  return COLUMNAS_REQUERIDAS.filter(
    (columna) => !disponibles.includes(normalizar(columna))
  );
}

module.exports = {
  COLUMNAS_REQUERIDAS,
  esquemaMarcacion,
  validarColumnas,
};
