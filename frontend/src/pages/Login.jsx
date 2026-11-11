import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { describirError } from '../api/cliente'
import { useAuth } from '../auth/AuthContext'

// Única imagen necesaria: Tu logo oficial en la carpeta img
import imgLogoNettplus from '../assets/img/Logo-Nettplus.png' 
import './Login.css'

function PanelDeMarca() {
  return (
    <aside className="login__marca position-relative d-none d-lg-flex flex-column justify-content-between align-items-start overflow-hidden w-50 flex-shrink-0 p-5">
      
      {/* Logotipo oficial */}
      <div className="logo d-flex align-items-center">
        <img 
          src={imgLogoNettplus} 
          alt="Nettplus - The Power of Fiber" 
          className="img-fluid" 
          style={{ maxHeight: '55px', objectFit: 'contain' }} 
        />
      </div>

      <div className="mensaje d-flex flex-column align-items-start">
        {/* Punto de viñeta hecho con CSS (sin archivos externos) */}
        <div className="mensaje__etiqueta d-flex align-items-center gap-2 mb-2">
          <span className="bg-success rounded-circle d-inline-block" style={{ width: '8px', height: '8px' }} aria-hidden="true" />
          <span>PANEL DE NÓMINA</span>
        </div>
        <h2 className="mensaje__titulo">Control de asistencia, claro y al día.</h2>
        <p className="mensaje__texto">
          Importa las marcaciones de Z-BioTime y consulta atrasos, faltas y horas extra por período de corte.
        </p>
      </div>

      <p className="login__derechos mb-0">© 2026 Nettplus. Todos los derechos reservados.</p>
    </aside>
  )
}

export default function Login() {
  const { login, aviso, limpiarAviso } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const destino = ubicacion.state?.desde?.pathname ?? '/'

  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const errorDeCredenciales = error?.codigo === 'CREDENCIALES_INVALIDAS'
  const usuarioConError = errorDeCredenciales || (error?.codigo === 'DATOS_INVALIDOS' && !usuario.trim())
  const claveConError = errorDeCredenciales || (error?.codigo === 'DATOS_INVALIDOS' && !clave)

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) return

    const nombreUsuario = usuario.trim()
    if (!nombreUsuario || !clave) {
      setError({ codigo: 'DATOS_INVALIDOS', mensaje: 'Ingresa tu usuario y tu contraseña.' })
      return
    }

    setEnviando(true)
    setError(null)
    limpiarAviso()
    try {
      await login(nombreUsuario, clave)
      navigate(destino, { replace: true })
    } catch (fallo) {
      setError(describirError(fallo))
      setEnviando(false)
    }
  }

  return (
    <div className="login d-flex min-vh-100">
      <PanelDeMarca />

      <main className="d-flex flex-grow-1 align-items-center justify-content-center p-4">
        <form className="card login__tarjeta w-100 border-0" onSubmit={enviar} noValidate>
          <div className="card-body d-flex flex-column gap-4">
            <header className="tarjeta__encabezado d-flex flex-column">
              <div className="acento d-flex" aria-hidden="true">
                <span className="acento__verde" />
                <span className="acento__amarillo" />
              </div>
              <h1 className="tarjeta__titulo">Iniciar sesión</h1>
              <p className="tarjeta__subtitulo">
                Ingresa tu usuario y contraseña para acceder al panel de marcaciones.
              </p>
            </header>

            {error && (
              <div className="alert alert-danger aviso d-flex align-items-start" role="alert">
                <span className="aviso__icono" aria-hidden="true">
                  !
                </span>
                <p className="mb-0 flex-grow-1">
                  {errorDeCredenciales
                    ? 'Usuario o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.'
                    : error.mensaje}
                </p>
              </div>
            )}

            {!error && aviso === 'expirada' && (
              <div className="alert alert-nettplus aviso d-flex align-items-start" role="status">
                <span className="aviso__icono" aria-hidden="true">
                  i
                </span>
                <p className="mb-0 flex-grow-1">
                  Tu sesión expiró por inactividad. Inicia sesión de nuevo para continuar.
                </p>
              </div>
            )}

            <div className="campos d-flex flex-column">
              <div className="d-flex flex-column gap-2">
                <label className="form-label" htmlFor="usuario">
                  Usuario
                </label>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  className={`form-control${usuarioConError ? ' is-invalid' : ''}`}
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoFocus
                  maxLength={50}
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  disabled={enviando}
                />
              </div>

              <div className="d-flex flex-column gap-2">
                <label className="form-label" htmlFor="clave">
                  Contraseña
                </label>
                <div className="position-relative">
                  <input
                    id="clave"
                    name="clave"
                    type={mostrarClave ? 'text' : 'password'}
                    className={`form-control campo__clave${claveConError ? ' is-invalid' : ''}`}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    maxLength={128}
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    disabled={enviando}
                  />
                  <button
                    type="button"
                    className="btn btn-link campo__mostrar position-absolute top-50 end-0 translate-middle-y me-3 p-0 border-0 shadow-none"
                    onClick={() => setMostrarClave((v) => !v)}
                    disabled={enviando}
                    aria-pressed={mostrarClave}
                  >
                    {mostrarClave ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login__boton w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  {/* Spinner nativo de Bootstrap en lugar del archivo SVG de carga */}
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  Ingresando…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>

            <p className="tarjeta__pie text-center">
              Acceso para Recursos Humanos / Desarrollo Organizacional y Contabilidad.
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}