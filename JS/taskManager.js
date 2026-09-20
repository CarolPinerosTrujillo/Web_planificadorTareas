//const API_URL = 'http://localhost:8080/api/tasks';
const API_URL = 'https://plannerappcp-backend.onrender.com/api/tasks';
const AUTH_API = API_URL.replace('/tasks', '/auth');

function escapeHtml(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.deviceId = this.getOrCreateDeviceId();
    }

    getOrCreateDeviceId() {
        let id = localStorage.getItem('planner_device_id');
        if (!id) {
            id = 'dev_' + crypto.randomUUID();
            localStorage.setItem('planner_device_id', id);
        }
        return id;
    }

    async addTask(nombre, descripcion, categoria, fecha, hora, prioridad) {
        try {
            const email = this.getLinkedEmail();
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    descripcion,
                    categoria,
                    fecha,
                    hora,
                    prioridad,
                    status: 'PORHACER',
                    deviceId: this.deviceId,
                    userEmail: email || ''
                })
            });
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al crear tarea:', error);
                return null;
            }
            const nuevaTarea = await response.json();
            this.tasks.push(nuevaTarea);
            return nuevaTarea;
        } catch (error) {
            console.error('Error de red al crear tarea:', error.message);
            return null;
        }
    }

    getTaskById(taskId) {
        return this.tasks.find(t => t.id === taskId);
    }

    async deleteTask(taskId) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                console.error('Error al eliminar tarea');
                return false;
            }
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            return true;
        } catch (error) {
            console.error('Error de red al eliminar tarea:', error.message);
            return false;
        }
    }

    async editTask(taskId, nuevosDatos) {
        try {
            const existente = this.getTaskById(taskId);
            const datosAEnviar = {
                nombre: nuevosDatos.nombre,
                descripcion: nuevosDatos.descripcion,
                categoria: nuevosDatos.categoria,
                fecha: nuevosDatos.fecha,
                hora: nuevosDatos.hora,
                prioridad: nuevosDatos.prioridad,
                status: nuevosDatos.status || (existente ? existente.status : 'PORHACER')
            };

            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosAEnviar)
            });
            if (!response.ok) {
                const error = await response.text();
                console.error('Error al actualizar tarea:', error);
                return null;
            }
            const tareaActualizada = await response.json();
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.tasks[index] = tareaActualizada;
            }
            return tareaActualizada;
        } catch (error) {
            console.error('Error de red al actualizar tarea:', error.message);
            return null;
        }
    }

    async load() {
        try {
            const email = this.getLinkedEmail();
            let url = API_URL;
            if (email) {
                url += `?userEmail=${encodeURIComponent(email)}`;
            } else {
                url += `?deviceId=${this.deviceId}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Error al cargar tareas');
                this.tasks = [];
                return;
            }
            this.tasks = await response.json();
        } catch (error) {
            console.error('Error de red al cargar tareas:', error.message);
            this.tasks = [];
        }
    }

    async registerEmail(email) {
        try {
            const response = await fetch(`${AUTH_API}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, deviceId: this.deviceId })
            });
            if (response.ok) {
                localStorage.setItem('planner_user_email', email);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error de red al registrar email:', error.message);
            return false;
        }
    }

    async sendRecoveryCode(email) {
        try {
            const response = await fetch(`${AUTH_API}/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            return response.ok;
        } catch (error) {
            console.error('Error de red al enviar código:', error.message);
            return false;
        }
    }

    async verifyRecoveryCode(email, code) {
        try {
            const response = await fetch(`${AUTH_API}/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            if (!response.ok) return null;
            const data = await response.json();
            localStorage.setItem('planner_device_id', data.deviceId);
            localStorage.setItem('planner_user_email', email);
            this.deviceId = data.deviceId;
            return data.deviceId;
        } catch (error) {
            console.error('Error de red al verificar código:', error.message);
            return null;
        }
    }

    getLinkedEmail() {
        return localStorage.getItem('planner_user_email');
    }

    unlinkEmail() {
        localStorage.removeItem('planner_user_email');
    }

    getStats() {
        const total = this.tasks.length;
        const completadas = this.tasks.filter(t => t.status === 'COMPLETADA').length;
        const porHacer = this.tasks.filter(t => t.status === 'PORHACER').length;
        const enProceso = this.tasks.filter(t => t.status === 'ENPROCESO').length;
        return { total, completadas, porHacer, enProceso };
    }

    createTaskHtml(task) {
        const estadoConfig = {
            PORHACER: {
                texto: "Por hacer",
                boton: "Iniciar",
                clase: "estado-pendiente",
                icono: "○"
            },
            ENPROCESO: {
                texto: "En proceso",
                boton: "Completar",
                clase: "estado-proceso",
                icono: "◐"
            },
            COMPLETADA: {
                texto: "Completada",
                boton: "Reabrir",
                clase: "estado-terminado",
                icono: "✓"
            }
        };

        const estado = estadoConfig[task.status] || estadoConfig.PORHACER;
        const categoriaClass = task.categoria.toLowerCase();
        const nombreSeguro = escapeHtml(task.nombre);
        const descSegura = escapeHtml(task.descripcion);

        return `
        <div class="task-card ${estado.clase} task-card--entering" data-task-id="${task.id}">
            <div class="task-card__header">
                <div class="task-card__title-wrapper">
                    <span class="task-status-icon">${estado.icono}</span>
                    <h6 class="tituloTarea" title="${descSegura}">${nombreSeguro}</h6>
                </div>
                <span class="estado-badge">${estado.texto}</span>
            </div>
            <p class="task-description" title="${descSegura}">${descSegura}</p>
            <div class="task-info">
                <span>📅 ${task.fecha}</span>
                <span>🕐 ${task.hora}</span>
            </div>
            <div class="task-card__footer">
                <span class="badge categoria categoria-${categoriaClass}">
                    ${task.categoria}
                </span>
                <span class="prioridad prioridad-${task.prioridad.toLowerCase()}">
                    ${task.prioridad}
                </span>
            </div>
            <div class="task-actions">
                <button class="done-button btnEstado">
                    ${estado.boton}
                </button>
                <button class="edit-button">
                    <img src="img/editar.png" alt="Editar" class="btn-icon">
                </button>
                <button class="delete-button">
                    <img src="img/borrar.png" alt="Eliminar" class="btn-icon">
                </button>
            </div>
        </div>
        `;
    }

    render(filtroActual = "TODAS", filtroCategoria = "TODAS", filtroFecha = null) {
        const listaPorHacer = document.querySelector("#listaPorHacer");
        const listaProceso = document.querySelector("#listaProceso");
        const listaTerminadas = document.querySelector("#listaTerminadas");

        const colPorHacer = listaPorHacer.closest(".col-12");
        const colProceso = listaProceso.closest(".col-12");
        const colTerminadas = listaTerminadas.closest(".col-12");

        listaPorHacer.innerHTML = "";
        listaProceso.innerHTML = "";
        listaTerminadas.innerHTML = "";

        if (filtroActual === "TODAS") {
            colPorHacer.style.display = "";
            colProceso.style.display = "";
            colTerminadas.style.display = "";
        } else {
            colPorHacer.style.display = filtroActual === "PORHACER" ? "" : "none";
            colProceso.style.display = filtroActual === "ENPROCESO" ? "" : "none";
            colTerminadas.style.display = filtroActual === "COMPLETADA" ? "" : "none";
        }

        const tareasFiltradas = this.tasks.filter(function (task) {
            const matchEstado = filtroActual === "TODAS" || task.status === filtroActual;
            const matchCategoria = filtroCategoria === "TODAS" || task.categoria === filtroCategoria;
            const matchFecha = !filtroFecha || task.fecha === filtroFecha;
            return matchEstado && matchCategoria && matchFecha;
        });

        for (let task of tareasFiltradas) {
            const html = this.createTaskHtml(task);

            if (task.status === "PORHACER") {
                listaPorHacer.innerHTML += html;
            }

            if (task.status === "ENPROCESO") {
                listaProceso.innerHTML += html;
            }

            if (task.status === "COMPLETADA") {
                listaTerminadas.innerHTML += html;
            }
        }

        const emptyHtml = (emoji, texto, emoji2) => `
            <div class="empty-state">
                <span class="empty-state__icon">${emoji}</span>
                <p class="empty-state__text">${texto}</p>
                <span class="empty-state__icon">${emoji2}</span>
            </div>
        `;

        if (listaPorHacer.children.length === 0) {
            listaPorHacer.innerHTML = emptyHtml('💅', 'No hay tareas pendientes', '🫂');
        }
        if (listaProceso.children.length === 0) {
            listaProceso.innerHTML = emptyHtml('🤗', 'Nada en proceso', '🤸🏽‍♀️');
        }
        if (listaTerminadas.children.length === 0) {
            listaTerminadas.innerHTML = emptyHtml('🥺', 'Sin tareas completadas', '🫪');
        }
    }
}
