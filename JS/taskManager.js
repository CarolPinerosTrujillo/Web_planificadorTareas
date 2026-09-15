class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }

    addTask(nombre, descripcion, categoria, fecha, hora, prioridad) {
        this.currentId++;
        this.tasks.push({
            id: this.currentId,
            nombre: nombre,
            descripcion: descripcion,
            fecha: fecha,
            hora: hora,
            prioridad: prioridad,
            categoria: categoria,
            status: 'PORHACER'
        });
    }

    getTaskById(taskId) {
        let foundTask;
        for (let task of this.tasks) {
            if (task.id === taskId) {
                foundTask = task;
                break;
            }
        }
        return foundTask;
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    editTask(taskId, nuevosDatos) {
        const task = this.getTaskById(taskId);
        if (task) {
            task.nombre = nuevosDatos.nombre;
            task.descripcion = nuevosDatos.descripcion;
            task.categoria = nuevosDatos.categoria;
            task.fecha = nuevosDatos.fecha;
            task.hora = nuevosDatos.hora;
            task.prioridad = nuevosDatos.prioridad;
        }
    }

    save() {
        const tasksJson = JSON.stringify(this.tasks);
        localStorage.setItem('tasks', tasksJson);
        const currentId = String(this.currentId);
        localStorage.setItem('currentId', currentId);
    }

    load() {
        const tasksJson = localStorage.getItem('tasks');
        if (tasksJson) {
            this.tasks = JSON.parse(tasksJson);
        }
        const currentId = localStorage.getItem('currentId');
        if (currentId) {
            this.currentId = Number(currentId);
        }
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
        const descEscapada = task.descripcion.replace(/"/g, '&quot;');

        return `
        <div class="task-card ${estado.clase} task-card--entering" data-task-id="${task.id}">
            <div class="task-card__header">
                <div class="task-card__title-wrapper">
                    <span class="task-status-icon">${estado.icono}</span>
                    <h6 class="tituloTarea" title="${descEscapada}">${task.nombre}</h6>
                </div>
                <span class="estado-badge">${estado.texto}</span>
            </div>
            <p class="task-description" title="${descEscapada}">${task.descripcion}</p>
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

    render(filtroActual = "TODAS", filtroCategoria = "TODAS") {
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
            return matchEstado && matchCategoria;
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
            listaPorHacer.innerHTML = emptyHtml('💅', 'No hay tareas pendientes','🫂');
        }
        if (listaProceso.children.length === 0) {
            listaProceso.innerHTML = emptyHtml('🤗', 'Nada en proceso','🤸🏽‍♀️');
        }
        if (listaTerminadas.children.length === 0) {
            listaTerminadas.innerHTML = emptyHtml('🥺', 'Sin tareas completadas','🫪');
        }
    }
}
