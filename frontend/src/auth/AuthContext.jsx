import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, borrarToken, guardarToken, leerToken, registrarAlPerderSesion } from '../api/cliente'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Si hay un token guardado, hay que confirmar con el backend que sigue siendo válido
  const [verificando, setVerificando] = useState(() => Boolean(leerToken()))
  // 'expirada' cuando el backend cerró la sesión; se muestra como aviso en el login
  const [aviso, setAviso] = useState(null)

  const cerrarLocal = useCallback((nuevoAviso = null) => {
    borrarToken()
    setUsuario(null)
    setAviso(nuevoAviso)
  }, [])

  useEffect(() => {
    registrarAlPerderSesion((codigo) => {
      cerrarLocal(codigo === 'SESION_EXPIRADA' || codigo === 'SESION_INVALIDA' ? 'expirada' : null)
    })
    return () => registrarAlPerderSesion(null)
  }, [cerrarLocal])

  // Al abrir la aplicación: ¿la sesión guardada sigue siendo válida?
  useEffect(() => {
    if (!leerToken()) return undefined
    let cancelado = false
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!cancelado) setUsuario(data.usuario)
      })
      .catch(() => {
        // Si fue 401, el interceptor ya limpió la sesión. Si fue un fallo de red, se queda en el login.
      })
      .finally(() => {
        if (!cancelado) setVerificando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  const login = useCallback(async (nombreUsuario, clave) => {
    const { data } = await api.post('/auth/login', { usuario: nombreUsuario, clave })
    guardarToken(data.token)
    setUsuario(data.usuario)
    setAviso(null)
    return data.usuario
  }, [])

  const logout = useCallback(() => cerrarLocal(null), [cerrarLocal])
  const limpiarAviso = useCallback(() => setAviso(null), [])

  const valor = useMemo(
    () => ({ usuario, verificando, aviso, login, logout, limpiarAviso }),
    [usuario, verificando, aviso, login, logout, limpiarAviso],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
