import Encabezado from '../components/Encabezado'

export default function EnConstruccion({ titulo }) {
  return (
    <>
      <Encabezado titulo={titulo} />
      <section className="app__contenido">
        <div className="card panel-tarjeta">
          <div className="card-body p-4 text-secondary">Esta pantalla está en construcción.</div>
        </div>
      </section>
    </>
  )
}