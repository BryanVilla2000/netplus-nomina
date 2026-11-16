const bcrypt = require('bcrypt');
const config = require('../src/config/config');

const ROLES = [
  { codigo: 'rrhh', nombre: 'Recursos Humanos / Desarrollo Organizacional' },
  { codigo: 'contabilidad', nombre: 'Contabilidad' },
];

const USUARIOS = [
  { usuario: 'rrhh.admin', nombre: 'Recursos Humanos', rol: 'rrhh' },
  { usuario: 'contabilidad', nombre: 'Contabilidad', rol: 'contabilidad' },
];

exports.seed = async (knex) => {
  if (!config.SEED_PASSWORD) {
    throw new Error('Define SEED_PASSWORD en backend/.env (mínimo 8 caracteres)');
  }

  await knex('roles').insert(ROLES).onConflict('codigo').merge();

  const roles = await knex('roles').select('id', 'codigo');
  const idRol = Object.fromEntries(roles.map((r) => [r.codigo, r.id]));
  const clave_hash = await bcrypt.hash(config.SEED_PASSWORD, 12);

  for (const u of USUARIOS) {
    const existente = await knex('usuarios').whereRaw('lower(usuario) = ?', [u.usuario]).first();
    const datos = { nombre: u.nombre, rol_id: idRol[u.rol], clave_hash, activo: true };
    if (existente) await knex('usuarios').where({ id: existente.id }).update(datos);
    else await knex('usuarios').insert({ usuario: u.usuario, ...datos });
  }

  console.log('Usuarios de prueba listos:', USUARIOS.map((u) => `${u.usuario} (${u.rol})`).join(', '));
};