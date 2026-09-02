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


//SPRINT 2 TAREA 4-5
const taskManager = new TaskManager();
taskManager.load();
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

  if (nombre === '' || descripcion === '' || categoria === '' || fecha === '' || hora === '' || prioridad === '' ) { return false; }
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
const botonesEstado = document.querySelectorAll(".btnEstado");

listaTareas.addEventListener("click", function (event) {
if(event.target.classList.contains("btnEstado")){
 const tarjeta = event.target.closest(".task-card");
        tarjeta.classList.toggle("tarea-completada");
        if (tarjeta.classList.contains("tarea-completada")) {
          event.target.textContent="Pendiente";
        } else {
           event.target.textContent="Completar";
        }
}

if(event.target.classList.contains("delete-button")){
        const parentTask=event.target.parentElement;
        const taskId=Number(parentTask.dataset.taskId);
        taskManager.deleteTask(taskId);
        taskManager.save();
        render();

    }

});


function createTaskHtml(task){
return`
<div class="card task-card estado-pendiente" data-task-id="${task.id}>
    <div class="card-body">
    <h6 class="tituloTarea">${task.nombre}</h6>
    <p>${task.descripcion}</p>
    <p>${task.fecha} • ${task.hora}</p>
    <span class="badge categoria categoria-${task.categoria.toLowerCase()}">
        ${task.categoria}
    </span>
    <div class="mt-3 d-flex gap-2">
    <button class="btn btn-outline-light btnEstado">Completar</button>
    <button class="delete-button btn btn-danger">Eliminar</button>
    </div>
    </div>
</div>

`;

}


function render(){
    listaTareas.innerHTML="";
    for(let task of taskManager.tasks){
        listaTareas.innerHTML+=createTaskHtml(task);
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
