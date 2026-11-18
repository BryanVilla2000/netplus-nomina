export function rutaInicial(puede) {
  if (puede('ver_panel')) return '/'
  if (puede('ver_consolidado')) return '/consolidado'
  return null
}