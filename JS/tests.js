function ejecutarPruebas() {
    localStorage.clear();

    let testsPassed = 0;
    let testsFailed = 0;

    function assert(condition, testName) {
        if (condition) {
            console.log(`✅ ${testName}`);
            testsPassed++;
        } else {
            console.error(`❌ ${testName}`);
            testsFailed++;
        }
    }

    console.log('\n--- PRUEBAS: addTask ---');
    function testAddTask() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Descripción', 'Casa', '2026-09-10', '14:00', 'Media');
        assert(tm.tasks.length === 1, 'addTask: debería crear 1 tarea');
        assert(tm.tasks[0].nombre === 'Tarea 1', 'addTask: nombre correcto');
        assert(tm.tasks[0].descripcion === 'Descripción', 'addTask: descripción correcta');
        assert(tm.tasks[0].categoria === 'Casa', 'addTask: categoría correcta');
        assert(tm.tasks[0].fecha === '2026-09-10', 'addTask: fecha correcta');
        assert(tm.tasks[0].hora === '14:00', 'addTask: hora correcta');
        assert(tm.tasks[0].prioridad === 'Media', 'addTask: prioridad correcta');
        assert(tm.tasks[0].status === 'PORHACER', 'addTask: estado inicial PORHACER');
        assert(tm.currentId === 1, 'addTask: currentId incrementado a 1');
    }
    testAddTask();

    function testAddMultipleTasks() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Desc1', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.addTask('Tarea 2', 'Desc2', 'Trabajo', '2026-09-11', '15:00', 'Alta');
        assert(tm.tasks.length === 2, 'addTask múltiples: debería crear 2 tareas');
        assert(tm.currentId === 2, 'addTask múltiples: currentId debería ser 2');
    }
    testAddMultipleTasks();

    console.log('\n--- PRUEBAS: getTaskById ---');
    function testGetTaskById() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        const task = tm.getTaskById(1);
        assert(task !== undefined, 'getTaskById: debería encontrar tarea con id 1');
        assert(task.nombre === 'Tarea 1', 'getTaskById: nombre correcto');
        const noExiste = tm.getTaskById(999);
        assert(noExiste === undefined, 'getTaskById: debería retornar undefined para id inexistente');
    }
    testGetTaskById();

    console.log('\n--- PRUEBAS: deleteTask ---');
    function testDeleteTask() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Desc1', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.addTask('Tarea 2', 'Desc2', 'Trabajo', '2026-09-11', '15:00', 'Alta');
        tm.deleteTask(1);
        assert(tm.tasks.length === 1, 'deleteTask: debería quedar 1 tarea');
        assert(tm.tasks[0].id === 2, 'deleteTask: la tarea restante debería ser id 2');
    }
    testDeleteTask();

    function testDeleteLastTask() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.deleteTask(1);
        assert(tm.tasks.length === 0, 'deleteTask última: debería quedar 0 tareas');
    }
    testDeleteLastTask();

    console.log('\n--- PRUEBAS: editTask ---');
    function testEditTask() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.editTask(1, { nombre: 'Nuevo nombre', descripcion: 'Nueva descripción', categoria: 'Trabajo', fecha: '2026-09-15', hora: '16:30', prioridad: 'Alta' });
        assert(tm.tasks[0].nombre === 'Nuevo nombre', 'editTask: nombre actualizado');
        assert(tm.tasks[0].descripcion === 'Nueva descripción', 'editTask: descripción actualizada');
        assert(tm.tasks[0].categoria === 'Trabajo', 'editTask: categoría actualizada');
        assert(tm.tasks[0].fecha === '2026-09-15', 'editTask: fecha actualizada');
        assert(tm.tasks[0].hora === '16:30', 'editTask: hora actualizada');
        assert(tm.tasks[0].prioridad === 'Alta', 'editTask: prioridad actualizada');
    }
    testEditTask();

    function testEditTaskInexistent() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.editTask(999, { nombre: 'X', descripcion: 'X', categoria: 'X', fecha: 'X', hora: 'X', prioridad: 'X' });
        assert(tm.tasks[0].nombre === 'Tarea 1', 'editTask inexistente: tarea original no modificada');
    }
    testEditTaskInexistent();

    console.log('\n--- PRUEBAS: Assign Status ---');
    function testAssignStatus() {
        const tm = new TaskManager();
        tm.addTask('Tarea 1', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        assert(tm.tasks[0].status === 'PORHACER', 'AssignStatus: estado inicial PORHACER');
        tm.tasks[0].status = 'ENPROCESO';
        assert(tm.tasks[0].status === 'ENPROCESO', 'AssignStatus: cambio a ENPROCESO');
        tm.tasks[0].status = 'COMPLETADA';
        assert(tm.tasks[0].status === 'COMPLETADA', 'AssignStatus: cambio a COMPLETADA');
        tm.tasks[0].status = 'PORHACER';
        assert(tm.tasks[0].status === 'PORHACER', 'AssignStatus: cambio de vuelta a PORHACER');
    }
    testAssignStatus();

    console.log('\n--- PRUEBAS: save/load (localStorage) ---');
    function testSaveAndLoad() {
        const tm1 = new TaskManager();
        tm1.addTask('Tarea Guardar', 'Desc', 'Estudio', '2026-09-20', '10:00', 'Alta');
        tm1.save();
        const tm2 = new TaskManager();
        tm2.load();
        assert(tm2.tasks.length === 1, 'save/load: debería recuperar 1 tarea');
        assert(tm2.tasks[0].nombre === 'Tarea Guardar', 'save/load: nombre correcto');
        assert(tm2.currentId === 1, 'save/load: currentId correcto');
    }
    testSaveAndLoad();

    function testLoadEmpty() {
        localStorage.clear();
        const tm = new TaskManager();
        tm.load();
        assert(tm.tasks.length === 0, 'load vacío: no debería haber tareas');
        assert(tm.currentId === 0, 'load vacío: currentId debería ser 0');
    }
    testLoadEmpty();

    console.log('\n--- PRUEBAS UI ---');
    function testAddTaskUI() {
        const tm = new TaskManager();
        tm.addTask('Test UI', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.render();
        const tareaEnDOM = document.querySelector('[data-task-id]');
        assert(tareaEnDOM !== null, 'UI addTask: la tarea debería existir en el DOM');
    }
    testAddTaskUI();

    function testDeleteTaskUI() {
        const tm = new TaskManager();
        tm.addTask('Test Delete', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.render();
        const id = tm.tasks[0].id;
        const tareaAntes = document.querySelector(`[data-task-id="${id}"]`);
        assert(tareaAntes !== null, 'UI deleteTask antes: tarea existe en DOM');
        tm.deleteTask(id);
        tm.render();
        const tareaDespues = document.querySelector(`[data-task-id="${id}"]`);
        assert(tareaDespues === null, 'UI deleteTask después: tarea eliminada del DOM');
    }
    testDeleteTaskUI();

    function testEditTaskUI() {
        const tm = new TaskManager();
        tm.addTask('Test Edit', 'Desc', 'Casa', '2026-09-10', '14:00', 'Media');
        tm.render();
        const id = tm.tasks[0].id;
        tm.editTask(id, { nombre: 'Editado', descripcion: 'Desc editada', categoria: 'Trabajo', fecha: '2026-09-15', hora: '16:00', prioridad: 'Alta' });
        tm.render();
        const titulo = document.querySelector(`[data-task-id="${id}"] .tituloTarea`);
        assert(titulo !== null && titulo.textContent === 'Editado', 'UI editTask: título actualizado en DOM');
    }
    testEditTaskUI();

    console.log('\n=================================');
    console.log(`✅ Pruebas pasaron: ${testsPassed}`);
    console.log(`❌ Pruebas fallaron: ${testsFailed}`);
    console.log('=================================');

    localStorage.clear();

    Swal.fire({
        icon: testsFailed > 0 ? 'warning' : 'success',
        title: testsFailed > 0 ? 'Pruebas con errores' : 'Todas las pruebas pasaron',
        html: `<b>${testsPassed}</b> pasaron, <b>${testsFailed}</b> fallaron`,
        confirmButtonText: 'Cerrar'
    }).then(() => {
        taskManager.load();
        taskManager.render();
    });
}
