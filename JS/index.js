// inicio en construcción
const formulario = document.querySelector("#formularioTareas");

//SPRINT 2 TAREA 4-5
const taskManager = new TaskManager();

// ELEMENTOS
const nombreTarea = document.querySelector('#nombreTarea');
const descripcionTarea = document.querySelector('#descripcionTarea');
const categoriaTarea = document.querySelector('#categoriaTarea');
const fechaTarea = document.querySelector('#fechaTarea');
const horaTarea = document.querySelector('#horaTarea');
const prioridadTarea = document.querySelector('#prioridadTarea');
const estadoTarea = document.querySelector('#estadoTarea');
const mensajeError = document.querySelector("#mensajeError");

const btn = document.querySelector("#btnAgregarTarea");

// Configura el input fecha
configurarFecha();

// Implementación de la validación
function validFormFieldInput(data) {

  const nombre = data.nombre.trim();
  const descripcion = data.descripcion.trim();
  const categoria = data.categoria.trim();
  const fecha = data.fecha.trim();
  const hora = data.hora.trim();
  const prioridad = data.prioridad.trim();
  const estado = data.estado.trim();


  if (nombre === '' || descripcion === '' || categoria === '' || fecha === '' || hora === '' || prioridad === '' || estado === '') { return false; }
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
  const estado = estadoTarea.value;

  const data = {
    nombre,
    descripcion,
    categoria,
    fecha,
    hora,
    prioridad,
    estado
  };

  console.log("Datos del formulario:", data);

   if (!validFormFieldInput(data)) {
    mensajeError.classList.remove("d-none");

    Swal.fire({
      icon: 'error',
      title: 'Datos inválidos',
      text: 'Por favor completa todos los campos: Nombre, Descripción, Categoría, Fecha, Hora, Prioridad y Estado.'
    });
    return;
  }

  //VALIDACION DE FECHA 
  const fechaSeleccionada = data.fecha;
  const hoy = new Date().toISOString().split("T")[0];
  const fechaMaxima = "2100-12-31";

 if (fechaSeleccionada <= hoy || fechaSeleccionada > fechaMaxima) {
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



  //SPRINT 2 TAREA 5 - ESTADO INICIAL
  const status = 'PORHACER';

 // Registrar la tarea
    taskManager.addTask(
        nombre,
        descripcion,
        fecha,
        status
    );

    // Mostrar tareas en consola
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


// //PRUEBA AGREGAR TAREA 
// taskManager.addTask(
//   'Sacar la basura',
//   'Sacar la basura al frente de la casa',
//   '2020-09-20',
//   'PORHACER'
// );

// console.log(taskManager.tasks);
