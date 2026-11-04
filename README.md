# Dashboard de Nómina – NetPlus

Control de asistencia del personal a partir de las marcaciones del biométrico **Z-BioTime**.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

**[Ver el prototipo en Figma »](https://www.figma.com/make/7AKRoXZukgIyuk3YPqdWda/Prototipo-Dashboard-N%C3%B3mina-NetPlus?t=QDPHhIcqvmiUIDkV-1)**

---

## Descripción

**Dashboard de Nómina NetPlus** es un sistema web que ayuda al área de Recursos Humanos a controlar la asistencia del personal. Toma los archivos Excel que exporta el biométrico **Z-BioTime**, los importa a una base de datos y calcula automáticamente atrasos, faltas, horas trabajadas y horas extra. Con esos datos arma reportes diarios y por período de corte, y un panel principal con los indicadores más importantes.

## Objetivo

Reemplazar el cálculo manual de asistencia en hojas de Excel por un sistema que importe las marcaciones, aplique las reglas de la empresa y entregue reportes confiables para Recursos Humanos y Contabilidad.

## Funcionalidades

| Área | Qué permite |
|---|---|
| **Acceso** | Iniciar sesión con usuario y contraseña, con permisos según el rol. |
| **Importación** | Cargar los Excel exportados de Z-BioTime: marcaciones, permisos y horas extra, y horarios de turno. |
| **Bitácora** | Ver el resultado de cada carga: filas leídas, importadas y descartadas. |
| **Cálculos** | Atrasos, faltas, horas trabajadas y horas extra, según el horario de cada turno. |
| **Reportes** | Reporte diario, consolidado por período de corte, vacaciones y detalle de marcaciones por empleado. |
| **Exportación** | Descargar los reportes en Excel. |
| **Panel principal** | Asistencia, puntualidad, ausentismo, horas extra aprobadas, ranking de atrasos y colaboradores por área. |
| **Feriados** | Administrar el calendario de feriados, que no generan faltas ni atrasos. |
| **Avisos** | Mensajes claros ante errores: archivo con columnas inválidas, fallo al guardar, sin datos para el rango, credenciales incorrectas y datos desactualizados. |

## Roles

| Rol | Permisos |
|---|---|
| **Recursos Humanos / Desarrollo Organizacional** | Acceso completo: importar archivos, administrar feriados, revisar permisos y horas extra, y ver todos los reportes. |
| **Contabilidad** | Solo consulta el consolidado por período y lo exporta a Excel. |

## Reglas de negocio

- **Período de corte:** del día 21 de un mes al día 20 del siguiente.
- **Atrasos:** se calculan contra el horario del turno de cada colaborador (fijo, rotativo o temporal).
- **Feriados:** un día feriado no genera faltas ni atrasos.
- **Permisos:** un permiso aprobado no cuenta como falta; uno pendiente sí.
- **Horas extra:** solo se cuentan las aprobadas y respaldadas por las marcaciones.
- **Zona horaria:** todos los cálculos usan la hora de Ecuador (`America/Guayaquil`).

## Pantallas del sistema

1. Inicio de sesión
2. Panel principal
3. Reporte diario
4. Reporte por período de corte
5. Vacaciones
6. Marcaciones por empleado y detalle de marcaciones
7. Importar marcaciones
8. Permisos y horas extra
9. Horarios de turno
10. Feriados

El diseño completo, con sus estados de error y de carga, está en el [prototipo de Figma](https://www.figma.com/make/7AKRoXZukgIyuk3YPqdWda/Prototipo-Dashboard-N%C3%B3mina-NetPlus?t=QDPHhIcqvmiUIDkV-1).

## Arquitectura

```
  Z-BioTime (biométrico)
          │  exporta Excel
          ▼
  ┌──────────────────┐   HTTP    ┌──────────────────┐   SQL    ┌──────────────┐
  │     Frontend     │ ───────►  │     Backend      │ ───────► │  PostgreSQL  │
  │  React + Vite    │ ◄───────  │ Node.js + Express│ ◄─────── │  (en Docker) │
  └──────────────────┘   JSON    └──────────────────┘          └──────────────┘
```

## Tecnologías

| Capa | Tecnologías | Para qué se usan |
|---|---|---|
| **Frontend** | React con Vite | Construir las pantallas |
| | React Router | Navegar entre páginas |
| | Axios | Comunicar el frontend con el backend |
| | Bootstrap | Diseño, personalizado con los colores de NetPlus |
| | Recharts | Gráficos de asistencia y puntualidad |
| **Backend** | Node.js con Express | Servidor y API |
| | Multer | Subir el Excel, validando tipo y tamaño |
| | ExcelJS | Leer el Excel de Z-BioTime y exportar reportes |
| | Zod | Validar las columnas del archivo y los datos |
| | bcrypt y JSON Web Token | Contraseñas cifradas, sesiones y permisos por rol |
| | dotenv y cors | Variables secretas y comunicación con el frontend |
| | dayjs | Horas, atrasos y fechas con la zona horaria de Ecuador |
| **Base de datos** | PostgreSQL 18 en Docker | Usuarios, marcaciones, horarios, feriados, permisos, horas extra y bitácora |
| | pg y Knex | Conexión, importación por lotes con transacciones y migraciones |
| **Herramientas** | Git y GitHub, VS Code, Postman | Control de versiones, editor y pruebas de la API |

## Estructura del proyecto

```
netplus-nomina/
├── backend/        # API con Node.js y Express
├── frontend/       # Interfaz con React y Vite
├── .gitignore
└── README.md
```

## Identidad de marca

Colores corporativos de NetPlus, según el Manual de Marca 2026:

| Color | Código |
|---|---|
| Azul | `#233A84` |
| Verde | `#73B542` |
| Amarillo | `#FDEA18` |

## Integrantes

- (completar con los nombres del equipo)

---

**NETPLUS** · *The power of fiber*
