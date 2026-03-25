const tasks = [];

exports.addTasks = (newTasks) => {
    tasks.push(...newTasks);
};

exports.getTasks = () => tasks;

exports.updateTaskStatus = (id, status) => {
    if (tasks[id]) tasks[id].status = status;
};