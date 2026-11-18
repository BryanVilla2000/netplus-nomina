const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../config/db');
const { permisosDe } = require('../config/permisos');

function buscarUsuario(condicion) {
  return db('usuarios as u')
    .join('roles as r', 'r.id', 'u.rol_id')
    .select('u.id', 'u.usuario', 'u.nombre', 'u.clave_hash', 'u.activo', 'r.codigo as rol', 'r.nombre as rol_nombre')
    .modify(condicion)
    .first();
}

function datosPublicos(fila) {
  return {
    id: fila.id,
    usuario: fila.usuario,
    nombre: fila.nombre,
    rol: fila.rol,
    rolNombre: fila.rol_nombre,
    permisos: permisosDe(fila.rol), // el frontend los usa para mostrar u ocultar vistas
  };
}

async function requiereSesion(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión', codigo: 'SIN_SESION' });
  }

  let datos;
  try {
    datos = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    const expirada = error.name === 'TokenExpiredError';
    return res.status(401).json({
      mensaje: expirada ? 'Tu sesión expiró. Inicia sesión de nuevo.' : 'Sesión no válida',
      codigo: expirada ? 'SESION_EXPIRADA' : 'SESION_INVALIDA',
    });
  }

  const id = Number(datos.sub);
  const fila = Number.isInteger(id) ? await buscarUsuario((q) => q.where('u.id', id)) : null;
  if (!fila || !fila.activo) {
    return res.status(401).json({ mensaje: 'Sesión no válida', codigo: 'SESION_INVALIDA' });
  }

  req.usuario = datosPublicos(fila);
  next();
}

const requiereRol = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'No tienes acceso a esta sección', codigo: 'SIN_PERMISO' });
  }
  next();
};

const requierePermiso = (permiso) => (req, res, next) => {
  if (!req.usuario || !req.usuario.permisos.includes(permiso)) {
    return res.status(403).json({ mensaje: 'No tienes acceso a esta sección', codigo: 'SIN_PERMISO' });
  }
  next();
};

module.exports = { requiereSesion, requiereRol, requierePermiso, buscarUsuario, datosPublicos };