
exports.up = async (knex) => {
  await knex.schema.createTable('turnos', (table) => {
    table.increments('id');
    table.string('codigo', 30).notNullable().unique();
    table.string('nombre', 100).notNullable();

    table.time('hora_entrada').notNullable();
    table.time('hora_salida').notNullable();

    table.boolean('cruza_medianoche').notNullable().defaultTo(false);
    table.integer('tolerancia_minutos').notNullable().defaultTo(0);
    table.boolean('activo').notNullable().defaultTo(true);

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('asignaciones_turnos', (table) => {
    table.increments('id');

    table
      .integer('empleado_id')
      .notNullable()
      .references('id')
      .inTable('empleados')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .integer('turno_id')
      .notNullable()
      .references('id')
      .inTable('turnos')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.date('fecha_desde').notNullable();
    table.date('fecha_hasta');

    table.text('observaciones');

    table
      .integer('asignado_por')
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['empleado_id', 'fecha_desde', 'fecha_hasta']);
  });

  await knex.schema.createTable('feriados', (table) => {
    table.increments('id');

    table.string('nombre', 120).notNullable();
    table.date('fecha_original').notNullable();
    table.date('fecha_trasladada');

    table.text('observaciones');
    table.boolean('activo').notNullable().defaultTo(true);

    table
      .integer('creado_por')
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['fecha_original']);
    table.index(['fecha_trasladada']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('feriados');
  await knex.schema.dropTableIfExists('asignaciones_turnos');
  await knex.schema.dropTableIfExists('turnos');
};
