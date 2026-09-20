const formulario = document.querySelector("#formularioTareas");

const nombreTarea = document.querySelector('#nombreTarea');
const descripcionTarea = document.querySelector('#descripcionTarea');
const categoriaTarea = document.querySelector('#categoriaTarea');
const fechaTarea = document.querySelector('#fechaTarea');
const horaTarea = document.querySelector('#horaTarea');
const prioridadTarea = document.querySelector('#prioridadTarea');
const mensajeError = document.querySelector("#mensajeError");

const listaTareas = document.querySelector("#listaTareas");
const botonesFiltro = document.querySelectorAll(".filtro");
const btnCancelarEdicion = document.querySelector('#btnCancelarEdicion');
const formCard = document.querySelector('.form-card');
const filtroCategoriaSelect = document.querySelector('#filtroCategoria');

let filtroActual = "TODAS";
let categoriaActual = "TODAS";
let filtroFecha = null;
let taskEditandoId = null;

const taskManager = new TaskManager();
taskManager.load().then(() => {
    taskManager.render(filtroActual, categoriaActual, filtroFecha);
    renderMiniCalendar();
    actualizarProgreso();
    actualizarContadoresFiltro();
});

configurarFecha();

function validFormFieldInput(data) {
    data.nombre = data.nombre.trim();
    data.descripcion = data.descripcion.trim();
    data.categoria = data.categoria.trim();
    data.fecha = data.fecha.trim();
    data.hora = data.hora.trim();
    data.prioridad = data.prioridad.trim();

    if (data.nombre === '' || data.descripcion === '' || data.categoria === '' || data.fecha === '' || data.hora === '' || data.prioridad === '') { return false; }
    return true;
}

formulario.addEventListener('submit', async function (event) {
    event.preventDefault();

    const data = {
        nombre: nombreTarea.value,
        descripcion: descripcionTarea.value,
        categoria: categoriaTarea.value,
        fecha: fechaTarea.value,
        hora: horaTarea.value,
        prioridad: prioridadTarea.value,
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

    try {
        if (taskEditandoId) {
            const resultado = await taskManager.editTask(taskEditandoId, data);
            if (!resultado) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la tarea. Verifica que el servidor esté corriendo.' });
                return;
            }
            taskEditandoId = null;
            document.querySelector('#btnAgregarTarea').textContent = 'Agregar tarea';
            btnCancelarEdicion.classList.add('d-none');
            formCard.classList.remove('form-editing');

            taskManager.render(filtroActual, categoriaActual, filtroFecha);
        renderMiniCalendar();
            actualizarProgreso();
            actualizarContadoresFiltro();

            Swal.fire({
                icon: "success",
                title: "Tarea actualizada",
                text: "La tarea fue actualizada correctamente."
            }).then(() => {
                formulario.reset();
                configurarFecha();
            });
        } else {
            const resultado = await taskManager.addTask(
                data.nombre,
                data.descripcion,
                data.categoria,
                data.fecha,
                data.hora,
                data.prioridad
            );
            if (!resultado) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la tarea. Verifica que el servidor esté corriendo.' });
                return;
            }

            taskManager.render(filtroActual, categoriaActual, filtroFecha);
        renderMiniCalendar();
            actualizarProgreso();
            actualizarContadoresFiltro();

            Swal.fire({
                icon: "success",
                title: "Tarea agregada con éxito",
                text: "La tarea fue registrada correctamente."
            }).then(() => {
                formulario.reset();
                configurarFecha();
            });
        }
    } catch (error) {
        console.error('Error inesperado:', error);
        Swal.fire({ icon: 'error', title: 'Error inesperado', text: 'Ocurrió un error inesperado. Intenta de nuevo.' });
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

listaTareas.addEventListener("click", async function (event) {
    const botonEstado = event.target.closest(".done-button");
    const botonEditar = event.target.closest(".edit-button");
    const botonEliminar = event.target.closest(".delete-button");

    if (botonEstado) {
        const tarjeta = botonEstado.closest(".task-card");
        const taskId = Number(tarjeta.dataset.taskId);
        const task = taskManager.getTaskById(taskId);

        if (!task) return;

        try {
            let nuevoStatus;
            if (task.status === "PORHACER") {
                nuevoStatus = "ENPROCESO";
            } else if (task.status === "ENPROCESO") {
                nuevoStatus = "COMPLETADA";
            } else {
                nuevoStatus = "PORHACER";
            }

            const resultado = await taskManager.editTask(taskId, {
                nombre: task.nombre,
                descripcion: task.descripcion,
                categoria: task.categoria,
                fecha: task.fecha,
                hora: task.hora,
                prioridad: task.prioridad,
                status: nuevoStatus
            });

            if (!resultado) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado de la tarea.' });
                return;
            }

            taskManager.render(filtroActual, categoriaActual, filtroFecha);
        renderMiniCalendar();
            actualizarProgreso();
            actualizarContadoresFiltro();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al cambiar el estado.' });
        }
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
        btnCancelarEdicion.classList.remove('d-none');
        formCard.classList.add('form-editing');
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resultado = await taskManager.deleteTask(taskId);
                    if (!resultado) {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la tarea.' });
                        return;
                    }
                    taskManager.render(filtroActual, categoriaActual, filtroFecha);
        renderMiniCalendar();
                    actualizarProgreso();
                    actualizarContadoresFiltro();
                    Swal.fire({
                        icon: "success",
                        title: "Tarea eliminada",
                        text: "La tarea fue eliminada.",
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al eliminar la tarea.' });
                }
            }
        });
    }
});

