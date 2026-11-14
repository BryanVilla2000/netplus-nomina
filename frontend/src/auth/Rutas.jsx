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

// Primera pantalla de cada rol: RRHH / DO entra al panel; Contabilidad, al consolidado.
// Devuelve null si el usuario no tiene ninguna vista asignada.
function rutaInicial(puede) {
  if (puede('ver_panel')) return '/'
  if (puede('ver_consolidado')) return '/consolidado'
  return null
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

// Solo entra quien tiene sesión; si no, va al login y luego regresa a donde quería ir.
// Con `permiso`, además debe tener ese permiso: si no, se le lleva a la pantalla de su rol.
export function RutaProtegida({ permiso, children }) {
  const { usuario, verificando, puede } = useAuth()
  const ubicacion = useLocation()

  if (verificando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion }} />

  if (permiso && !puede(permiso)) {
    const destino = rutaInicial(puede)
    return destino ? <Navigate to={destino} replace /> : <SinAcceso />
  }
  return children
}

// El login solo es para quien aún no inició sesión
export function SoloInvitados({ children }) {
  const { usuario, verificando, puede } = useAuth()

  if (verificando) return <Cargando />
  if (usuario) return <Navigate to={rutaInicial(puede) ?? '/'} replace />
  return children
}