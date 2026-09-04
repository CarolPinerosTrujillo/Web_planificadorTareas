const formulario = document.querySelector("#formularioTareas");


// ELEMENTOS
const nombreTarea = document.querySelector('#nombreTarea');
const descripcionTarea = document.querySelector('#descripcionTarea');
const categoriaTarea = document.querySelector('#categoriaTarea');
const fechaTarea = document.querySelector('#fechaTarea');
const horaTarea = document.querySelector('#horaTarea');
const prioridadTarea = document.querySelector('#prioridadTarea');
const mensajeError = document.querySelector("#mensajeError");
//const btn = document.querySelector("#btnAgregarTarea");

//ubicacion de las tareas 
const listaTareas = document.querySelector("#listaTareas");

//LISTADOS SECCIONADOS TIPOS DE TAREAS
const listaPorHacer = document.querySelector("#listaPorHacer");
const listaProceso = document.querySelector("#listaProceso");
const listaTerminadas = document.querySelector("#listaTerminadas");
const botonesFiltro = document.querySelectorAll(".filtro");

//SPRINT 2 TAREA 4-5
const taskManager = new TaskManager();
taskManager.load();

let filtroActual = "TODAS";

// Configura el input fecha
configurarFecha();
render();

// Implementación de la validación
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

// CLICK FORMULARIO 
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

    console.log("Datos del formulario:", data);

    if (!validFormFieldInput(data)) {
        mensajeError.classList.remove("d-none");

        Swal.fire({
            icon: 'error',
            title: 'Datos inválidos',
            text: 'Por favor completa todos los campos: Nombre, Descripción, Categoría, Fecha, Hora, y Prioridad de la tarea.'
        });
        return;
    }

    //VALIDACION DE FECHA 
    const fechaSeleccionada = data.fecha;
    const hoy = new Date().toISOString().split("T")[0];
    const fechaMaxima = "2100-12-31";

    if (fechaSeleccionada < hoy || fechaSeleccionada > fechaMaxima) {
        mensajeError.classList.remove("d-none");
        Swal.fire({
            icon: "error",
            title: "Fecha inválida",
            text: "La fecha debe estar entre hoy y el 31 de diciembre de 2100."
        });
        return;
    }

    // *Si todo está correcto, ocultar mensaje de error*
    mensajeError.classList.add("d-none");


    // Registrar la tarea
    taskManager.addTask(
        data.nombre,
        data.descripcion,
        data.categoria,
        data.fecha,
        data.hora,
        data.prioridad
    );

    taskManager.save();
    render();

    // prueba Mostrar tareas en consola
    console.log("Tareas registradas:", taskManager.tasks);

    // *Mensaje de éxito*
    Swal.fire({
        icon: "success",
        title: "Tarea agregada con éxito",
        text: "La tarea fue registrada correctamente."

    }).then(() => {
        // Limpiar formulario
        formulario.reset();
        // Volver a configurar fecha mínima
        configurarFecha();

    });

});



function configurarFecha() {

    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];
    fechaTarea.min = fechaHoy;
    fechaTarea.max = "2100-12-31";
}



//sprint 2 tarea 4 BOTON COMPLETAR TAREA - ELIMINAR TAREA (tarea 6)
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
        render();
    }

    if (botonEliminar) {
        const tarjeta = botonEliminar.closest(".task-card");
        const taskId = Number(tarjeta.dataset.taskId);

        taskManager.deleteTask(taskId);
        taskManager.save();
        render();

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

        render();
    });
});


function createTaskHtml(task){

const estadoConfig={
PORHACER:{
texto:"Por hacer",
boton:"Iniciar",
clase:"estado-pendiente",
icono:"○"
},
ENPROCESO:{
texto:"En proceso",
boton:"Completar",
clase:"estado-proceso",
icono:"◐"
},
COMPLETADA:{
texto:"Completada",
boton:"Reabrir",
clase:"estado-terminado",
icono:"✓"
}
};

const estado=estadoConfig[task.status]||estadoConfig.PORHACER;
const categoriaClass=task.categoria.toLowerCase();

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


function render() {
    listaPorHacer.innerHTML = "";
    listaProceso.innerHTML = "";
    listaTerminadas.innerHTML = "";

    const tareasFiltradas = taskManager.tasks.filter(function (task) {

        if (filtroActual === "TODAS") {
            return true;
        }

        return task.status === filtroActual;
    });

    for (let task of tareasFiltradas) {
       
        const html = createTaskHtml(task);

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




// //PRUEBA AGREGAR TAREA
// taskManager.addTask(
//   'Sacar la basura',
//   'Sacar la basura al frente de la casa',
//   '2020-09-20',
//   'PORHACER'
// );

// console.log(taskManager.tasks);
