const tasks = [];

exports.addTasks = (newTasks) => {
    tasks.push(...newTasks);
};

exports.getTasks = () => tasks;

exports.updateTaskStatus = (id, status) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = status;
        task.updatedAt = new Date();
    }
};