
const ExcelJS = require('exceljs');

const ErrorNegocio = require('./ErrorNegocio');
const {
  validarColumnas,
  nombreCanonico,
} = require('../validators/marcacionesValidator');

const MAX_FILAS_BUSQUEDA = 10;

async function leerExcel(rutaArchivo) {
  const libro = new ExcelJS.Workbook();

  try {
    await libro.xlsx.readFile(rutaArchivo);
  } catch {
    throw new ErrorNegocio(
      'El archivo no es un Excel válido',
      400,
      'ARCHIVO_INVALIDO'
    );
  }

  if (libro.worksheets.length === 0) {
    throw new ErrorNegocio(
      'El archivo no contiene hojas de cálculo',
      400,
      'ARCHIVO_VACIO'
    );
  }

  const hoja = libro.worksheets[0];

  let filaEncabezados = null;
  let encabezados = null;
  let columnasFaltantes = [];

  const limite = Math.min(hoja.rowCount, MAX_FILAS_BUSQUEDA);

  for (let numeroFila = 1; numeroFila <= limite; numeroFila++) {
    const fila = hoja.getRow(numeroFila);

    const valores = [];

    for (let columna = 1; columna <= fila.cellCount; columna++) {
      valores.push(
        String(fila.getCell(columna).text ?? '').trim()
      );
    }

    const faltantes = validarColumnas(valores);

    if (faltantes.length === 0) {
      filaEncabezados = numeroFila;
      encabezados = valores;
      break;
    }

    if (
      columnasFaltantes.length === 0 ||
      faltantes.length < columnasFaltantes.length
    ) {
      columnasFaltantes = faltantes;
    }
  }

  if (!filaEncabezados) {
    throw new ErrorNegocio(
      `No se encontraron los encabezados en las primeras ${MAX_FILAS_BUSQUEDA} filas. Columnas faltantes: ${columnasFaltantes.join(', ')}`,
      400,
      'COLUMNAS_FALTANTES'
    );
  }

  const filas = [];

  hoja.eachRow((fila, numeroFila) => {
    if (numeroFila <= filaEncabezados) return;

    const registro = {};
    let tieneDatos = false;

    encabezados.forEach((encabezado, indice) => {
      const valor = fila.getCell(indice + 1).value;

      registro[nombreCanonico(encabezado)] = valor;

      if (valor !== null && valor !== undefined && valor !== '') {
        tieneDatos = true;
      }
    });

    if (tieneDatos) {
      filas.push({
        numeroFila,
        datos: registro,
      });
    }
  });

  if (filas.length === 0) {
    throw new ErrorNegocio(
      'El archivo no contiene registros de marcaciones',
      400,
      'ARCHIVO_VACIO'
    );
  }

  return {
    nombreHoja: hoja.name,
    filaEncabezados,
    totalFilas: filas.length,
    encabezados,
    filas,
  };
}

module.exports = leerExcel;