
const PERMISOS = {
  rrhh: ['ver_panel', 'ver_consolidado', 'importar', 'configurar'],
  contabilidad: ['ver_consolidado'],
};

const permisosDe = (rol) => PERMISOS[rol] ?? [];

module.exports = { PERMISOS, permisosDe };