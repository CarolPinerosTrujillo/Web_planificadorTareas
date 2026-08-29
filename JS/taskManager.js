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