
exports.up = async (knex) => {
  await knex.schema.createTable('asistencias_diarias', (table) => {
    table.increments('id');

    table
      .integer('empleado_id')
      .notNullable()
      .references('id')
      .inTable('empleados')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.date('fecha').notNullable();

    table
      .integer('turno_id')
      .references('id')
      .inTable('turnos')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table
      .integer('feriado_id')
      .references('id')
      .inTable('feriados')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.time('primera_entrada');
    table.time('ultima_salida');

    table.integer('minutos_trabajados').notNullable().defaultTo(0);
    table.integer('minutos_atraso').notNullable().defaultTo(0);
    table.integer('minutos_falta').notNullable().defaultTo(0);

    table.string('estado', 30).notNullable().defaultTo('pendiente');
    table.text('observaciones');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('actualizado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['empleado_id', 'fecha']);
  });

  await knex.schema.createTable('asistencia_marcaciones', (table) => {
    table.increments('id');

    table
      .integer('asistencia_diaria_id')
      .notNullable()
      .references('id')
      .inTable('asistencias_diarias')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .integer('marcacion_id')
      .notNullable()
      .references('id')
      .inTable('marcaciones')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.integer('orden').notNullable();
    table.string('funcion', 30);

    table.unique(['asistencia_diaria_id', 'marcacion_id']);
  });

  await knex.schema.createTable('periodos_corte', (table) => {
    table.increments('id');

    table.string('nombre', 100).notNullable();
    table.date('fecha_inicio').notNullable();
    table.date('fecha_fin').notNullable();

    table.string('estado', 30).notNullable().defaultTo('abierto');
    table.text('observaciones');

    table
      .integer('creado_por')
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('cerrado_en', { useTz: true });

    table.unique(['fecha_inicio', 'fecha_fin']);
  });

  await knex.schema.createTable('resumen_asistencia', (table) => {
    table.increments('id');

    table
      .integer('periodo_id')
      .notNullable()
      .references('id')
      .inTable('periodos_corte')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .integer('empleado_id')
      .notNullable()
      .references('id')
      .inTable('empleados')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.integer('dias_trabajados').notNullable().defaultTo(0);
    table.integer('dias_falta').notNullable().defaultTo(0);

    table.integer('minutos_normales').notNullable().defaultTo(0);
    table.integer('minutos_suplementarios').notNullable().defaultTo(0);
    table.integer('minutos_extras').notNullable().defaultTo(0);
    table.integer('minutos_nocturnos').notNullable().defaultTo(0);

    table.integer('minutos_atraso').notNullable().defaultTo(0);
    table.integer('minutos_permisos').notNullable().defaultTo(0);

    table.text('observaciones');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('actualizado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['periodo_id', 'empleado_id']);
  });

  await knex.schema.createTable('detalle_novedades', (table) => {
    table.increments('id');

    table
      .integer('asistencia_diaria_id')
      .notNullable()
      .references('id')
      .inTable('asistencias_diarias')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .integer('permiso_id')
      .references('id')
      .inTable('permisos')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.string('tipo', 50).notNullable();
    table.date('fecha').notNullable();
    table.text('descripcion');

    table.integer('minutos').notNullable().defaultTo(0);
    table.text('observaciones');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['asistencia_diaria_id']);
    table.index(['permiso_id']);
  });

  await knex.schema.createTable('ajustes_consolidado', (table) => {
    table.increments('id');

    table
      .integer('resumen_asistencia_id')
      .notNullable()
      .references('id')
      .inTable('resumen_asistencia')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.string('campo', 60).notNullable();
    table.jsonb('valor_anterior');
    table.jsonb('valor_nuevo');

    table.text('motivo').notNullable();

    table
      .integer('usuario_id')
      .notNullable()
      .references('id')
      .inTable('usuarios')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.timestamp('creado_en', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['resumen_asistencia_id']);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('ajustes_consolidado');
  await knex.schema.dropTableIfExists('detalle_novedades');
  await knex.schema.dropTableIfExists('resumen_asistencia');
  await knex.schema.dropTableIfExists('periodos_corte');
  await knex.schema.dropTableIfExists('asistencia_marcaciones');
  await knex.schema.dropTableIfExists('asistencias_diarias');
};
