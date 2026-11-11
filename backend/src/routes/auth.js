const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const config = require('../config');
const { requiereSesion, buscarUsuario, datosPublicos } = require('../middleware/auth');
const { crearLimitador } = require('../middleware/limitarIntentos');

const esquemaLogin = z.object({
  usuario: z.string().trim().min(1).max(50),
  clave: z.string().min(1).max(128),
});

// 5 fallos por usuario y 20 por IP cada 15 minutos
const limitePorUsuario = crearLimitador({ maximo: 5, ventanaMs: 15 * 60 * 1000 });
const limitePorIp = crearLimitador({ maximo: 20, ventanaMs: 15 * 60 * 1000 });

// Se compara contra este hash cuando el usuario no existe, para que la respuesta
// tarde lo mismo y no se pueda averiguar qué usuarios existen.
const HASH_RELLENO = bcrypt.hashSync('relleno-para-usuarios-inexistentes', 12);

router.post('/login', async (req, res) => {
  const datos = esquemaLogin.safeParse(req.body ?? {});
  if (!datos.success) {
    return res.status(400).json({ mensaje: 'Ingresa tu usuario y tu contraseña', codigo: 'DATOS_INVALIDOS' });
  }
  const usuario = datos.data.usuario.toLowerCase();
  const { clave } = datos.data;

  const claveUsuario = `usuario:${req.ip}|${usuario}`;
  const claveIp = `ip:${req.ip}`;
  const espera = Math.max(limitePorUsuario.espera(claveUsuario), limitePorIp.espera(claveIp));
  if (espera > 0) {
    const minutos = Math.ceil(espera / 60_000);
    res.set('Retry-After', String(Math.ceil(espera / 1000)));
    return res.status(429).json({
      mensaje: `Demasiados intentos fallidos. Inténtalo de nuevo en ${minutos} minuto${minutos === 1 ? '' : 's'}.`,
      codigo: 'DEMASIADOS_INTENTOS',
    });
  }

  const fila = await buscarUsuario((q) => q.whereRaw('lower(u.usuario) = ?', [usuario]));
  const activo = Boolean(fila && fila.activo);
  const coincide = await bcrypt.compare(clave, activo ? fila.clave_hash : HASH_RELLENO);

  if (!activo || !coincide) {
    limitePorUsuario.fallo(claveUsuario);
    limitePorIp.fallo(claveIp);
    return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos', codigo: 'CREDENCIALES_INVALIDAS' });
  }

  limitePorUsuario.exito(claveUsuario);

  const token = jwt.sign({ rol: fila.rol }, config.JWT_SECRET, {
    subject: String(fila.id),
    expiresIn: config.JWT_EXPIRA,
    algorithm: 'HS256',
  });

  res.json({ token, usuario: datosPublicos(fila) });
});

// Devuelve el usuario de la sesión actual (el frontend lo usa al abrir la aplicación)
router.get('/me', requiereSesion, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;