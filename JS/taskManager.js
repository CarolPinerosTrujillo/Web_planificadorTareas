class TaskManager {
    constructor(currentId=0) {
        this.tasks = [];
        this.currentId = currentId;
    }

    addTask(name, description, dueDate, status) {

        // aumento el ID antes de crear la tarea
        this.currentId++;

        // creacion y guardado de la tarea
        this.tasks.push({
            id: this.currentId,
            name: name,
            description: description,
            dueDate: dueDate,
            status: 'PORHACER'
        });
    }
}


//sprint 2 tarea 4
const botonesEstado = document.querySelectorAll(".btnEstado");

botonesEstado.forEach(function (boton) {
    boton.addEventListener("click", function () {
        const tarjeta = boton.closest(".task-card");
        tarjeta.classList.toggle("tarea-completada");
        if (tarjeta.classList.contains("tarea-completada")) {
            boton.textContent = "Pendiente";
        } else {
            boton.textContent = "Completar";
        }
    });
});


function createTaskHtml(task){
return`
<div class="card task-card estado-pendiente">
    <div class="card-body">
    <h6 class="tituloTarea">${task.nombre}</h6>
    <p>${task.descripcion}</p>
    <p>${task.fecha} • ${task.hora}</p>
    <span class="badge categoria categoria-estudio">${task.categoria}</span>
    <button class="btn btn-outline-light btnEstado">Completar</button>
    <button class="delete-button btn btn-danger">Eliminar</button>
    </div>
</div>

`;

}




function deleteTask(taskId) { 
    const newTasks = []; 
    for (let task of this.tasks) { if (task.id !== taskId) { newTasks.push(task); } } this.tasks = newTasks; }