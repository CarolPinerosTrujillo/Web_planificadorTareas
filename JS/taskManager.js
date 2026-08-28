class TaskManager {
    constructor() {
        this.tasks = [];
    }
}

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