botonesFiltro.forEach(function (boton) {
    boton.addEventListener("click", function () {
        botonesFiltro.forEach(btn => btn.classList.remove("active"));
        boton.classList.add("active");
        filtroActual = boton.dataset.status;
        taskManager.render(filtroActual, categoriaActual, filtroFecha);
        renderMiniCalendar();
        actualizarProgreso();
        actualizarContadoresFiltro();
    });
});

filtroCategoriaSelect.addEventListener('change', function () {
    categoriaActual = this.value;
    taskManager.render(filtroActual, categoriaActual, filtroFecha);
        renderMiniCalendar();
    actualizarProgreso();
    actualizarContadoresFiltro();
});

function cancelarEdicion() {
    taskEditandoId = null;
    document.querySelector('#btnAgregarTarea').textContent = 'Agregar tarea';
    btnCancelarEdicion.classList.add('d-none');
    formCard.classList.remove('form-editing');
    formulario.reset();
    configurarFecha();
}

btnCancelarEdicion.addEventListener('click', cancelarEdicion);

function actualizarProgreso() {
    const stats = taskManager.getStats();
    const porcentaje = stats.total === 0 ? 0 : Math.round((stats.completadas / stats.total) * 100);
    document.querySelector('#progressText').textContent = `${stats.completadas} de ${stats.total} completadas`;
    document.querySelector('#progressPercent').textContent = `${porcentaje}%`;
    document.querySelector('#progressFill').style.width = `${porcentaje}%`;
}

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

function actualizarReloj() {
    const ahora = new Date();
    const opcionesFecha = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

    document.getElementById('fechaActual').textContent = ahora.toLocaleDateString('es-CO', opcionesFecha);
    document.getElementById('horaActual').textContent = ahora.toLocaleTimeString('es-CO', opcionesHora);
}

actualizarReloj();
setInterval(actualizarReloj, 1000);

/* =============================================
   MINI CALENDARIO
   ============================================= */
let calendarDate = new Date();

function renderMiniCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    document.getElementById('calendarTitle').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const taskDates = {};
    taskManager.tasks.forEach(task => {
        if (task.fecha) {
            if (!taskDates[task.fecha]) taskDates[task.fecha] = 0;
            taskDates[task.fecha]++;
        }
    });

    let html = '';

    for (let i = 0; i < startDay; i++) {
        html += '<div class="mini-calendar__day mini-calendar__day--empty"></div>';
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const hasTask = taskDates[dateStr];
        const isSelected = dateStr === filtroFecha;

        let classes = 'mini-calendar__day';
        if (isToday) classes += ' mini-calendar__day--today';
        if (hasTask) classes += ' mini-calendar__day--has-task';
        if (isSelected) classes += ' mini-calendar__day--selected';

        const tooltip = hasTask ? `title="${hasTask} tarea(s) — Click para filtrar"` : 'title="Click para filtrar"';

        html += `<div class="${classes}" data-date="${dateStr}" ${tooltip}>${day}</div>`;
    }

    document.getElementById('calendarDays').innerHTML = html;

    document.querySelectorAll('.mini-calendar__day[data-date]').forEach(dayEl => {
        dayEl.addEventListener('click', function () {
            const date = this.dataset.date;
            if (filtroFecha === date) {
                filtroFecha = null;
            } else {
                filtroFecha = date;
            }
            taskManager.render(filtroActual, categoriaActual, filtroFecha);
            renderMiniCalendar();
        });
    });

    const filterInfo = document.getElementById('calendarFilterInfo');
    if (filtroFecha) {
        filterInfo.textContent = `Filtrando: ${filtroFecha} — Click para limpiar`;
        filterInfo.classList.remove('d-none');
        filterInfo.onclick = function () {
            filtroFecha = null;
            taskManager.render(filtroActual, categoriaActual, filtroFecha);
            renderMiniCalendar();
        };
    } else {
        filterInfo.classList.add('d-none');
        filterInfo.onclick = null;
    }
}

document.getElementById('calendarPrev').addEventListener('click', function () {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderMiniCalendar();
});

document.getElementById('calendarNext').addEventListener('click', function () {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderMiniCalendar();
});

renderMiniCalendar();

/* =============================================
   EMAIL RECOVERY
   ============================================= */
document.getElementById('btnLinkEmail').addEventListener('click', async () => {
    const { value: email } = await Swal.fire({
        title: 'Vincular email',
        input: 'email',
        inputLabel: 'Tu email para recuperar tareas',
        inputPlaceholder: 'ejemplo@correo.com',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Vincular'
    });

    if (email) {
        const resultado = await taskManager.registerEmail(email);
        if (resultado) {
            Swal.fire('Email vinculado', 'Podrás recuperar tus tareas con este email', 'success');
        } else {
            Swal.fire('Error', 'No se pudo vincular el email. Verifica que el servidor esté corriendo.', 'error');
        }
    }
});

document.getElementById('btnRecoverTasks').addEventListener('click', async () => {
    const { value: email } = await Swal.fire({
        title: 'Recuperar tareas',
        input: 'email',
        inputLabel: 'Ingresa tu email registrado',
        inputPlaceholder: 'ejemplo@correo.com',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Enviar código'
    });

    if (!email) return;

    const enviado = await taskManager.sendRecoveryCode(email);
    if (!enviado) {
        Swal.fire('Error', 'No se pudo enviar el código. Verifica tu email.', 'error');
        return;
    }

    const { value: code } = await Swal.fire({
        title: 'Código de verificación',
        input: 'text',
        inputLabel: 'Revisa tu email e ingresa el código',
        inputPlaceholder: '123456',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Verificar'
    });

    if (!code) return;

    const deviceId = await taskManager.verifyRecoveryCode(email, code);
    if (deviceId) {
        await taskManager.load();
        taskManager.render(filtroActual, categoriaActual, filtroFecha);
        renderMiniCalendar();
        actualizarProgreso();
        actualizarContadoresFiltro();
        Swal.fire('Tareas recuperadas', 'Tus tareas han sido restauradas correctamente', 'success');
    } else {
        Swal.fire('Error', 'Código incorrecto o expirado', 'error');
    }
});
