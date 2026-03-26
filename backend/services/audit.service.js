const logs = [];

const addLog = (entry) => {
    logs.push({
        ...entry,
        timestamp: new Date()
    });

    console.log("AUDIT LOG:", {
        ...entry,
        timestamp: new Date()
    });
};

module.exports = { addLog };