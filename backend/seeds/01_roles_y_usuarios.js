
const bcrypt = require('bcrypt');

const ROLES = [
  { codigo: 'rrhh', nombre: 'Recursos Humanos / Desarrollo Organizacional' },
  { codigo: 'contabilidad', nombre: 'Contabilidad' },
];

const USUARIOS = [
  {
    usuario: 'Recursos humano',
    nombre: 'Recursos Humanos',
    rol: 'rrhh',
    variableClave: 'SEED_PASSWORD_RRHH',
  },
  {
    usuario: 'contabilidad',
    nombre: 'Contabilidad',
    rol: 'contabilidad',
    variableClave: 'SEED_PASSWORD_CONTABILIDAD',
  },
];

exports.seed = async (knex) => {
  await knex('roles').insert(ROLES).onConflict('codigo').merge();

  const roles = await knex('roles').select('id', 'codigo');
  const idRol = Object.fromEntries(roles.map((r) => [r.codigo, r.id]));

  for (const u of USUARIOS) {
    const clave = process.env[u.variableClave];

    if (!clave || clave.length < 8) {
      throw new Error(
        `Define ${u.variableClave} en backend/.env (mínimo 8 caracteres)`
      );
    }

    const existente = await knex('usuarios')
      .whereRaw('lower(usuario) = ?', [u.usuario])
      .first();

    const clave_hash = await bcrypt.hash(clave, 12);

    const datos = {
      nombre: u.nombre,
      rol_id: idRol[u.rol],
      clave_hash,
      activo: true,
    };

    if (existente) {
      await knex('usuarios').where({ id: existente.id }).update(datos);
    } else {
      await knex('usuarios').insert({
        usuario: u.usuario,
        ...datos,
      });
    }
  }

  console.log(
    'Usuarios de prueba listos:',
    USUARIOS.map((u) => `${u.usuario} (${u.rol})`).join(', ')
  );
};
