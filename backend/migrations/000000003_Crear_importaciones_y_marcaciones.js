
exports.up = async (knex) => {
  await knex.schema.createTable('importaciones', (table) => {
    table.increments('id').primary();

    table.string('tipo', 30).notNullable();
    table.string('nombre_archivo', 255).notNullable();
    table.string('hash_archivo', 64);
    table.string('estado', 30).notNullable().defaultTo('procesando');

    table.integer('total_registros').notNullable().defaultTo(0);
    table.integer('registros_procesados').notNullable().defaultTo(0);
    table.integer('registros_error').notNullable().defaultTo(0);

    table
      .integer('usuario_id')
      .unsigned()
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.text('observaciones');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('finalizado_en', { useTz: true });
  });

  await knex.schema.createTable('bitacora_importaciones', (table) => {
    table.increments('id').primary();

    table
      .integer('importacion_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('importaciones')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.integer('numero_fila');
    table.string('tipo', 30).notNullable();
    table.text('mensaje').notNullable();
    table.jsonb('datos');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('marcaciones', (table) => {
    table.increments('id').primary();

    table
      .integer('empleado_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('empleados')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .integer('importacion_id')
      .unsigned()
      .references('id')
      .inTable('importaciones')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.dateTime('fecha_hora').notNullable();
    table.string('tipo_marcacion', 30).notNullable();
    table.string('tipo_dispositivo', 50);
    table.string('fuente_datos', 100);

    table.jsonb('datos_originales');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['empleado_id', 'fecha_hora']);
    table.index(['importacion_id']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('marcaciones');
  await knex.schema.dropTableIfExists('bitacora_importaciones');
  await knex.schema.dropTableIfExists('importaciones');
};
