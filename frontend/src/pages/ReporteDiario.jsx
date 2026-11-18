import { useEffect, useState } from 'react'
import { api } from '../api/cliente'
import Encabezado from '../components/Encabezado'
import './ReporteDiario.css'

function ayer() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

function horasYMinutos(minutos) {
  if (minutos === null || minutos === undefined) return '—'
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${h} h ${String(m).padStart(2, '0')} min`
}

function consultar(filtros) {
  const params = { fecha: filtros.fecha }
  if (filtros.departamento) params.departamento = filtros.departamento
  if (filtros.buscar.trim()) params.buscar = filtros.buscar.trim()

  return api.get('/reportes/diario', { params }).then((respuesta) => respuesta.data)
}

const mensajeDe = (e) => e.response?.data?.mensaje ?? 'No se pudo conectar con el servidor'

const ESTADOS = {
  presente: { texto: 'Presente', clase: 'text-bg-light border' },
  incompleta: { texto: 'Marcación incompleta', clase: 'text-bg-danger-subtle text-danger-emphasis' },
  sin_marcacion: { texto: 'Sin marcación', clase: 'text-bg-danger' },
}

export default function ReporteDiario() {
  const [fecha, setFecha] = useState(ayer())
  const [departamento, setDepartamento] = useState('')
  const [buscar, setBuscar] = useState('')
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // la primera carga usa el día anterior sin filtros
  useEffect(() => {
    consultar({ fecha: ayer(), departamento: '', buscar: '' })
      .then(setDatos)
      .catch((e) => setError(mensajeDe(e)))
      .finally(() => setCargando(false))
  }, [])

  function pedir(filtros) {
    setCargando(true)
    setError('')
    consultar(filtros)
      .then(setDatos)
      .catch((e) => {
        setDatos(null)
        setError(mensajeDe(e))
      })
      .finally(() => setCargando(false))
  }

  function aplicar(e) {
    e.preventDefault()
    if (fecha) pedir({ fecha, departamento, buscar })
  }

  function limpiar() {
    const inicial = { fecha: ayer(), departamento: '', buscar: '' }
    setFecha(inicial.fecha)
    setDepartamento('')
    setBuscar('')
    pedir(inicial)
  }

  const resumen = datos?.resumen ?? { conMarcacion: 0, incompletas: 0, sinMarcacion: 0 }
  const filas = datos?.filas ?? []

  return (
    <>
      <Encabezado titulo="Reporte diario" subtitulo="Asistencia por empleado para la fecha seleccionada" />
      <section className="app__contenido">
        <form className="card panel-tarjeta mb-3 rd-filtros" onSubmit={aplicar}>
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <label htmlFor="rd-fecha" className="form-label fw-semibold small">
                  Fecha
                </label>
                <input
                  id="rd-fecha"
                  type="date"
                  className="form-control"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3">
                <label htmlFor="rd-departamento" className="form-label fw-semibold small">
                  Departamento
                </label>
                <select
                  id="rd-departamento"
                  className="form-select"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                >
                  <option value="">Todos los departamentos</option>
                  {(datos?.departamentos ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label htmlFor="rd-buscar" className="form-label fw-semibold small">
                  Colaborador
                </label>
                <input
                  id="rd-buscar"
                  type="search"
                  className="form-control"
                  placeholder="Buscar por código o nombre"
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3 d-flex gap-2">
                <button type="button" className="btn btn-outline-primary" onClick={limpiar}>
                  Limpiar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!fecha || cargando}>
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="row g-3 mb-3">
          <Tarjeta titulo="Con marcación" valor={resumen.conMarcacion} color="success" />
          <Tarjeta titulo="Sin marcación" valor={resumen.sinMarcacion} color="danger" />
          <Tarjeta titulo="Marcaciones incompletas" valor={resumen.incompletas} color="danger" />
        </div>

        <div className="card panel-tarjeta">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-1">Asistencia del día</h2>
            <p className="text-secondary small">
              Los atrasos, horas extra y vacaciones se calcularán cuando estén los turnos, feriados y permisos.
            </p>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="small text-secondary text-uppercase">
                    <th>Colaborador</th>
                    <th>Departamento</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Horas trabajadas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando && (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary py-4">
                        Cargando...
                      </td>
                    </tr>
                  )}
                  {!cargando && !error && filas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-secondary py-4">
                        No hay datos para esta fecha. Revisa que ya se haya importado el archivo de marcaciones.
                      </td>
                    </tr>
                  )}
                  {!cargando &&
                    filas.map((f) => {
                      const estado = ESTADOS[f.estado]
                      return (
                        <tr key={f.empleadoId}>
                          <td className="fw-semibold">
                            {f.nombres}
                            <div className="text-secondary small fw-normal">Código {f.codigo}</div>
                          </td>
                          <td>{f.departamento ?? '—'}</td>
                          <td>{f.entrada ?? '—'}</td>
                          <td>{f.salida ?? (f.estado === 'incompleta' ? 'sin salida' : '—')}</td>
                          <td>{horasYMinutos(f.minutosTrabajados)}</td>
                          <td>
                            <span className={`badge rounded-pill ${estado.clase}`}>{estado.texto}</span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Tarjeta({ titulo, valor, color }) {
  return (
    <div className="col-12 col-md-4">
      <div className="card panel-tarjeta h-100">
        <div className="card-body">
          <div className={`bg-${color} rounded mb-2`} style={{ width: 28, height: 4 }} />
          <div className="text-secondary small">{titulo}</div>
          <div className="fs-2 fw-bold">{valor}</div>
        </div>
      </div>
    </div>
  )
}