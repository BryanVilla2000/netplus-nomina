import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { IrAlInicio, RutaProtegida, SoloInvitados } from './auth/Rutas'
import Layout from './components/Layout'
import { RUTAS_PENDIENTES } from './components/menu'
import Consolidado from './pages/Consolidado'
import EnConstruccion from './pages/EnConstruccion'
import ReporteDiario from './pages/ReporteDiario'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import ImportarMarcaciones from './pages/ImportarMarcaciones'

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

        {/* Todo lo que lleva menú lateral exige sesión; cada pantalla además exige su permiso */}
        <Route
          element={
            <RutaProtegida>
              <Layout />
            </RutaProtegida>
          }
        >
          {/* Panel principal: solo RRHH / DO */}
          <Route
            path="/"
            element={
              <RutaProtegida permiso="ver_panel">
                <Inicio />
              </RutaProtegida>
            }
          />
          {/* Reporte por período de corte: RRHH / DO y Contabilidad */}
          <Route
            path="/consolidado"
            element={
              <RutaProtegida permiso="ver_consolidado">
                <Consolidado />
              </RutaProtegida>
            }
          />
          {/* Importar marcaciones: solo RRHH / DO */}
          <Route
            path="/importar/marcaciones"
            element={
              <RutaProtegida permiso="importar">
                <ImportarMarcaciones />
              </RutaProtegida>
            }
          />
          {/* Reporte diario: solo RRHH / DO */}
          <Route
            path="/reportes/diario"
            element={
              <RutaProtegida permiso="ver_panel">
                <ReporteDiario />
              </RutaProtegida>
            }
          />
          <Route path="*" element={<IrAlInicio />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}