import Encabezado from '../components/Encabezado'

// Panel principal (Figma: "Panel principal"). Por ahora solo el armazón: aquí irán los indicadores.
export default function Inicio() {
  return (
    <>
      <Encabezado titulo="Panel principal" subtitulo="Resumen del período de corte" />
      <section className="app__contenido">
        <div className="card panel-tarjeta">
          <div className="card-body p-4 text-secondary">Aquí irán los indicadores del período de corte.</div>
        </div>
      </section>
    </>
  )
}