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

        return `
        <div class="task-card ${estado.clase}" data-task-id="${task.id}">
            <div class="task-card__header">
                <div class="task-card__title-wrapper">
                    <span class="task-status-icon">${estado.icono}</span>
                    <h6 class="tituloTarea">${task.nombre}</h6>
                </div>
                <span class="estado-badge">${estado.texto}</span>
            </div>
            <p class="task-description">${task.descripcion}</p>
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
                <button class="delete-button">
                    Eliminar
                </button>
            </div>
        </div>
        `;
    }

    render(filtroActual = "TODAS") {
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
            if (filtroActual === "TODAS") {
                return true;
            }
            return task.status === filtroActual;
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
    }
}
