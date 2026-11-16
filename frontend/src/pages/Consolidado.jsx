import Encabezado from '../components/Encabezado'

// Reporte por período de corte (RF-010): la única pantalla que ve Contabilidad.
export default function Consolidado() {
  return (
    <>
      <Encabezado titulo="Reporte por período" subtitulo="Consolidado por empleado del período de corte" />
      <section className="app__contenido">
        <div className="card panel-tarjeta">
          <div className="card-body p-4 text-secondary">Aquí irá el consolidado por período de corte.</div>
        </div>
      </section>
    </>
  )
}