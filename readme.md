<p align="center">
  <img src="./img/logo-footer.png" alt="PlannerApp" width="200">
</p>

<h1 align="center">Planifica tus tareas</h1>

<p align="center">
  <strong>Aplicación web para la organización y planificación de tareas diarias</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/estado-En%20desarrollo-yellow" alt="Estado">
  <img src="https://img.shields.io/badge/licencia-MIT-green" alt="Licencia">
  <img src="https://img.shields.io/badge/PRs-welcome-blueviolet" alt="PRs welcome">
  <img src="https://img.shields.io/badge/html5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/css3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/javascript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/bootstrap-5.3.3-7952B3?style=flat&logo=bootstrap&logoColor=white" alt="Bootstrap">
</p>

<p align="center">
  <a href="#demo">Demo en vivo</a> &bull;
  <a href="#contribuir">Contribuir</a> &bull;
  <a href="https://github.com/CarolPinerosTrujillo/PlannerAppCP_Backend">Backend</a> &bull;
  <a href="https://www.figma.com/design/TErAQd2zHXbozzLgEdW5kT/PlannerApp-WEB">Figma</a>
</p>

---

## Descripción

PlannerApp es una aplicación web construida con HTML5, CSS3 y JavaScript vanilla que permite registrar, clasificar y gestionar tareas de manera sencilla e intuitiva. Las tareas se organizan visualmente por estado (Por hacer, En proceso, Terminadas) con filtros por categoría y una barra de progreso que muestra el avance general.

El proyecto está construido siguiendo una metodología incremental, incorporando nuevas funcionalidades en cada sprint.

---

## Demo

Puedes visualizar la versión actual del proyecto aquí:

👉 **https://carolpinerostrujillo.github.io/Web_planificadorTareas/**

---

## Funcionalidades

- Formulario para registrar tareas con validación de campos obligatorios
- Validación de fecha y hora
- Retroalimentación visual mediante SweetAlert2
- Organización visual de tareas por estado: Por hacer, En proceso, Terminadas
- Agregar, editar y eliminar tareas
- Filtrar tareas por estado y por categoría
- Barra de progreso con porcentaje de tareas completadas
- Reloj en tiempo real
- Diseño responsivo con Bootstrap 5
- Persistencia de datos en base de datos PostgreSQL vía API REST

---

## Tech Stack

| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura y maquetación |
| CSS3 | Estilos personalizados con variables CSS |
| Bootstrap 5.3.3 | Diseño responsivo y componentes UI |
| JavaScript (ES6+) | Lógica de aplicación, manipulación del DOM |
| SweetAlert2 | Alertas y confirmaciones visuales |
| Spring Boot | Backend REST API ([repo](https://github.com/CarolPinerosTrujillo/PlannerAppCP_Backend)) |
| PostgreSQL | Base de datos relacional |
| Git & GitHub | Control de versiones |

---

## Arquitectura

```
┌─────────────────────┐         ┌─────────────────────┐         ┌────────────┐
│                     │  fetch  │                     │   JPA   │            │
│   Frontend          │ ──────▶ │   Backend           │ ──────▶ │ PostgreSQL │
│   HTML/CSS/JS       │         │   Spring Boot       │         │            │
│   (este repo)       │ ◀────── │   Puerto 8080       │ ◀────── │ Puerto 5432│
│                     │  JSON   │                     │         │            │
└─────────────────────┘         └─────────────────────┘         └────────────┘
```

- **Frontend**: Archivos estáticos HTML/CSS/JS (este repositorio)
- **Backend**: API REST con Spring Boot y Spring Data JPA ([PlannerAppCP_Backend](https://github.com/CarolPinerosTrujillo/PlannerAppCP_Backend))
- **Base de datos**: PostgreSQL con entidad `Task` (id, nombre, descripcion, fecha, hora, prioridad, categoria, status)

### Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Obtener todas las tareas |
| POST | `/api/tasks` | Crear una tarea |
| PUT | `/api/tasks/{id}` | Actualizar una tarea |
| DELETE | `/api/tasks/{id}` | Eliminar una tarea |

---

## Estructura del proyecto

```text
WEB_PlanificadorTareas/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos personalizados (900+ líneas)
├── JS/
│   ├── taskManager.js      # Modelo de datos y comunicación con la API
│   └── index.js            # Controlador, eventos y manipulación del DOM
├── img/
│   └── (iconos e imágenes)
├── .gitignore
├── LICENSE
└── README.md
```

---

## Cómo ejecutar

### Requisitos

- [Node.js](https://nodejs.org/) (opcional, para servir archivos estáticos)
- [Backend en ejecución](https://github.com/CarolPinerosTrujillo/PlannerAppCP_Backend) (Spring Boot + PostgreSQL)

### Pasos

1. Clona el repositorio

   ```bash
   git clone https://github.com/CarolPinerosTrujillo/Web_planificadorTareas.git
   cd Web_planificadorTareas
   ```

2. Asegúrate de que el backend esté corriendo en `http://localhost:8080`

3. Abre `index.html` en tu navegador o usa un servidor local:

   ```bash
   # Con Python
   python -m http.server 3000

   # Con Node.js (si tienes http-server instalado)
   npx http-server -p 3000
   ```

4. Accede a `http://localhost:3000`

---

## Diseño de la interfaz

El diseño fue realizado en Figma antes del desarrollo para definir la estructura, experiencia de usuario y apariencia visual.

👉 **[Prototipo en Figma](https://www.figma.com/design/TErAQd2zHXbozzLgEdW5kT/PlannerApp-WEB)**

---

## Planeación

La organización del desarrollo y seguimiento de tareas se realiza mediante un tablero de Trello.

👉 **[Tablero de planificación](https://trello.com/b/jlRtrGyi/webplanificador)**

---

## Contribuir

Las contribuciones son bienvenidas. Para colaborar:

1. Haz un **fork** del repositorio
2. Crea una rama para tu feature o fix:
   ```bash
   git checkout -b feature/nombre-del-feature
   ```
3. Haz tus cambios y commit con mensajes descriptivos:
   ```bash
   git commit -m "feat: agregar funcionalidad de X"
   ```
4. Push a tu rama:
   ```bash
   git push origin feature/nombre-del-feature
   ```
5. Abre un **Pull Request** describiendo los cambios

### Convenciones de commits

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` cambios de estilo (no afectan la lógica)
- `refactor:` refactorización de código

---

## Autora

**Carol Piñeros**

Developer en formación, enfocada en crear aplicaciones web funcionales, modernas y con una buena experiencia de usuario.

- GitHub: [@CarolPinerosTrujillo](https://github.com/CarolPinerosTrujillo)
- LinkedIn: [Carol Piñeros](https://www.linkedin.com/in/carol-pineros-trujillo/)

---

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.
