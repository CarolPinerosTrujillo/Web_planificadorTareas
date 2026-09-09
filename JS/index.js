const formulario = document.querySelector("#formularioTareas");

// ELEMENTOS
const nombreTarea = document.querySelector('#nombreTarea');
const descripcionTarea = document.querySelector('#descripcionTarea');
const categoriaTarea = document.querySelector('#categoriaTarea');
const fechaTarea = document.querySelector('#fechaTarea');
const horaTarea = document.querySelector('#horaTarea');
const prioridadTarea = document.querySelector('#prioridadTarea');
const mensajeError = document.querySelector("#mensajeError");

const listaTareas = document.querySelector("#listaTareas");
const botonesFiltro = document.querySelectorAll(".filtro");

const taskManager = new TaskManager();
taskManager.load();

let filtroActual = "TODAS";

configurarFecha();
taskManager.render();

function validFormFieldInput(data) {
    const nombre = data.nombre.trim();
    const descripcion = data.descripcion.trim();
    const categoria = data.categoria.trim();
    const fecha = data.fecha.trim();
    const hora = data.hora.trim();
    const prioridad = data.prioridad.trim();

    if (nombre === '' || descripcion === '' || categoria === '' || fecha === '' || hora === '' || prioridad === '') { return false; }
    return true;
}

formulario.addEventListener('submit', function (event) {
    event.preventDefault();

    const nombre = nombreTarea.value;
    const descripcion = descripcionTarea.value;
    const categoria = categoriaTarea.value;
    const fecha = fechaTarea.value;
    const hora = horaTarea.value;
    const prioridad = prioridadTarea.value;

    const data = {
        nombre,
        descripcion,
        categoria,
        fecha,
        hora,
        prioridad,
    };

    if (!validFormFieldInput(data)) {
        mensajeError.classList.remove("d-none");
        Swal.fire({
            icon: 'error',
            title: 'Datos inválidos',
            text: 'Por favor completa todos los campos: Nombre, Descripción, Categoría, Fecha, Hora, y Prioridad de la tarea.'
        });
        return;
    }

    const fechaSeleccionada = data.fecha;
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaMaxima = "2100-12-31";

    if (fechaSeleccionada < `${anio}-${mes}-${dia}` || fechaSeleccionada > fechaMaxima) {
        mensajeError.classList.remove("d-none");
        Swal.fire({
            icon: "error",
            title: "Fecha inválida",
            text: "La fecha debe estar entre hoy y el 31 de diciembre de 2100."
        });
        return;
    }

    mensajeError.classList.add("d-none");

    taskManager.addTask(
        data.nombre,
        data.descripcion,
        data.categoria,
        data.fecha,
        data.hora,
        data.prioridad
    );

    taskManager.save();
    taskManager.render();

    Swal.fire({
        icon: "success",
        title: "Tarea agregada con éxito",
        text: "La tarea fue registrada correctamente."
    }).then(() => {
        formulario.reset();
        configurarFecha();
    });
});

function configurarFecha() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaHoy = `${anio}-${mes}-${dia}`;
    fechaTarea.min = fechaHoy;
    fechaTarea.max = "2100-12-31";
}

listaTareas.addEventListener("click", function (event) {
    const botonEstado = event.target.closest(".done-button");
    const botonEliminar = event.target.closest(".delete-button");

    if (botonEstado) {
        const tarjeta = botonEstado.closest(".task-card");
        const taskId = Number(tarjeta.dataset.taskId);
        const task = taskManager.getTaskById(taskId);

        if (!task) return;

        if (task.status === "PORHACER") {
            task.status = "ENPROCESO";
        } else if (task.status === "ENPROCESO") {
            task.status = "COMPLETADA";
        } else if (task.status === "COMPLETADA") {
            task.status = "PORHACER";
        }

        taskManager.save();
        taskManager.render();
    }

    if (botonEliminar) {
        const tarjeta = botonEliminar.closest(".task-card");
        const taskId = Number(tarjeta.dataset.taskId);

        taskManager.deleteTask(taskId);
        taskManager.save();
        taskManager.render();

        Swal.fire({
            icon: "success",
            title: "Tarea eliminada",
            text: "La tarea fue eliminada.",
            timer: 1500,
            showConfirmButton: false
        });
    }
});

botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
        botonesFiltro.forEach(btn => btn.classList.remove("active"));
        boton.classList.add("active");
        filtroActual = boton.dataset.status;
        taskManager.render(filtroActual);
    });
});

function actualizarReloj() {
    const ahora = new Date();
    const opcionesFecha = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

    document.getElementById('fechaActual').textContent = ahora.toLocaleDateString('es-CO', opcionesFecha);
    document.getElementById('horaActual').textContent = ahora.toLocaleTimeString('es-CO', opcionesHora);
}

actualizarReloj();
setInterval(actualizarReloj, 1000);
