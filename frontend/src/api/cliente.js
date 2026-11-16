import axios from 'axios'

const CLAVE_TOKEN = 'nettplus.token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  timeout: 15000,
})

// --- Token de sesión -------------------------------------------------------
export function leerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // Si el navegador bloquea el almacenamiento, la sesión dura solo mientras la pestaña esté abierta
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // nada que borrar
  }
}

// --- Cierre de sesión automático ------------------------------------------
// AuthContext registra aquí qué hacer cuando el backend dice que la sesión ya no sirve.
let alPerderSesion = null
export function registrarAlPerderSesion(funcion) {
  alPerderSesion = funcion
}

const CODIGOS_SESION_PERDIDA = ['SESION_EXPIRADA', 'SESION_INVALIDA', 'SIN_SESION']

api.interceptors.request.use((config) => {
  const token = leerToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const estado = error.response?.status
    const codigo = error.response?.data?.codigo
    const esLogin = error.config?.url === '/auth/login'
    if (estado === 401 && !esLogin && CODIGOS_SESION_PERDIDA.includes(codigo)) {
      alPerderSesion?.(codigo)
    }
    return Promise.reject(error)
  },
)

// --- Mensajes de error para mostrar en pantalla ---------------------------
export function describirError(error) {
  const datos = error.response?.data
  if (datos?.codigo && datos?.mensaje) {
    return { codigo: datos.codigo, mensaje: datos.mensaje }
  }
  if (!error.response) {
    return {
      codigo: 'SIN_CONEXION',
      mensaje: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    }
  }
  return { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
}
