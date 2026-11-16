import { useAuth } from '../auth/AuthContext'

// "Recursos Humanos" -> "RH"; "Contabilidad" -> "CO"
function iniciales(nombre) {
  const palabras = nombre.trim().split(/\s+/)
  const letras = palabras.length > 1 ? palabras[0][0] + palabras[1][0] : nombre.trim().slice(0, 2)
  return letras.toUpperCase()
}

// Franja superior de cada pantalla: título, subtítulo, acciones propias de la pantalla y avatar
export default function Encabezado({ titulo, subtitulo, children }) {
  const { usuario } = useAuth()

  return (
    <header className="encabezado d-flex align-items-center justify-content-between gap-3">
      <div className="encabezado__texto">
        <h1 className="encabezado__titulo">{titulo}</h1>
        {subtitulo && <p className="encabezado__subtitulo">{subtitulo}</p>}
      </div>
      <div className="d-flex align-items-center gap-3 flex-shrink-0">
        {children}
        <span className="encabezado__avatar" title={usuario.nombre} aria-hidden="true">
          {iniciales(usuario.nombre)}
        </span>
      </div>
    </header>
  )
}