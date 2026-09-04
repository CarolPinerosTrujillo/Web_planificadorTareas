class TaskManager {
    constructor(currentId = 0) {
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
            status: 'PORHACER'
        });
    }

    getTaskById(taskId) {
        let foundTask;
        for (let task of this.tasks) {
            if (task.id === taskId) {
                foundTask = task;
                break;
            }
        }
        return foundTask;
    }

    //SOLUCION V2
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    //SOLUCION V1
    deleteTask(taskId) {
        const newTasks = [];
        for (let task of this.tasks) {
            if (task.id !== taskId) {
                newTasks.push(task);
            }
        }
        this.tasks = newTasks;
    }

    save() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    load() {
        const tareas = JSON.parse(localStorage.getItem("tasks"));
        if (tareas) {
            this.tasks = tareas.map(task => ({...task,status: task.status || task.estado || "PORHACER" }));
            this.tasks.forEach(task => { if (task.status === "DONE") task.status = "COMPLETADA"; });
            this.currentId = this.tasks.reduce((max, task) => Math.max(max, task.id), 0);
        }
    }


}


