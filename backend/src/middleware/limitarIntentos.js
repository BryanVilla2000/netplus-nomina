// Limitador de intentos en memoria, sin librerías extra.
// Sirve para frenar la adivinanza de contraseñas en el login.

function crearLimitador({ maximo, ventanaMs }) {
  const intentos = new Map(); // clave -> { cuenta, desde }

  const limpieza = setInterval(() => {
    const ahora = Date.now();
    for (const [clave, v] of intentos) if (ahora - v.desde > ventanaMs) intentos.delete(clave);
  }, 60_000);
  limpieza.unref(); // no impide que el proceso termine

  return {
    // Devuelve los milisegundos que faltan para poder intentar de nuevo (0 = permitido)
    espera(clave) {
      const v = intentos.get(clave);
      if (!v) return 0;
      const resta = v.desde + ventanaMs - Date.now();
      if (resta <= 0) {
        intentos.delete(clave);
        return 0;
      }
      return v.cuenta >= maximo ? resta : 0;
    },
    fallo(clave) {
      const ahora = Date.now();
      const v = intentos.get(clave);
      if (!v || ahora - v.desde > ventanaMs) intentos.set(clave, { cuenta: 1, desde: ahora });
      else v.cuenta += 1;
    },
    exito(clave) {
      intentos.delete(clave);
    },
  };
}

module.exports = { crearLimitador };