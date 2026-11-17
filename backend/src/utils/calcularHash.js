
const crypto = require('crypto');
const fs = require('fs');

function calcularHash(rutaArchivo) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const archivo = fs.createReadStream(rutaArchivo);

    archivo.on('data', (contenido) => {
      hash.update(contenido);
    });

    archivo.on('end', () => {
      resolve(hash.digest('hex'));
    });

    archivo.on('error', reject);
  });
}

module.exports = calcularHash;
