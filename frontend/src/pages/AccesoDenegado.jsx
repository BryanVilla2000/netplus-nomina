import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { rutaInicial } from '../auth/rutaInicial'
import Encabezado from '../components/Encabezado'

export default function AccesoDenegado() {
  const { puede } = useAuth()
  const destino = rutaInicial(puede) ?? '/'

  return (
    <>
      <Encabezado
        titulo="Acceso restringido"
        subtitulo="Esta sección es solo para Recursos Humanos / Desarrollo Organizacional"
      />
      <section className="app__contenido">
        <div className="card panel-tarjeta">
          <div className="card-body d-flex flex-column align-items-center text-center gap-3 px-4 py-5">
            <span className="acceso__icono" aria-hidden="true">
              i
            </span>
            <h2 className="acceso__titulo">No tienes acceso a esta sección</h2>
            <p className="acceso__texto">
              Importar archivos, Permisos y horas extra, Feriados y Horarios de turno son solo para Recursos Humanos /
              Desarrollo Organizacional. Como Contabilidad puedes consultar el consolidado por período.
            </p>
            <Link to={destino} className="btn btn-primary acceso__boton">
              {destino === '/consolidado' ? 'Ir al consolidado por período' : 'Ir al panel principal'}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}