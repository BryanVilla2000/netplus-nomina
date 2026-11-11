import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

function Cargando() {
  return (
    <div
      role="status"
      style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--color-suave)' }}
    >
      Cargando…
    </div>
  )
}

// Solo entra quien tiene sesión; si no, va al login y luego regresa a donde quería ir
export function RutaProtegida({ children }) {
  const { usuario, verificando } = useAuth()
  const ubicacion = useLocation()

  if (verificando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion }} />
  return children
}

// El login solo es para quien aún no inició sesión
export function SoloInvitados({ children }) {
  const { usuario, verificando } = useAuth()

  if (verificando) return <Cargando />
  if (usuario) return <Navigate to="/" replace />
  return children
}
