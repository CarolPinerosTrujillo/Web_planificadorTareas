# Documentación de Cambios — PlannerApp

Guía completa para dev junior. Cada sección explica **qué se hizo**, **dónde está el código**, **cómo funciona** y **posibles preguntas**.

---

## Índice

1. [Resumen de la Sesión](#1-resumen-de-la-sesión)
2. [Arquitectura del Proyecto](#2-arquitectura-del-proyecto)
3. [Frontend — 12 mejoras de UI/UX](#3-frontend--12-mejoras-de-uiux)
4. [Backend — Spring Boot + PostgreSQL](#4-backend--spring-boot--postgresql)
5. [Migración localStorage → PostgreSQL](#5-migración-localstorage--postgresql)
6. [Explicación de Funciones — taskManager.js](#6-explicación-de-funciones--taskmanagerjs)
7. [Explicación de Funciones — index.js](#7-explicación-de-funciones--indexjs)
8. [Bugs Encontrados y Corregidos](#8-bugs-encontrados-y-corregidos)
9. [Auditoría de Código](#9-auditoría-de-código)
10. [Guía de Postman](#10-guía-de-postman)
11. [Pruebas desde el Navegador](#11-pruebas-desde-el-navegador)
12. [Glossario para Junior Dev](#12-glosario-para-junior-dev)
13. [Plan Futuro](#13-plan-futuro)
14. [Cambios CSS — Colores, Footer, Hover](#14-cambios-css--colores-footer-hover)
15. [Despliegue — Supabase + Render + GitHub Pages](#15-despliegue--supabase--render--github-pages)

---

## 1. Resumen de la Sesión

### Frontend — 12 mejoras de UI/UX

| # | Mejora | Archivos |
|---|--------|----------|
| 1 | Paleta de colores con CSS Variables | `styles.css` |
| 2 | Botón cancelar edición (bug fix) | `index.html`, `index.js`, `styles.css` |
| 3 | Indicador de modo edición | `index.js`, `styles.css` |
| 4 | Tooltips en descripciones | `taskManager.js` |
| 5 | Tarjetas compactadas | `styles.css` |
| 6 | Barra de progreso | `index.html`, `index.js`, `taskManager.js`, `styles.css` |
| 7 | Contadores en filtros | `index.html`, `index.js` |
| 8 | Empty states | `taskManager.js`, `styles.css` |
| 9 | Animaciones de entrada | `taskManager.js`, `styles.css` |
| 10 | Filtro por categoría (dropdown inline) | `index.html`, `index.js`, `taskManager.js`, `styles.css` |
| 11 | Auditoría y fixes mobile | `index.html`, `styles.css` |
| 12 | Footer mejorado | `index.html`, `styles.css` |

### Backend — Integración Spring Boot + PostgreSQL

| # | Cambio | Archivos |
|---|--------|----------|
| 13 | Configuración PostgreSQL | `application.properties` |
| 14 | Entidad `Task` con validaciones JPA | `Task.java`, enums |
| 15 | `TaskRepository` con JpaRepository | `TaskRepository.java` |
| 16 | `TaskController` con endpoints REST | `TaskController.java` |
| 17 | CORS habilitado | `TaskController.java` |
| 18 | Frontend conectado con `fetch()` | `taskManager.js`, `index.js` |

### Seguridad y Arquitectura (NUEVO)

| # | Cambio | Archivos |
|---|--------|----------|
| 19 | Protección XSS con `escapeHtml()` | `taskManager.js` |
| 20 | Manejo de errores con `try/catch` | `taskManager.js`, `index.js` |
| 21 | Verificación de respuestas API | `index.js` |
| 22 | Eliminación de código muerto | `taskManager.js`, `index.js` |
| 23 | Eliminación de archivos huérfanos | `index copy.js`, `tests.js` |

---

## 2. Arquitectura del Proyecto

### Estructura de archivos — Frontend
```
WEB_PlanificadorTareas/
├── index.html          ← Estructura HTML (vista)
├── css/styles.css      ← Estilos (vista)
├── JS/
│   ├── taskManager.js  ← Modelo (clase TaskManager + fetch API + escapeHtml)
│   └── index.js        ← Controlador (eventos, lógica, async)
├── img/                ← Imágenes y iconos
└── documentacion.md    ← Este archivo
```

### Estructura de archivos — Backend
```
PlannerAppCP/
├── src/main/java/com/plannerAppCP/PlannerAppCP/
│   ├── PlannerAppCpApplication.java
│   ├── model/
│   │   ├── Task.java
│   │   ├── Prioridad.java
│   │   ├── Categoria.java
│   │   └── StatusTarea.java
│   ├── repository/
│   │   └── TaskRepository.java
│   └── controller/
│       └── TaskController.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

### Arquitectura cliente-servidor
```
┌─────────────────────┐      HTTP       ┌──────────────────┐      JDBC      ┌────────────┐
│     Frontend        │ ──────────────→ │   Spring Boot    │ ────────────→ │ PostgreSQL │
│  (HTML/CSS/JS)      │  fetch() API    │   (REST API)     │  JPA/Hibernate│  (tasks_db) │
│  Puerto: archivo    │                 │  Puerto: 8080    │               │  Puerto: 5432│
└─────────────────────┘                 └──────────────────┘               └────────────┘
```

---

## 3. Frontend — 12 mejoras de UI/UX

### 1. Paleta de Colores con CSS Custom Properties (`:root`)

**Qué se hizo:** Se reemplazaron todos los colores hardcodeados por **variables CSS** definidas una sola vez al inicio del archivo.

**Dónde está:** `css/styles.css` → bloque `:root` (líneas 4-109)

```css
:root {
    --color-purple: #4c2372;    /* Definición */
}

.btn-gradient {
    background: linear-gradient(90deg, var(--color-black), var(--color-purple));  /* Uso */
}
```

**¿Por qué?** Si mañana querés cambiar el morado principal, solo lo cambias en UN lugar (`:root`) y se actualiza en toda la app.

### 2. Botón Cancelar Edición

**Qué se hizo:** Se agregó un botón "Cancelar edición" que aparece solo cuando se está editando una tarea.

**Dónde está:**
- `index.html` → botón `#btnCancelarEdicion`
- `JS/index.js` → función `cancelarEdicion()` y event listener
- `css/styles.css` → clase `.btn-cancelar`

### 3. Indicador de Modo Edición

**Qué se hizo:** Cuando el usuario hace clic en "Editar", el formulario recibe un **borde dorado y sombra dorada**.

**Dónde está:**
- `css/styles.css` → clase `.form-card.form-editing`
- `JS/index.js` → toggle de la clase

### 4. Tooltips en Descripciones

**Qué se hizo:** Al pasar el mouse sobre el título o descripción de una tarea, aparece un **tooltip nativo** con el texto completo.

### 5. Tarjetas Compactadas

**Qué se hizo:** Se redujeron tamaños de padding, margin, font-size y border-radius de las tarjetas.

### 6. Barra de Progreso

**Qué se hizo:** Se agregó una barra visual que muestra cuántas tareas están completadas vs. el total.

### 7. Contadores en Filtros

**Qué se hizo:** Los botones de filtro ahora muestran cuántas tareas tiene cada estado.

### 8. Empty States

**Qué se hizo:** Cuando una columna no tiene tareas, se muestra un mensaje amigable.

### 9. Animaciones de Entrada

**Qué se hizo:** Las tarjetas aparecen con una animación de fade-in + slide-up.

### 10. Filtro por Categorías (Dropdown Inline)

**Qué se hizo:** Se agregó un `<select>` para filtrar por categoría, combinado con los filtros de estado.

### 11. Auditoría y Fixes Mobile

**Qué se hizo:** Se realizó una auditoría completa de la vista móvil y se corrigieron múltiples problemas.

### 12. Footer Mejorado

**Qué se hizo:** Se mejoró el footer con logo, copyright y autora separados con opacidades.

---

## 4. Backend — Spring Boot + PostgreSQL

### Stack tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Java | 21 | Lenguaje de programación |
| Spring Boot | 4.1.1 | Framework backend |
| Spring Data JPA | (incluido) | ORM / acceso a datos |
| PostgreSQL | local | Base de datos relacional |
| Lombok | (incluido) | Reducir boilerplate Java |

### `application.properties`
```properties
spring.application.name=PlannerAppCP

# DataSource (env vars para Render, fallback para local)
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/tasks_db}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:Admin1234}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT SECRET
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

**¿Por qué env vars?** En Render se configuran las variables de entorno. En local se usa el fallback (pgAdmin).

### Enums

```java
public enum Prioridad { ALTA, MEDIA, BAJA }

public enum Categoria {
    CASA, TRABAJO, ESTUDIO, PERSONAL, COMPRAS, FINANZAS, EJERCICIO
}

public enum StatusTarea { PORHACER, ENPROCESO, COMPLETADA }
```

### Modelo de datos — Entidad `Task`

| Campo | Tipo | Validación | Descripción |
|-------|------|------------|-------------|
| `id` | `Long` | `@Id @GeneratedValue(IDENTITY)` | Auto-generado por PostgreSQL |
| `nombre` | `String` | `@NotBlank`, `@Size(max=100)` | Nombre de la tarea |
| `descripcion` | `String` | `@Size(max=500)` | Descripción (opcional) |
| `fecha` | `String` | `@NotBlank` | Formato `YYYY-MM-DD` |
| `hora` | `String` | `@NotBlank` | Formato `HH:MM` |
| `prioridad` | `Prioridad` | `@Enumerated(STRING)` | ALTA, MEDIA, BAJA |
| `categoria` | `Categoria` | `@Enumerated(STRING)` | CASA, TRABAJO, ESTUDIO, etc. |
| `status` | `StatusTarea` | `@Enumerated(STRING)` | PORHACER, ENPROCESO, COMPLETADA |

### Endpoints REST

| Método | URL | Descripción | Código HTTP |
|--------|-----|-------------|-------------|
| `GET` | `/api/tasks` | Listar todas las tareas | 200 |
| `GET` | `/api/tasks/{id}` | Buscar tarea por ID | 200 |
| `POST` | `/api/tasks` | Crear una tarea nueva | 201 |
| `PUT` | `/api/tasks/{id}` | Actualizar una tarea | 200 |
| `DELETE` | `/api/tasks/{id}` | Eliminar una tarea | 204 |

### PUT con null checks (importante)

```java
@PutMapping("/{id}")
public Task actualizar(@PathVariable Long id, @RequestBody Task task) {
    Task existente = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con id: " + id));

    // Solo actualiza si el campo NO es null
    if (task.getNombre() != null) existente.setNombre(task.getNombre());
    if (task.getDescripcion() != null) existente.setDescripcion(task.getDescripcion());
    if (task.getFecha() != null) existente.setFecha(task.getFecha());
    if (task.getHora() != null) existente.setHora(task.getHora());
    if (task.getPrioridad() != null) existente.setPrioridad(task.getPrioridad());
    if (task.getCategoria() != null) existente.setCategoria(task.getCategoria());
    if (task.getStatus() != null) existente.setStatus(task.getStatus());

    return taskRepository.save(existente);
}
```

**¿Por qué null checks?** Si el frontend solo envía el campo que cambió (ej: solo `status`), los otros campos llegan como `null`. Sin los null checks, se sobreescribirían con `null` y perderías todos los datos de la tarea.

---

## 5. Migración localStorage → PostgreSQL

### ¿Qué era localStorage?

`localStorage` es un almacenamiento del navegador que guarda datos como strings. Se usaba antes de conectar el backend:

```javascript
// Así era ANTES (localStorage)
localStorage.setItem('tasks', JSON.stringify(this.tasks));  // Guardar
JSON.parse(localStorage.getItem('tasks'));                   // Cargar
```

### ¿Por qué se migró?

| Problema con localStorage | Solución con PostgreSQL |
|--------------------------|------------------------|
| Los datos se pierden si el usuario borra el navegador | PostgreSQL persiste en servidor |
| No hay concurrencia (2 pestañas no se sincronizan) | La BD es la fuente de verdad |
| No se puede compartir entre dispositivos | Cualquier cliente puede conectarse |
| Límite de 5MB por dominio | Sin límite práctico |

### Flujo de datos actual

```
1. Usuario crea tarea en el formulario
2. index.js valida los campos
3. taskManager.addTask() envía POST a /api/tasks
4. TaskController.crear() valida con @Valid
5. TaskRepository.save() guarda en PostgreSQL
6. PostgreSQL devuelve la tarea con id generado
7. TaskController retorna la tarea al frontend
8. taskManager agrega la tarea al array local
9. taskManager.render() dibuja la tarjeta en el DOM
```

### Antes vs Después

| Operación | Antes (localStorage) | Después (fetch API) |
|-----------|---------------------|---------------------|
| Cargar tareas | `JSON.parse(localStorage.getItem('tasks'))` | `fetch(API_URL)` → GET |
| Crear tarea | `this.tasks.push({...})` | `fetch(API_URL, { method: 'POST' })` |
| Actualizar | `task.nombre = nuevoValor` | `fetch(API_URL+'/'+id, { method: 'PUT' })` |
| Eliminar | `this.tasks.filter(...)` | `fetch(API_URL+'/'+id, { method: 'DELETE' })` |
| Guardar | `localStorage.setItem(...)` | **Ya no existe** (la BD persiste) |

### Qué se eliminó

| Archivo/Línea | Qué se eliminó | Por qué |
|---------------|----------------|---------|
| `taskManager.js` línea 135-136 | Método `save()` vacío | PostgreSQL persiste los datos, no se necesita guardar manualmente |
| `taskManager.js` líneas 11-24 | Código comentado del viejo `addTask` | La documentación ya explica el antes/después |
| `taskManager.js` líneas 63-66 | Código comentado del viejo `deleteTask` | Lo mismo |
| `taskManager.js` líneas 79-90 | Código comentado del viejo `editTask` | Lo mismo |
| `taskManager.js` líneas 126-148 | Código comentado del viejo `save`/`load` | Lo mismo |
| `index.js` líneas 18-20 | Código comentado de inicialización vieja | Lo mismo |
| `index.js` líneas 105, 128, 196, 239 | `//taskManager.save()` | `save()` ya no hace nada |
| `JS/index copy.js` | Archivo backup completo | Archivo huérfano, no se usaba |
| `JS/tests.js` | Tests completos | Usaban API síncrona de localStorage, todos fallaban con async |

### Lección aprendida

> **Cuando migrás de un storage a otro, eliminá TODO el código viejo.** No lo dejes comentado "por si acaso". La documentación explica el antes/después. El código viejo solo confunde.

---

## 6. Explicación de Funciones — taskManager.js

### `escapeHtml(texto)` — NUEVO

**Qué hace:** Convierte caracteres peligrosos en seguros para HTML.

**¿Por qué existe?** Para prevenir **XSS** (Cross-Site Scripting). Si un usuario escribe `<script>alert('hacked')</script>` como nombre de tarea, sin esta función se inyectaría como HTML y se ejecutaría. Con `escapeHtml`, se muestra como texto plano.

**Cómo funciona:**
```javascript
function escapeHtml(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')    // & → &amp;
        .replace(/</g, '&lt;')     // < → &lt;
        .replace(/>/g, '&gt;')     // > → &gt;
        .replace(/"/g, '&quot;')   // " → &quot;
        .replace(/'/g, '&#039;');  // ' → &#039;
}
```

**Ejemplo:**
```
Input:   <img src=x onerror="alert('hacked')">
         ↓ escapeHtml()
Output:  &lt;img src=x onerror=&quot;alert(&#039;hacked&#039;)&quot;&gt;
         ↓ al renderizar en HTML
Visual:  <img src=x onerror="alert('hacked')">  (como texto plano, NO se ejecuta)
```

**Dónde se usa:** En `createTaskHtml()`:
```javascript
const nombreSeguro = escapeHtml(task.nombre);
const descSegura = escapeHtml(task.descripcion);

// Antes (PELIGROSO):
<h6>${task.nombre}</h6>         ← si nombre es <script>..., se ejecuta

// Después (SEGURO):
<h6>${nombreSeguro}</h6>        ← se muestra como texto plano
```

### `constructor()`

**Qué hace:** Inicializa la clase TaskManager con un array vacío de tareas.

```javascript
constructor() {
    this.tasks = [];  // Array donde se guardan las tareas en memoria
}
```

**¿Por qué `this.tasks`?** Es el array local que mantiene las tareas en memoria para que `render()` pueda dibujarlas sin hacer fetch cada vez.

### `addTask(nombre, descripcion, categoria, fecha, hora, prioridad)`

**Qué hace:** Crea una tarea nueva en el backend y la agrega al array local.

**Flujo:**
```
1. Convierte los datos a JSON
2. Envía POST a /api/tasks
3. Si la respuesta es exitosa (201), guarda la tarea en this.tasks
4. Si falla, retorna null
5. Todo está envuelto en try/catch por si la red falla
```

**Código simplificado:**
```javascript
async addTask(...) {
    try {
        const response = await fetch(API_URL, { method: 'POST', ... });
        if (!response.ok) return null;          // Error del servidor
        const nuevaTarea = await response.json();
        this.tasks.push(nuevaTarea);            // Agrega al array local
        return nuevaTarea;                       // Retorna la tarea creada
    } catch (error) {
        return null;                             // Error de red
    }
}
```

**¿Por qué `async/await`?** `fetch()` es asíncrono — la respuesta no llega inmediatamente. `await` espera a que llegue antes de continuar.

**¿Por qué retorna `null` en error?** Para que `index.js` pueda verificar si la operación exitó antes de mostrar "éxito" al usuario.

### `getTaskById(taskId)`

**Qué hace:** Busca una tarea por su ID en el array local.

```javascript
getTaskById(taskId) {
    return this.tasks.find(t => t.id === taskId);
}
```

**¿Qué es `.find()`?** Método de arrays que retorna el primer elemento que cumple la condición. Si no encuentra nada, retorna `undefined`.

### `deleteTask(taskId)`

**Qué hace:** Elimina una tarea del backend y del array local.

**Flujo:**
```
1. Envía DELETE a /api/tasks/{id}
2. Si la respuesta es exitosa, elimina la tarea de this.tasks
3. Si falla, no toca el array local
4. Retorna true (éxito) o false (error)
```

**¿Por qué retorna `true`/`false`?** Para que `index.js` sepa si la eliminación exitó y muestre el mensaje correcto al usuario.

### `editTask(taskId, nuevosDatos)`

**Qué hace:** Actualiza una tarea en el backend y en el array local.

**Flujo:**
```
1. Busca la tarea existente en el array local
2. Si el status no viene en nuevosDatos, usa el status actual
3. Envía PUT a /api/tasks/{id}
4. Si la respuesta es exitosa, reemplaza la tarea en this.tasks
5. Si falla, retorna null
```

**¿Por qué busca `existente`?** Para preservar campos que no se enviaron. Si el form solo envía nombre y categoría, los otros campos se toman de la tarea existente.

### `load()`

**Qué hace:** Carga todas las tareas del backend al array local.

```javascript
async load() {
    try {
        const response = await fetch(API_URL);    // GET /api/tasks
        if (!response.ok) { this.tasks = []; return; }
        this.tasks = await response.json();        // Convierte JSON a array
    } catch (error) {
        this.tasks = [];                           // Si falla, array vacío
    }
}
```

**¿Por qué `this.tasks = []` en error?** Para que la app no se rompa. Si no puede cargar, muestra estado vacío en vez de una pantalla de error.

### `getStats()`

**Qué hace:** Calcula estadísticas de las tareas.

```javascript
getStats() {
    const total = this.tasks.length;
    const completadas = this.tasks.filter(t => t.status === 'COMPLETADA').length;
    const porHacer = this.tasks.filter(t => t.status === 'PORHACER').length;
    const enProceso = this.tasks.filter(t => t.status === 'ENPROCESO').length;
    return { total, completadas, porHacer, enProceso };
}
```

**¿Qué hace `.filter()`?** Crea un nuevo array solo con los elementos que cumplen la condición.

### `createTaskHtml(task)`

**Qué hace:** Genera el HTML de una tarjeta de tarea para inyectar en el DOM.

**Línea por línea:**
```javascript
createTaskHtml(task) {
    // 1. Configuración de cada estado
    const estadoConfig = {
        PORHACER: { texto: "Por hacer", boton: "Iniciar", ... },
        ENPROCESO: { texto: "En proceso", boton: "Completar", ... },
        COMPLETADA: { texto: "Completada", boton: "Reabrir", ... }
    };

    // 2. Selecciona la config según el estado actual
    const estado = estadoConfig[task.status] || estadoConfig.PORHACER;

    // 3. Convierte categoría a minúscula para la clase CSS
    // "CASA" → "casa" → clase CSS "categoria-casa"
    const categoriaClass = task.categoria.toLowerCase();

    // 4. Escapa HTML para prevenir XSS
    const nombreSeguro = escapeHtml(task.nombre);
    const descSegura = escapeHtml(task.descripcion);

    // 5. Retorna el HTML con template literal
    return `
        <div class="task-card ..." data-task-id="${task.id}">
            <h6>${nombreSeguro}</h6>      ← nombre escapado
            <p>${descSegura}</p>           ← descripción escapada
            ...
        </div>
    `;
}
```

### `render(filtroActual, filtroCategoria)`

**Qué hace:** Dibuja todas las tareas en las 3 columnas del DOM.

**Flujo:**
```
1. Limpia las 3 columnas
2. Muestra/oculta columnas según el filtro de estado
3. Filtra las tareas por estado Y categoría
4. Para cada tarea filtrada, genera su HTML con createTaskHtml()
5. Inserta el HTML en la columna correcta según su status
6. Si una columna queda vacía, muestra un empty state
```

**¿Por qué 3 columnas?** Porque el diseño tiene: "Por hacer", "En proceso" y "Terminadas". Cada tarea va a la columna de su `status`.

---

## 7. Explicación de Funciones — index.js

### Variables globales (líneas 1-16)

**Qué hace:** Obtiene referencias a los elementos del HTML para poder manipularlos con JavaScript.

```javascript
const formulario = document.querySelector("#formularioTareas");  // El form completo
const nombreTarea = document.querySelector('#nombreTarea');      // Input de nombre
const categoriaTarea = document.querySelector('#categoriaTarea'); // Select de categoría
// ... etc
```

**¿Qué es `document.querySelector()`?** Busca un elemento en el HTML por su CSS selector (`#id`, `.class`, etc.) y retorna el primer elemento que encuentre.

### Variables de estado (líneas 23-25)

```javascript
let filtroActual = "TODAS";       // Filtro de estado activo
let categoriaActual = "TODAS";    // Filtro de categoría activo
let taskEditandoId = null;        // ID de la tarea que se está editando (null = creando)
```

**¿Por qué `let` y no `const`?** Porque estas variables cambian cuando el usuario interactúa.

### Inicialización (líneas 28-33)

```javascript
const taskManager = new TaskManager();
taskManager.load().then(() => {
    taskManager.render(filtroActual, categoriaActual);
    actualizarProgreso();
    actualizarContadoresFiltro();
});
```

**¿Por qué `.then()` y no `await`?** Porque el código principal no es `async`. `load()` retorna una Promise, y `.then()` se ejecuta cuando termina.

**Flujo:**
```
1. Crea una instancia de TaskManager
2. load() hace fetch a /api/tasks (asíncrono)
3. Cuando termina (.then), renderiza las tareas
4. Actualiza barra de progreso y contadores
```

### `validFormFieldInput(data)`

**Qué hace:** Valida que todos los campos del formulario estén llenos.

```javascript
function validFormFieldInput(data) {
    // TRIM: elimina espacios al inicio y final
    data.nombre = data.nombre.trim();         // Modifica el objeto original
    data.descripcion = data.descripcion.trim();
    // ...

    if (data.nombre === '' || ...) { return false; }  // Hay campos vacíos
    return true;                                        // Todo OK
}
```

**¿Qué es `.trim()`?** Elimina espacios en blanco al inicio y final. `" hola ".trim()` → `"hola"`.

**¿Por qué modifica `data` directamente?** Para que los valores limpios (sin espacios extra) se usen al enviar al backend.

### `formulario.addEventListener('submit')` — Handler principal

**Qué hace:** Maneja el envío del formulario (crear o editar tarea).

**Flujo:**
```
1. Previene que el form recargue la página (event.preventDefault)
2. Obtiene los valores de los inputs
3. Valida con validFormFieldInput()
4. Valida que la fecha sea correcta
5. Si taskEditandoId tiene valor → EDICIÓN
   a. Llama editTask()
   b. Verifica si retornó null (error)
   c. Si exitó, muestra SweetAlert de éxito
   d. Si falló, muestra SweetAlert de error
6. Si taskEditandoId es null → CREACIÓN
   a. Llama addTask()
   b. Verifica si retornó null (error)
   c. Si exitó, muestra SweetAlert de éxito
   d. Si falló, muestra SweetAlert de error
7. Todo envuelto en try/catch
```

**¿Por qué `event.preventDefault()`?** Sin esto, el form recargaría la página al enviar. Queremos manejar todo con JavaScript.

**¿Por qué se verifica `if (!resultado)`?** Porque `addTask()` y `editTask()` retornan `null` si la API falla. Sin esta verificación, mostraríamos "éxito" aunque no se guardó nada.

### `configurarFecha()`

**Qué hace:** Establece las fechas mínima y máxima del input de fecha.

```javascript
function configurarFecha() {
    const hoy = new Date();
    const fechaHoy = `${anio}-${mes}-${dia}`;
    fechaTarea.min = fechaHoy;       // No se puede seleccionar fecha pasada
    fechaTarea.max = "2100-12-31";   // Límite razonable
}
```

### `listaTareas.addEventListener("click")` — Delegación de eventos

**Qué hace:** Maneja los clics en los botones de las tarjetas (estado, editar, eliminar).

**¿Qué es delegación de eventos?** En vez de poner un event listener en CADA tarjeta (que pueden ser cientos), ponemos UN solo listener en el contenedor padre. Cuando el usuario hace clic, verificamos si fue en un botón de estado, editar o eliminar.

```javascript
listaTareas.addEventListener("click", async function (event) {
    const botonEstado = event.target.closest(".done-button");
    const botonEditar = event.target.closest(".edit-button");
    const botonEliminar = event.target.closest(".delete-button");

    if (botonEstado) { ... }    // Cambiar estado
    if (botonEditar) { ... }    // Editar tarea
    if (botonEliminar) { ... }  // Eliminar tarea
});
```

**¿Qué es `.closest()`?** Busca el elemento más cercano que coincida con el selector. Si hacés clic en la imagen dentro del botón, `.closest(".done-button")` retorna el botón padre.

#### Cambio de estado (dentro del listener)

**Flujo:**
```
1. Obtiene la tarea por ID
2. Determina el nuevo estado:
   PORHACER → ENPROCESO → COMPLETADA → PORHACER (ciclo)
3. Llama editTask() con todos los datos + el nuevo status
4. Verifica si la operación exitó
5. Si exitó, re-renderiza
6. Si falló, muestra error
```

**¿Por qué se envían TODOS los campos?** Porque `editTask()` usa PUT (reemplazo completo). Si solo enviarías `status`, los otros campos llegarían como `null` y el null check del backend los preservaría. Pero es más seguro enviar todo.

#### Editar tarea

**Flujo:**
```
1. Obtiene la tarea por ID
2. Llena el formulario con los datos actuales
3. Guarda el ID en taskEditandoId
4. Cambia el texto del botón a "Actualizar tarea"
5. Muestra el botón "Cancelar edición"
6. Agrega borde dorado al form
7. Scrollea al formulario
```

#### Eliminar tarea

**Flujo:**
```
1. Muestra SweetAlert2 preguntando "¿Eliminar tarea?"
2. Si confirma:
   a. Llama deleteTask()
   b. Verifica si la operación exitó
   c. Si exitó, re-renderiza y muestra "Tarea eliminada"
   d. Si falló, muestra error
```

### `botonesFiltro.forEach` — Filtros de estado

**Qué hace:** Cuando hace clic en un botón de filtro (Por hacer, En proceso, etc.), actualiza el filtro y re-renderiza.

```javascript
botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
        botonesFiltro.forEach(btn => btn.classList.remove("active"));  // Quita active de todos
        boton.classList.add("active");                                  // Pone active en el clickeado
        filtroActual = boton.dataset.status;                          // "PORHACER", "ENPROCESO", etc.
        taskManager.render(filtroActual, categoriaActual);             // Re-dibuja
    });
});
```

**¿Qué es `dataset.status`?** Es el atributo `data-status` del HTML. `<button data-status="PORHACER">` → `boton.dataset.status` = `"PORHACER"`.

### `filtroCategoriaSelect.addEventListener('change')` — Filtro por categoría

**Qué hace:** Cuando cambia el select de categoría, re-renderiza con el nuevo filtro.

```javascript
filtroCategoriaSelect.addEventListener('change', function () {
    categoriaActual = this.value;  // "CASA", "TRABAJO", "TODAS", etc.
    taskManager.render(filtroActual, categoriaActual);
});
```

### `cancelarEdicion()`

**Qué hace:** Resetea el modo edición.

```javascript
function cancelarEdicion() {
    taskEditandoId = null;                                    // Ya no está editando
    document.querySelector('#btnAgregarTarea').textContent = 'Agregar tarea';  // Texto original
    btnCancelarEdicion.classList.add('d-none');                // Oculta botón cancelar
    formCard.classList.remove('form-editing');                 // Quita borde dorado
    formulario.reset();                                       // Limpia inputs
    configurarFecha();                                        // Re-configura fecha
}
```

### `actualizarProgreso()`

**Qué hace:** Actualiza la barra de progreso y los textos.

```javascript
function actualizarProgreso() {
    const stats = taskManager.getStats();
    const porcentaje = stats.total === 0 ? 0 : Math.round((stats.completadas / stats.total) * 100);
    document.querySelector('#progressText').textContent = `${stats.completadas} de ${stats.total} completadas`;
    document.querySelector('#progressPercent').textContent = `${porcentaje}%`;
    document.querySelector('#progressFill').style.width = `${porcentaje}%`;
}
```

**¿Qué es `Math.round()`?** Redondea al entero más cercano. `66.6` → `67`.

### `actualizarContadoresFiltro()`

**Qué hace:** Actualiza los números entre paréntesis en cada botón de filtro.

```javascript
function actualizarContadoresFiltro() {
    const stats = taskManager.getStats();
    const conteos = {
        'TODAS': stats.total,
        'PORHACER': stats.porHacer,
        'ENPROCESO': stats.enProceso,
        'COMPLETADA': stats.completadas
    };
    botonesFiltro.forEach(boton => {
        const status = boton.dataset.status;
        const label = boton.dataset.label;
        boton.innerHTML = `${label} <span class="filtro-count">(${conteos[status]})</span>`;
    });
}
```

### `actualizarReloj()`

**Qué hace:** Muestra la fecha y hora actual en el navbar, actualizándose cada segundo.

```javascript
function actualizarReloj() {
    const ahora = new Date();
    document.getElementById('fechaActual').textContent = ahora.toLocaleDateString('es-CO', opcionesFecha);
    document.getElementById('horaActual').textContent = ahora.toLocaleTimeString('es-CO', opcionesHora);
}

actualizarReloj();                        // Ejecuta una vez
setInterval(actualizarReloj, 1000);       // Cada 1000ms = 1 segundo
```

---

## 8. Bugs Encontrados y Corregidos

### Bug 1: XSS — Inyección de código malicioso

**Qué pasaba:** `task.nombre` y `task.descripcion` se inyectaban como HTML crudo en `createTaskHtml()`.

**Por qué era grave:** Si alguien creaba una tarea con nombre `<img src=x onerror="alert('hacked')">`, el navegador ejecutaba el JavaScript. Esto permite robar cookies, redirigir a sitios maliciosos, etc.

**Cómo se corrigió:** Se creó la función `escapeHtml()` que convierte `<`, `>`, `&`, `"`, `'` en entidades HTML seguras.

```javascript
// ANTES (PELIGROSO):
<h6>${task.nombre}</h6>

// DESPUÉS (SEGURO):
const nombreSeguro = escapeHtml(task.nombre);
<h6>${nombreSeguro}</h6>
```

**Lección:** Nunca inyectes datos del usuario como HTML crudo. Siempre escapalos.

---

### Bug 2: Mensaje de éxito aunque la API fallara

**Qué pasaba:** Si `addTask()` o `editTask()` retornaban `null` (error), el código seguía ejecutándose y mostraba "Tarea agregada con éxito" al usuario.

**Por qué era grave:** El usuario creía que su tarea se guardó, pero no era así. Perdía datos sin saberlo.

**Cómo se corrigió:** Se verifica el return value antes de mostrar éxito.

```javascript
// ANTES:
await taskManager.addTask(...);
Swal.fire({ icon: "success", title: "Tarea agregada con éxito" });  // SIEMPRE

// DESPUÉS:
const resultado = await taskManager.addTask(...);
if (!resultado) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la tarea.' });
    return;
}
Swal.fire({ icon: "success", title: "Tarea agregada con éxito" });  // Solo si exitó
```

**Lección:** Siempre verificá si una operación asíncrona exitó antes de actuar.

---

### Bug 3: Sin try/catch — Errores de red mataban la app

**Qué pasaba:** Si el usuario apagaba el WiFi o el backend estaba caído, `fetch()` lanzaba un `TypeError` sin manejador. La app mostraba pantalla blanca.

**Por qué era grave:** El usuario no sabía qué pasaba. La app simplemente dejaba de funcionar.

**Cómo se corrigió:** Todos los métodos async ahora tienen `try/catch`.

```javascript
// ANTES:
async addTask(...) {
    const response = await fetch(API_URL, ...);  // Si falla → TypeError sin manejador
    // ...
}

// DESPUÉS:
async addTask(...) {
    try {
        const response = await fetch(API_URL, ...);
        // ...
    } catch (error) {
        console.error('Error de red:', error.message);
        return null;  // La app no muere
    }
}
```

**¿Qué es try/catch?**
```javascript
try {
    // Código que podría fallar
    // Si falla, salta al catch
} catch (error) {
    // Código que se ejecuta si algo falla
    // La app sigue funcionando
}
```

**Lección:** Siempre envolvé las llamadas a APIs en `try/catch`. La red es impredecible.

---

### Bug 4: `validFormFieldInput` trima pero descartaba valores

**Qué pasaba:** La función creaba variables locales con `.trim()` pero no modificaba el objeto `data`. Los valores con espacios extra se enviaban al backend.

```javascript
// ANTES:
function validFormFieldInput(data) {
    const nombre = data.nombre.trim();  // Variable local, data.nombre no cambia
    if (nombre === '') { return false; }
    return true;
}

// DESPUÉS:
function validFormFieldInput(data) {
    data.nombre = data.nombre.trim();   // Modifica el objeto original
    data.descripcion = data.descripcion.trim();
    // ...
    if (data.nombre === '') { return false; }
    return true;
}
```

**Lección:** Si modificás algo en una función, asegurate de que el cambio se refleje fuera.

---

### Bug 5: Delete mostraba éxito aunque la API fallara

**Qué pasaba:** Si `deleteTask()` fallaba, la tarea se borraba del array local pero no de la BD. Al recargar, reaparecía.

**Cómo se corrigió:** `deleteTask()` ahora retorna `true`/`false` y el handler verifica antes de mostrar éxito.

```javascript
// DESPUÉS:
const resultado = await taskManager.deleteTask(taskId);
if (!resultado) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la tarea.' });
    return;
}
Swal.fire({ icon: "success", title: "Tarea eliminada" });
```

---

### Bug 6: Archivos huérfanos y código muerto

**Qué se eliminó:**

| Archivo/Línea | Por qué se eliminó |
|---------------|---------------------|
| `JS/index copy.js` | Backup viejo de index.js, no se usaba |
| `JS/tests.js` | Tests que usaban API síncrona de localStorage, todos fallaban con async |
| `taskManager.js` línea 135-136 | Método `save()` vacío — PostgreSQL persiste los datos |
| `taskManager.js` líneas 11-24, 63-66, 79-90, 126-148 | Código comentado del viejo localStorage |
| `index.js` líneas 18-20 | Código comentado de inicialización vieja |
| `index.js` líneas 105, 128, 196, 239 | `//taskManager.save()` — save() ya no hace nada |
| `index.html` línea 178-180 | Botón de tests oculto con `onclick` inline |

**Lección:** El código muerto confunde. Si no se usa, bórralo. La documentación explica el antes/después.

---

### Bug 7: Favicon roto y duplicado

**Qué pasaba:** `index.html` tenía dos `<link rel="icon">` — uno apuntaba a `./assets/img/logo_deg_sombra.png` (no existe) y otro a `./img/favicon.png`.

**Cómo se corrigió:** Se eliminó el favicon roto y el duplicado. Solo queda `./img/favicon.png`.

---

## 9. Auditoría de Código

### Estado actual después de las correcciones

| Categoría | Estado |
|-----------|--------|
| XSS | ✅ Prevenido con `escapeHtml()` |
| Error handling | ✅ `try/catch` en todos los métodos async |
| Verificación de respuestas | ✅ Se verifica return value antes de mostrar éxito |
| Código muerto | ✅ Eliminado |
| Archivos huérfanos | ✅ Eliminados |
| Backend null checks | ✅ PUT preserva campos null |
| Enums uppercase | ✅ Consistencia Java estándar |
| HTML `value` en selects | ✅ Elimina conversiones de case en JS |

### Mejoras pendientes (futuras)

| # | Mejora | Prioridad |
|---|--------|-----------|
| 1 | `innerHTML +=` → `insertAdjacentHTML` (rendimiento) | Baja |
| 2 | Categorías hardcoded → array dinámico | Baja |
| 3 | Doble-submit protection (deshabilitar botón durante async) | Baja |
| 4 | `API_URL` configurable (config object) | Baja |

---

## 10. Guía de Postman

### Prueba 1: Listar tareas (GET)
```
Método: GET
URL: http://localhost:8080/api/tasks
```
**Resultado esperado:** Código 200, body es un JSON array.

### Prueba 2: Crear tarea (POST)
```
Método: POST
URL: http://localhost:8080/api/tasks
Headers: Content-Type: application/json
Body:
{
    "nombre": "Comprar víveres",
    "descripcion": "Leche, huevos, pan",
    "fecha": "2026-09-20",
    "hora": "10:00",
    "prioridad": "ALTA",
    "categoria": "COMPRAS",
    "status": "PORHACER"
}
```
**Resultado esperado:** Código 201, body es la tarea con `id` generado.

### Prueba 3: Actualizar tarea (PUT)
```
Método: PUT
URL: http://localhost:8080/api/tasks/1
Headers: Content-Type: application/json
Body:
{
    "nombre": "Comprar víveres actualizado",
    "status": "ENPROCESO"
}
```
**Resultado esperado:** Código 200. Solo nombre y status cambiaron; los demás campos se preservan.

### Prueba 4: Eliminar tarea (DELETE)
```
Método: DELETE
URL: http://localhost:8080/api/tasks/1
```
**Resultado esperado:** Código 204, body vacío.

### Prueba 5: Validación de campos vacíos (POST)
```
Método: POST
URL: http://localhost:8080/api/tasks
Body: { "nombre": "", "descripcion": "Test" }
```
**Resultado esperado:** Código 400, body con errores de validación.

---

## 11. Pruebas desde el Navegador

### Prueba 1: Cargar la página
1. Abrir `index.html` en el navegador
2. Verificar que las tareas aparecen en las columnas
3. Verificar barra de progreso

### Prueba 2: Crear tarea
1. Llenar todos los campos
2. Clic en "Agregar tarea"
3. Verificar SweetAlert2 "Tarea agregada con éxito"
4. Verificar tarea en columna "Por hacer"

### Prueba 3: Cambiar estado
1. Clic en "Iniciar" → tarea pasa a "En proceso"
2. Clic en "Completar" → tarea pasa a "Terminadas"
3. Verificar barra de progreso

### Prueba 4: Editar tarea
1. Clic en lápiz → formulario se llena
2. Verificar borde dorado
3. Modificar nombre → "Actualizar tarea"
4. Verificar SweetAlert2 "Tarea actualizada"

### Prueba 5: Eliminar tarea
1. Clic en basura → SweetAlert2 "¿Eliminar?"
2. Clic "Sí, eliminar"
3. Verificar desaparición

### Prueba 6: Filtros
1. Clic en "Por hacer" → solo tareas PORHACER
2. Clic en "Ver todo" → todas
3. Seleccionar categoría → solo esa categoría

### Prueba 7: Verificar en pgAdmin
1. Abrir pgAdmin → tasks_db → tabla `tareas`
2. Verificar que los datos coinciden con lo creado/editado/eliminado

---

## 12. Glosario para Junior Dev

| Término | Significado |
|---------|-------------|
| **DOM** | Document Object Model. La estructura de árboles del HTML que JavaScript puede modificar. |
| **Event Listener** | "Escuchador de eventos". Función que se ejecuta cuando pasa algo (clic, submit, change, etc.) |
| **localStorage** | Almacenamiento del navegador que persiste aunque cierres la pestaña. (Ya no se usa) |
| **CSS Variables** | Valores reutilizables definidos con `--` y usados con `var()`. |
| **Media Query** | Regla CSS que aplica estilos solo en ciertas condiciones (ancho de pantalla, etc.) |
| **innerHTML** | Propiedad para leer/escribir el contenido HTML de un elemento. |
| **Template Literal** | Strings con backticks `` ` `` que permiten interpolación `${variable}` y saltos de línea. |
| **Fetch API** | Interfaz nativa de JavaScript para hacer peticiones HTTP desde el navegador. |
| **async/await** | Palabras clave de JavaScript para manejar código asíncrono de forma limpia. |
| **try/catch** | Manejo de errores: `try` intenta ejecutar código, `catch` maneja si algo falla. |
| **XSS** | Cross-Site Scripting. Ataque de seguridad donde se inyecta código malicioso en HTML. |
| **escapeHtml** | Función que convierte caracteres peligrosos (`<`, `>`, `&`) en entidades seguras (`&lt;`, `&gt;`, `&amp;`). |
| **JPA** | Java Persistence API. Estándar para mapear objetos Java a tablas de base de datos. |
| **Hibernate** | Implementación de JPA que genera SQL automáticamente. |
| **JpaRepository** | Interfaz de Spring Data que trae CRUD completo sin escribir SQL. |
| **CORS** | Cross-Origin Resource Sharing. Mecanismo de seguridad que permite/restringe peticiones entre dominios. |
| **@Entity** | Anotación JPA que indica que una clase se mapea a una tabla de BD. |
| **@RestController** | Anotación Spring que indica que una clase maneja peticiones HTTP y retorna JSON. |
| **@CrossOrigin** | Anotación que habilita CORS para un controlador o método específico. |
| **@Valid** | Anotación que activa las validaciones de Jakarta Bean Validation. |
| **@Enumerated** | Anotación JPA para mapear enums Java a columnas de BD. |
| **PostgreSQL** | Sistema de base de datos relacional open source. |
| **pgAdmin** | Herramienta gráfica para administrar PostgreSQL. |
| **Endpoint** | Punto de acceso de una API (URL + método HTTP). |
| **REST API** | Arquitectura de APIs que usa verbos HTTP (GET, POST, PUT, DELETE) para operaciones CRUD. |
| **Null check** | Verificar si una variable es `null` antes de usarla para evitar errores. |
| **Delegación de eventos** | Patrón donde un listener en un padre maneja eventos de sus hijos. |
| **Promise** | Objeto que representa el resultado futuro de una operación asíncrona. |

---

## 13. Plan Futuro

Ideas pendientes para implementar:

### Sistema de puntos
- **Descripción:** +10 puntos por tarea completada, +5 puntos extra si la prioridad es alta
- **Dónde implementar:** Nuevo método `getPoints()` en `TaskManager`

### Rachas (streaks)
- **Descripción:** Mostrar días consecutivos en los que el usuario completó al menos 1 tarea
- **Visual:** Icono de fuego en el header

### Logros / Diplomas
- **Descripción:** Desbloquear insignias como "Completaste 10 tareas"
- **Visual:** Modal con SweetAlert2 al desbloquear

### Calendario interactivo
- **Descripción:** Mini calendario que muestre días con tareas
- **Ubicación:** Columna derecha en desktop

---

## 14. Cambios CSS — Colores, Footer, Hover (Sesión 16 Sept 2026)

### 14.1 Footer Sticky con CSS Grid

**Problema:** El footer no permanecía abajo al hacer zoom o si el contenido era corto.

**Solución:** CSS Grid en `body` con `grid-template-rows`.

**Dónde está:** `css/styles.css` → `body` (línea 114)

```css
body {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    /* navbar | header | contenido | footer */
}
```

**Cómo funciona:**
| Valor | Elemento | Comportamiento |
|-------|----------|----------------|
| `auto` | navbar | Tamaño de su contenido |
| `auto` | header | Tamaño de su contenido |
| `1fr` | contenido | **Crece para llenar el espacio restante** |
| `auto` | footer | Tamaño de su contenido |

**¿Por qué `1fr`?** La unidad `fr` (fracción)分配a el espacio restante después de que los `auto` toman lo suyo. El footer siempre queda abajo.

---

### 14.2 Botón "Agregar Tarea" — Hover Púrpura

**Problema:** El hover original solo reducía opacidad al 90%, haciendo que el texto blanco se viera gris.

**Solución:** Hover con gradiente púrpura claro +抬arriba + sombra.

**Dónde está:** `css/styles.css` → `.btn-gradient` (línea 172)

```css
.btn-gradient {
    background: linear-gradient(180deg, var(--color-purple-bright), var(--color-purple));
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(109, 76, 255, 0.3);
}

.btn-gradient:hover {
    background: linear-gradient(180deg, var(--color-purple-hover), var(--color-purple-bright));
    color: var(--color-text-white);  /* ← Texto SIEMPRE blanco */
    transform: translateY(-2px);      /*抬arriba 2px */
    box-shadow: 0 6px 20px rgba(109, 76, 255, 0.4);
}
```

**Efecto visual:**
```
Normal:  purple-bright → purple     + sombra suave
Hover:   purple-hover → purple-bright + sombra fuerte +抬arriba
         Texto: SIEMPRE BLANCO ✅
```

---

### 14.3 Footer — Gradiente Vertical

**Problema:** El footer tenía gradiente horizontal (`90deg`) mientras el header era vertical (`180deg`).

**Solución:** Unificar dirección vertical.

**Dónde está:** `css/styles.css` → `.footer-main` (línea 860)

```css
/* ANTES: */
background: linear-gradient(90deg, var(--color-black), var(--color-purple));

/* DESPUÉS: */
background: linear-gradient(180deg, var(--color-purple-dark), var(--color-black));
```

**Resultado:**
```
Header:  purple-bright → purple-dark  (↓ vertical)
Footer:  purple-dark → black          (↓ vertical)
```

---

### 14.4 Filtros con Colores de Estado

**Problema:** Todos los filtros activos tenían el mismo gradiente `black → purple`.

**Solución:** Cada filtro ahora tiene el mismo gradiente que su tarjeta de estado.

**Dónde está:** `css/styles.css` → `.filtro.active[data-status="..."]` (líneas 516-538)

```css
/* Ver todo — purple oscuro */
.filtro.active[data-status="TODAS"] {
    background: var(--color-purple-dark);
}

/* Por hacer — matching tarjeta pendiente */
.filtro.active[data-status="PORHACER"] {
    background: linear-gradient(135deg, var(--color-pendiente-from), var(--color-pendiente-to));
}

/* En proceso — matching tarjeta proceso */
.filtro.active[data-status="ENPROCESO"] {
    background: linear-gradient(135deg, var(--color-proceso-from), var(--color-proceso-to));
}

/* Terminadas — matching tarjeta terminado */
.filtro.active[data-status="COMPLETADA"] {
    background: linear-gradient(135deg, var(--color-terminado-from), var(--color-terminado-to));
}
```

**Resultado visual:**
| Filtro | Gradiente | Coincide con tarjeta |
|--------|-----------|---------------------|
| Ver todo | `purple-dark` (sólido) | — |
| Por hacer | `#c07ee6 → #7c0794` | ✅ estado-pendiente |
| En proceso | `#7c4cf3 → #3d3b34` | ✅ estado-proceso |
| Terminadas | `#18d8b4 → #02513d` | ✅ estado-terminado |

---

### 14.5 Hover Sutil en Tarjetas de Tarea

**Problema:** Las tarjetas no tenían feedback visual al pasar el mouse.

**Solución:** Hover con brillo del 12% específico por estado.

**Dónde está:** `css/styles.css` → `.estado-*:hover` (líneas 420, 447, 473)

```css
.estado-pendiente:hover {
    filter: brightness(1.12);
}

.estado-proceso:hover {
    filter: brightness(1.12);
}

.estado-terminado:hover {
    filter: brightness(1.12);
}
```

**¿Por qué `brightness(1.12)`?**
- `1.0` = sin cambio
- `1.12` = 12% más brillante (visible pero sutil)
- Cada estado tiene `transition: filter .25s ease` para animación suave

**Lección:** El hover en elementos con gradiente necesita `filter` en vez de `background-color`, porque el gradiente se define en una clase separada.

---

### 14.6 Variable `--color-purple-hover` Corregida

**Problema:** La variable era azul, no púrpura.

```css
/* ANTES: */
--color-purple-hover: #5c8bf0;  /* ← AZUL */

/* DESPUÉS: */
--color-purple-hover: #8b6cff;  /* ← PÚRPURA CLARO */
```

---

### Resumen de Cambios CSS (Sesión 16 Sept)

| # | Cambio | Archivo | Línea |
|---|--------|---------|-------|
| 1 | Footer sticky con CSS Grid | `styles.css` | 114 |
| 2 | Botón hover púrpura | `styles.css` | 172-192 |
| 3 | Footer gradiente vertical | `styles.css` | 860 |
| 4 | Filtros con colores de estado | `styles.css` | 516-538 |
| 5 | Hover sutil en tarjetas | `styles.css` | 420, 447, 473 |
| 6 | Purple-hover corregido | `styles.css` | 12 |

---

## 15. Despliegue — Supabase + Render + GitHub Pages

### Arquitectura de producción

```
┌─────────────────────┐      HTTPS       ┌──────────────────┐      JDBC      ┌────────────┐
│     Frontend        │ ──────────────→ │   Spring Boot    │ ────────────→ │  Supabase  │
│  (GitHub Pages)     │  fetch() API     │   (Render)       │  JPA/Hibernate│  (PostgreSQL)│
│  Puerto: archivo    │                  │  Puerto: 8080    │               │  Puerto: 5432│
└─────────────────────┘                  └──────────────────┘               └────────────┘
```

### Supabase (Base de datos)

| Configuración | Valor |
|---------------|-------|
| Host | `db.qpdoxtubdrxohqdiyumg.supabase.co` |
| Pooler Host | `aws-0-us-east-2.pooler.supabase.com` |
| Puerto | 5432 |
| Usuario | `postgres.qpdoxtubdrxohqdiyumg` |
| Base de datos | `postgres` |
| SSL | Requerido (`?sslmode=require`) |

### Render (Backend)

| Variable de entorno | Valor |
|---------------------|-------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | `postgres.qpdoxtubdrxohqdiyumg` |
| `SPRING_DATASOURCE_PASSWORD` | `[tu contraseña de Supabase]` |

### GitHub Pages (Frontend)

| Configuración | Valor |
|---------------|-------|
| URL | `https://carolpinerostrujillo.github.io/Web_planificadorTareas/` |
| `API_URL` en `taskManager.js` | `https://plannerappcp-backend.onrender.com/api/tasks` |

### Dockerfile (Backend)

```dockerfile
# Etapa 1: compilar con Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Etapa 2: imagen final solo con el JAR
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Errores comunes de despliegue

| Error | Causa | Solución |
|-------|-------|----------|
| `release version 25 not supported` | Docker image no tiene Java 25 | Usar Java 21 en `pom.xml` y Dockerfile |
| `FATAL: tenant/user not found` | Username o host incorrecto | Verificar env vars en Render |
| `Network is unreachable` | Supabase pausado o env vars incorrectas | Restaurar proyecto en Supabase |
