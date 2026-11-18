import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, borrarToken, guardarToken, leerToken, registrarAlPerderSesion } from '../api/cliente'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(() => Boolean(leerToken()))
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

  useEffect(() => {
    if (!leerToken()) return undefined
    let cancelado = false
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!cancelado) setUsuario(data.usuario)
      })
      .catch(() => {
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

  const puede = useCallback((permiso) => Boolean(usuario?.permisos?.includes(permiso)), [usuario])

  const valor = useMemo(
    () => ({ usuario, verificando, aviso, login, logout, limpiarAviso, puede }),
    [usuario, verificando, aviso, login, logout, limpiarAviso, puede],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}