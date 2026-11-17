
exports.up = async (knex) => {
  await knex.schema.createTable('tipos_permisos', (table) => {
    table.increments('id');
    table.string('codigo', 40).notNullable().unique();
    table.string('nombre', 100).notNullable();
    table.boolean('activo').notNullable().defaultTo(true);
    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('permisos', (table) => {
    table.increments('id');

    table
      .integer('empleado_id')
      .notNullable()
      .references('id')
      .inTable('empleados')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .integer('tipo_permiso_id')
      .notNullable()
      .references('id')
      .inTable('tipos_permisos')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.date('fecha_inicio').notNullable();
    table.date('fecha_fin').notNullable();

    table.time('hora_inicio');
    table.time('hora_fin');

    table.integer('minutos_solicitados');
    table.text('motivo');
    table.text('comentarios');

    table.string('estado', 30).notNullable().defaultTo('pendiente');
    table.string('aprobador_nombre', 150);

    table
      .integer('aprobado_por')
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('actualizado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['empleado_id', 'fecha_inicio', 'fecha_fin']);
    table.index(['estado']);
  });

  await knex.schema.createTable('historial_estados_permiso', (table) => {
    table.increments('id');

    table
      .integer('permiso_id')
      .notNullable()
      .references('id')
      .inTable('permisos')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.string('estado_anterior', 30);
    table.string('estado_nuevo', 30).notNullable();
    table.text('comentario');

    table
      .integer('usuario_id')
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('historial_estados_permiso');
  await knex.schema.dropTableIfExists('permisos');
  await knex.schema.dropTableIfExists('tipos_permisos');
};
