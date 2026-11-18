import { useState } from 'react'
import { api } from '../api/cliente'
import Encabezado from '../components/Encabezado'

const MAX_MB = 30

export default function ImportarMarcaciones() {
  const [archivo, setArchivo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)

  function elegir(nuevo) {
    setResultado(null)
    setError('')
    setArchivo(null)
    if (!nuevo) return

    if (!nuevo.name.toLowerCase().endsWith('.xlsx')) {
      setError('Solo se permiten archivos Excel con extensión .xlsx')
      return
    }
    if (nuevo.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${MAX_MB} MB`)
      return
    }
    setArchivo(nuevo)
  }

  function alSoltar(e) {
    e.preventDefault()
    setArrastrando(false)
    elegir(e.dataTransfer.files[0])
  }

  async function importar() {
    if (!archivo || enviando) return
    setEnviando(true)
    setError('')
    setResultado(null)

    const datos = new FormData()
    datos.append('archivo', archivo)

    try {
      const { data } = await api.post('/marcaciones/importar', datos, { timeout: 5 * 60 * 1000 })
      setResultado(data.resultado)
      setArchivo(null)
    } catch (e) {
      setError(e.response?.data?.mensaje ?? 'No se pudo conectar con el servidor')
    } finally {
      setEnviando(false)
    }
  }

  // antes de importar todo está en cero
  const cifras = resultado ?? { totalRegistros: 0, procesados: 0, duplicados: 0, errores: 0 }
  const nuevas = cifras.procesados - cifras.duplicados

  return (
    <>
      <Encabezado
        titulo="Importar marcaciones"
        subtitulo="Sube el reporte de marcaciones exportado desde Z-BioTime"
      />
      <section className="app__contenido">
        <div className="card panel-tarjeta">
          <div className="card-body p-4">
            <label
              className={`d-block text-center border border-2 rounded-3 p-5 ${
                arrastrando ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle'
              }`}
              style={{ borderStyle: 'dashed', cursor: 'pointer' }}
              onDragOver={(e) => {
                e.preventDefault()
                setArrastrando(true)
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={alSoltar}
            >
              <input
                type="file"
                accept=".xlsx"
                className="d-none"
                onChange={(e) => {
                  elegir(e.target.files[0])
                  e.target.value = '' // así se puede volver a elegir el mismo archivo
                }}
              />
              {archivo ? (
                <>
                  <p className="fw-semibold mb-1">{archivo.name}</p>
                  <p className="text-secondary small mb-0">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="fw-semibold mb-1">Arrastra el archivo aquí o haz clic para elegirlo</p>
                  <p className="text-secondary small mb-0">Solo .xlsx, máximo {MAX_MB} MB</p>
                </>
              )}
            </label>

            {error && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {error}
              </div>
            )}

            <div className="mt-3">
              <button type="button" className="btn btn-primary" disabled={!archivo || enviando} onClick={importar}>
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    Importando...
                  </>
                ) : (
                  'Importar'
                )}
              </button>
            </div>

            <div className="mt-4">
              {resultado && (
                <div
                  className={`alert ${resultado.errores > 0 ? 'alert-warning' : 'alert-success'}`}
                  role="status"
                >
                  {resultado.errores > 0
                    ? 'La importación terminó, pero algunas filas tuvieron errores.'
                    : 'Importación completada correctamente.'}
                </div>
              )}
              <div className="row g-3 text-center">
                <Dato titulo="Filas leídas" valor={cifras.totalRegistros} />
                <Dato titulo="Marcaciones nuevas" valor={nuevas} />
                <Dato titulo="Duplicadas" valor={cifras.duplicados} />
                <Dato titulo="Con error" valor={cifras.errores} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Dato({ titulo, valor }) {
  return (
    <div className="col-6 col-md-3">
      <div className="border rounded-3 p-3">
        <div className="fs-3 fw-bold">{valor}</div>
        <div className="text-secondary small">{titulo}</div>
      </div>
    </div>
  )
}