import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RutaProtegida, SoloInvitados } from './auth/Rutas'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Consolidado from './pages/Consolidado'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <SoloInvitados>
              <Login />
            </SoloInvitados>
          }
        />
        {/* Panel principal: solo RRHH / DO */}
        <Route
          path="/"
          element={
            <RutaProtegida permiso="ver_panel">
              <Inicio />
            </RutaProtegida>
          }
        />
        {/* Consolidado por período de corte: RRHH / DO y Contabilidad */}
        <Route
          path="/consolidado"
          element={
            <RutaProtegida permiso="ver_consolidado">
              <Consolidado />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}