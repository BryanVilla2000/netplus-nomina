// Opciones del menú lateral (Figma: "Menú lateral").
// `permiso` es lo que debe tener el usuario para ver la opción (ver backend/src/config/permisos.js):
// RRHH / DO ve todo; Contabilidad solo "Reportes > Por período".
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

// Texto de la tarjeta del usuario, debajo de su nombre
export const SUBTITULO_ROL = {
  rrhh: 'Desarrollo Organizacional',
  contabilidad: 'Solo consolidado por período',
}

// Deja solo las opciones que el usuario puede ver
export function filtrarMenu(menu, puede) {
  return menu
    .map((item) => (item.hijos ? { ...item, hijos: item.hijos.filter((h) => puede(h.permiso)) } : item))
    .filter((item) => (item.hijos ? item.hijos.length > 0 : puede(item.permiso)))
}

// Pantallas del menú que todavía no están hechas (llevan una página provisional)
const IMPLEMENTADAS = ['/', '/consolidado']
export const RUTAS_PENDIENTES = MENU.flatMap((item) => item.hijos ?? [item]).filter(
  (item) => !IMPLEMENTADAS.includes(item.ruta),
)