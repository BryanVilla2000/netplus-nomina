export const MENU = [
  { etiqueta: 'Panel principal', titulo: 'Panel principal', ruta: '/', permiso: 'ver_panel' },
  {
    clave: 'reportes',
    etiqueta: 'Reportes',
    hijos: [
      { etiqueta: 'Diario', titulo: 'Reporte diario', ruta: '/reportes/diario', permiso: 'ver_panel' },
      { etiqueta: 'Por período', titulo: 'Reporte por período', ruta: '/consolidado', permiso: 'ver_consolidado' },
      { etiqueta: 'Vacaciones', titulo: 'Vacaciones', ruta: '/reportes/vacaciones', permiso: 'ver_panel' },
      { etiqueta: 'Por empleado', titulo: 'Marcaciones por empleado', ruta: '/reportes/empleados', permiso: 'ver_panel' },
    ],
  },
  { etiqueta: 'Importar marcaciones', titulo: 'Importar marcaciones', ruta: '/importar/marcaciones', permiso: 'importar' },
  { etiqueta: 'Permisos y horas extra', titulo: 'Permisos y horas extra', ruta: '/importar/permisos', permiso: 'importar' },
  { etiqueta: 'Horarios de turno', titulo: 'Horarios de turno', ruta: '/horarios', permiso: 'configurar' },
  { etiqueta: 'Feriados', titulo: 'Feriados', ruta: '/feriados', permiso: 'configurar' },
]

export const SUBTITULO_ROL = {
  rrhh: 'Desarrollo Organizacional',
  contabilidad: 'Solo consolidado por período',
}

export function filtrarMenu(menu, puede) {
  return menu
    .map((item) => (item.hijos ? { ...item, hijos: item.hijos.filter((h) => puede(h.permiso)) } : item))
    .filter((item) => (item.hijos ? item.hijos.length > 0 : puede(item.permiso)))
}

const IMPLEMENTADAS = ['/', '/consolidado', '/importar/marcaciones', '/reportes/diario']
export const RUTAS_PENDIENTES = MENU.flatMap((item) => item.hijos ?? [item]).filter(
  (item) => !IMPLEMENTADAS.includes(item.ruta),
)