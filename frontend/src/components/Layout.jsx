import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import MenuLateral from './MenuLateral'
import './Layout.css'

// Estructura de todas las pantallas con sesión: menú lateral a la izquierda y la pantalla a la derecha.
// En pantallas menores a 992 px el menú se oculta y se abre con el botón de la barra superior.
export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="app d-flex min-vh-100">
      <MenuLateral abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} />
      <div className="app__principal d-flex flex-column flex-grow-1">
        <div className="app__barra d-lg-none">
          <button
            type="button"
            className="app__hamburguesa"
            aria-label="Abrir el menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  )
}