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
let taskEditandoId = null;

configurarFecha();
taskManager.render();
cargarTareasEjemplo();

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

    if (taskEditandoId) {
        taskManager.editTask(taskEditandoId, data);
        taskEditandoId = null;
        document.querySelector('#btnAgregarTarea').textContent = 'Agregar tarea';

        taskManager.save();
        taskManager.render(filtroActual);

        Swal.fire({
            icon: "success",
            title: "Tarea actualizada",
            text: "La tarea fue actualizada correctamente."
        }).then(() => {
            formulario.reset();
            configurarFecha();
        });
    } else {
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
    }
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
    const botonEditar = event.target.closest(".edit-button");
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

    if (botonEditar) {
        const tarjeta = botonEditar.closest(".task-card");
        const taskId = Number(tarjeta.dataset.taskId);
        const task = taskManager.getTaskById(taskId);

        if (!task) return;

        nombreTarea.value = task.nombre;
        descripcionTarea.value = task.descripcion;
        categoriaTarea.value = task.categoria;
        fechaTarea.value = task.fecha;
        horaTarea.value = task.hora;
        prioridadTarea.value = task.prioridad;

        taskEditandoId = taskId;
        document.querySelector('#btnAgregarTarea').textContent = 'Actualizar tarea';
        formulario.scrollIntoView({ behavior: 'smooth' });
    }

    if (botonEliminar) {
        const tarjeta = botonEliminar.closest(".task-card");
        const taskId = Number(tarjeta.dataset.taskId);

        Swal.fire({
            title: '¿Eliminar tarea?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
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

function cancelarEdicion() {
    taskEditandoId = null;
    document.querySelector('#btnAgregarTarea').textContent = 'Agregar tarea';
    formulario.reset();
    configurarFecha();
}

function actualizarReloj() {
    const ahora = new Date();
    const opcionesFecha = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

    document.getElementById('fechaActual').textContent = ahora.toLocaleDateString('es-CO', opcionesFecha);
    document.getElementById('horaActual').textContent = ahora.toLocaleTimeString('es-CO', opcionesHora);
}

actualizarReloj();
setInterval(actualizarReloj, 1000);

function cargarTareasEjemplo() {
    if (taskManager.tasks.length > 0) return;

    taskManager.addTask('Comprar víveres', 'Leche, huevos, pan', 'Compras', '2026-09-10', '10:00', 'Alta');
    taskManager.addTask('Estudiar JavaScript', 'Repasar arrays y objetos', 'Estudio', '2026-09-11', '14:00', 'Media');
    taskManager.addTask('Pagar servicios', 'Agua, luz, internet', 'Finanzas', '2026-09-12', '09:00', 'Alta');
    taskManager.addTask('Ir al dentista', 'Control de rutina', 'Personal', '2026-09-05', '10:00', 'Media');

    taskManager.save();
    taskManager.render();
}
