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

/**
 * Get task by ID
 */
exports.getTaskById = (id) => {
    return tasks.find(t => t.id === id);
};

/**
 * Get tasks by status
 */
exports.getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
};

/**
 * Clear all tasks
 */
exports.clearTasks = () => {
    tasks.length = 0;
};

/**
 * Get task statistics
 */
exports.getTaskStats = () => {
    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'PENDING').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        fixed: tasks.filter(t => t.status === 'FIXED').length,
        verified: tasks.filter(t => t.status === 'VERIFIED').length,
        failed: tasks.filter(t => t.status === 'FAILED').length,
        committed: tasks.filter(t => t.status === 'COMMITTED').length
    };
    return stats;
};