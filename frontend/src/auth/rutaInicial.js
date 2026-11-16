// Primera pantalla de cada rol: RRHH / DO entra al panel; Contabilidad, al consolidado.
// Devuelve null si el usuario no tiene ninguna vista asignada.
export function rutaInicial(puede) {
  if (puede('ver_panel')) return '/'
  if (puede('ver_consolidado')) return '/consolidado'
  return null
}