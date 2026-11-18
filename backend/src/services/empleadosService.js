
function normalizarTexto(valor) {
  return String(valor ?? '').trim().replace(/\s+/g, ' ');
}

async function sincronizarCatalogo(
  trx,
  tabla,
  codigo,
  nombreRecibido,
  nombreProvisional
) {
  const existente = await trx(tabla)
    .where({ codigo })
    .first();

  const nombre = normalizarTexto(nombreRecibido);

  const nombreFinal =
    nombre || existente?.nombre || nombreProvisional;

  const conflicto = await trx(tabla)
    .where({ nombre: nombreFinal })
    .modify((consulta) => {
      if (existente) {
        consulta.whereNot({ id: existente.id });
      }
    })
    .first();

  if (conflicto) {
    throw new Error(
      `El nombre "${nombreFinal}" ya está asociado a otro registro de ${tabla}`
    );
  }

  if (existente) {
    if (existente.nombre !== nombreFinal) {
      await trx(tabla)
        .where({ id: existente.id })
        .update({ nombre: nombreFinal });
    }

    return existente.id;
  }

  const [nuevo] = await trx(tabla)
    .insert({
      codigo,
      nombre: nombreFinal,
    })
    .returning('id');

  return nuevo.id;
}

async function sincronizarEmpleado(trx, datos) {
  const empleadoId = normalizarTexto(datos.empleadoId);
  const nombres = normalizarTexto(datos.nombres);

  if (!empleadoId || !nombres) {
    throw new Error('El ID y los nombres del empleado son obligatorios');
  }

  const departamentoId = await sincronizarCatalogo(
    trx,
    'departamentos',
    datos.departamentoId,
    datos.departamento,
    `Departamento ${datos.departamentoId}`
  );

  const cargoId = await sincronizarCatalogo(
    trx,
    'cargos',
    datos.cargoId,
    datos.cargo,
    `Cargo ${datos.cargoId}`
  );

  const existente = await trx('empleados')
    .where({ codigo_biometrico: empleadoId })
    .first();

  if (existente) {
    const cambio =
      existente.nombres !== nombres ||
      existente.departamento_id !== departamentoId ||
      existente.cargo_id !== cargoId;

    if (cambio) {
      await trx('empleados')
        .where({ id: existente.id })
        .update({
          nombres,
          departamento_id: departamentoId,
          cargo_id: cargoId,
          actualizado_en: trx.fn.now(),
        });
    }

    return existente.id;
  }

  const [nuevo] = await trx('empleados')
    .insert({
      codigo_biometrico: empleadoId,
      nombres,
      departamento_id: departamentoId,
      cargo_id: cargoId,
    })
    .returning('id');

  return nuevo.id;
}

module.exports = {
  sincronizarEmpleado,
};
