import { useAuth } from '../auth/AuthContext'

// Pantalla temporal: aquí irá el consolidado por período de corte (RF-010),
// la única vista que ve Contabilidad.
export default function Consolidado() {
  const { usuario, logout } = useAuth()

  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <section className="card border-0 w-100 shadow" style={{ maxWidth: 440, borderRadius: 20 }}>
        <div className="card-body p-5">
          <h1 className="fw-bold fs-2 mb-3" style={{ color: 'var(--color-azul)' }}>
            Consolidado por período
          </h1>
          <p className="mb-1">
            Hola, <strong>{usuario.nombre}</strong>.
          </p>
          <p className="small text-secondary mt-3 mb-4">Aquí irá el consolidado por período de corte.</p>
          <button type="button" className="btn btn-primary w-100" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  )
}