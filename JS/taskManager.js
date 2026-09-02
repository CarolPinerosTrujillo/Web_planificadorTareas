class TaskManager {
    constructor(currentId=0) {
        this.tasks = [];
        this.currentId = currentId;
    }

    addTask(nombre, descripcion, categoria, fecha, hora, prioridad) {
        // aumento el ID antes de crear la tarea
        this.currentId++;
        // creacion y guardado de la tarea
        this.tasks.push({
            id: this.currentId,
            nombre: nombre,
            descripcion: descripcion,
            fecha: fecha,
            hora: hora,
            prioridad: prioridad,
            categoria: categoria,
            estado: 'PORHACER'
        });
    }


    deleteTask(taskId) {
        const newTasks = [];
        for (let task of this.tasks) {
            if (task.id !== taskId) {
                    newTasks.push(task);
                }
        }
            this.tasks = newTasks;
    }

    save(){
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    load() {    
        const tareas = JSON.parse(localStorage.getItem("tasks"));
        if (tareas) {
            this.tasks = tareas;
            this.currentId = tareas[tareas.length - 1]?.id || 0;
        }
    }

}


