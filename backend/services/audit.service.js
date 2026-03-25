const logs = [];

module.exports = (data) => {
    logs.push({
        ...data,
        timestamp: new Date()
    });

    console.log("Audit Log:", data.file);
};

exports.addLog = (entry) => {
    console.log("AUDIT LOG:", {
        ...entry,
        timestamp: new Date()
    });
};