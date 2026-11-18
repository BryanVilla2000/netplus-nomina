import { Navigate, useLocation } from 'react-router-dom'
import AccesoDenegado from '../pages/AccesoDenegado'
import { useAuth } from './AuthContext'
import { rutaInicial } from './rutaInicial'

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

function SinAcceso() {
  const { logout } = useAuth()
  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <section className="card border-0 w-100 shadow text-center" style={{ maxWidth: 440, borderRadius: 20 }}>
        <div className="card-body p-4">
          <h1 className="fw-bold fs-4 mb-2" style={{ color: 'var(--color-azul)' }}>
            Sin acceso
          </h1>
          <p className="text-secondary mb-4">Tu cuenta no tiene vistas asignadas. Contacta al administrador.</p>
          <button type="button" className="btn btn-primary w-100" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  )
}

export function RutaProtegida({ permiso, children }) {
  const { usuario, verificando, puede } = useAuth()
  const ubicacion = useLocation()

  if (verificando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion }} />
  if (rutaInicial(puede) === null) return <SinAcceso />
  if (permiso && !puede(permiso)) return <AccesoDenegado />
  return children
}

export function SoloInvitados({ children }) {
  const { usuario, verificando, puede } = useAuth()

  if (verificando) return <Cargando />
  if (usuario) return <Navigate to={rutaInicial(puede) ?? '/'} replace />
  return children
}

export function IrAlInicio() {
  const { usuario, puede } = useAuth()
  return <Navigate to={(usuario && rutaInicial(puede)) || '/'} replace />
}