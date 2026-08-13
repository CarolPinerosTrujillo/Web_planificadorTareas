// inicio en construcción
const formulario = document.querySelector("#formularioTareas");

// ELEMENTOS

const btn = document.querySelector("#btnAgregarTarea");


function validFormFieldInput(data) {
  // Implementación de la validación
    const nombre = data.nombre.trim();
    const descripcion = data.descripcion.trim();
    const categoria = data.categoria.trim();
    const fecha = data.fecha.trim();
    const prioridad = data.prioridad.trim();
    const estado = data.estado.trim();

   if (nombre === '' || descripcion === '' || categoria === '' || fecha === '' || prioridad === '' || estado === '') {
        return false;
    }
    return true;
}

formulario.addEventListener('submit', function (event) {
    event.preventDefault();

    const nombreTarea = document.querySelector('#nombreTarea');
    const descripcionTarea = document.querySelector('#descripcionTarea');
    const categoriaTarea = document.querySelector('#categoriaTarea');
    const fechaTarea = document.querySelector('#fechaTarea');
    const prioridadTarea = document.querySelector('#prioridadTarea');
    const estadoTarea = document.querySelector('#estadoTarea');

    const nombre = nombreTarea.value;
    const descripcion = descripcionTarea.value;
    const categoria = categoriaTarea.value;
    const fecha = fechaTarea.value;
    const prioridad = prioridadTarea.value;
    const estado = estadoTarea.value;

    console.log({
        nombre: nombre,
        descripcion: descripcion,
        categoria: categoria,
        fecha: fecha,
        prioridad: prioridad,
        estado: estado
    });

    const data = { nombre, descripcion, categoria, fecha, prioridad, estado };

    if (!validFormFieldInput(data)) {
        Swal.fire({
            icon: 'error',
            title: 'Datos inválidos',
            text: 'Por favor completa todos los campos: Nombre, Descripción, Categoría, Fecha, Prioridad y Estado.'
        });
        return;
    }

    Swal.close();
});