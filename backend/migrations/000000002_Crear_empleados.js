
exports.up = async (knex) => {
  await knex.schema.createTable('departamentos', (table) => {
    table.increments('id').primary();
    table.string('codigo', 30).unique();
    table.string('nombre', 100).notNullable().unique();
    table.boolean('activo').notNullable().defaultTo(true);
    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('cargos', (table) => {
    table.increments('id').primary();
    table.string('codigo', 30).unique();
    table.string('nombre', 100).notNullable().unique();
    table.boolean('activo').notNullable().defaultTo(true);
    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('empleados', (table) => {
    table.increments('id').primary();

    // Identificador que viene del sistema biométrico.
    table.string('codigo_biometrico', 50).notNullable().unique();

    table.string('nombres', 100).notNullable();
    table.string('apellidos', 100);

    table
      .integer('departamento_id')
      .unsigned()
      .references('id')
      .inTable('departamentos')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .integer('cargo_id')
      .unsigned()
      .references('id')
      .inTable('cargos')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.date('fecha_ingreso');
    table.date('fecha_salida');

    table.boolean('activo').notNullable().defaultTo(true);

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('actualizado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('empleados');
  await knex.schema.dropTableIfExists('cargos');
  await knex.schema.dropTableIfExists('departamentos');
};
