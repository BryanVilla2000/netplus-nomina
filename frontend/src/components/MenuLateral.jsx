import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { rutaInicial } from '../auth/rutaInicial'
import { MENU, SUBTITULO_ROL, filtrarMenu } from './menu'
// Logo oficial a color sobre tarjeta blanca (el Manual 2026 permite la versión positiva sobre blanco)
import imgLogoNettplus from '../assets/img/Logo-Nettplus.png'

const claseEnlace = ({ isActive }) =>
  `menu__enlace d-flex align-items-center gap-2${isActive ? ' menu__enlace--activo' : ''}`

function GrupoMenu({ grupo, alNavegar, abiertoInicial }) {
  const { pathname } = useLocation()
  const dentro = grupo.hijos.some((h) => pathname === h.ruta || pathname.startsWith(`${h.ruta}/`))
  const [abierto, setAbierto] = useState(dentro || abiertoInicial)
  const [rutaVista, setRutaVista] = useState(pathname)

  // Si se llega a una pantalla del grupo (por ejemplo desde un enlace del panel), el grupo se abre solo
  if (pathname !== rutaVista) {
    setRutaVista(pathname)
    if (dentro) setAbierto(true)
  }

  const idLista = `menu-${grupo.clave}`
  return (
    <>
      <button
        type="button"
        className={`menu__enlace menu__grupo d-flex align-items-center justify-content-between w-100${abierto ? ' menu__grupo--abierto' : ''}`}
        aria-expanded={abierto}
        aria-controls={idLista}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span className="d-flex align-items-center gap-2">
          <span className={`menu__punto${dentro ? ' menu__punto--activo' : ''}`} aria-hidden="true" />
          {grupo.etiqueta}
        </span>
        <svg className="menu__flecha" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M4 2.5 7.5 6 4 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {abierto && (
        <div id={idLista} className="menu__submenu d-flex flex-column">
          {grupo.hijos.map((hijo) => (
            <NavLink key={hijo.ruta} to={hijo.ruta} className={claseEnlace} onClick={alNavegar}>
              <span className="menu__punto menu__punto--chico" aria-hidden="true" />
              {hijo.etiqueta}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}

export default function MenuLateral({ abierto, alCerrar }) {
  const { usuario, puede, logout } = useAuth()
  const opciones = filtrarMenu(MENU, puede)

  return (
    <>
      {abierto && <div className="menu__fondo d-lg-none" onClick={alCerrar} aria-hidden="true" />}
      <nav className={`menu d-flex flex-column${abierto ? ' menu--abierto' : ''}`} aria-label="Menú principal">
        <Link to={rutaInicial(puede) ?? '/'} className="menu__logo align-self-start" onClick={alCerrar}>
          <img src={imgLogoNettplus} alt="Nettplus - The Power of Fiber" />
        </Link>

        <p className="menu__titulo">MENÚ</p>

        {opciones.map((item) =>
          item.hijos ? (
            // Si el grupo es lo único del menú (Contabilidad), se muestra siempre abierto
            <GrupoMenu key={item.clave} grupo={item} alNavegar={alCerrar} abiertoInicial={opciones.length === 1} />
          ) : (
            <NavLink key={item.ruta} to={item.ruta} end className={claseEnlace} onClick={alCerrar}>
              <span className="menu__punto" aria-hidden="true" />
              {item.etiqueta}
            </NavLink>
          ),
        )}

        <div className="menu__relleno" />

        <div className="menu__usuario">
          <p className="menu__usuario-nombre">{usuario.nombre}</p>
          <p className="menu__usuario-rol">{SUBTITULO_ROL[usuario.rol] ?? usuario.rolNombre}</p>
        </div>
        <button type="button" className="menu__enlace w-100 text-start border-0" onClick={logout}>
          Salir
        </button>
      </nav>
    </>
  )
}