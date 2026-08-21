// inicio en construcción
const formulario = document.querySelector("#formularioTareas");

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

  if (nombre === '' || descripcion === '' || categoria === '' || fecha === '' || hora === '' || prioridad === '' || estado === '') {
    return false;
  }
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

  console.log(data);




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


  
  mensajeError.classList.add("d-none");
  Swal.fire({
    icon: "success",
    title: "Tarea agregada con éxito",
    text: "La tarea fue registrada correctamente."
  }).then(() => {
    formulario.reset();
  });
});


function configurarFecha() {

    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];

    fechaTarea.min = fechaHoy;

    fechaTarea.max = "2100-12-31";

}