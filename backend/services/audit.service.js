const logs = [];

module.exports = (data) => {
    logs.push({
        ...data,
        timestamp: new Date()
    });

    console.log("Audit Log:", data.file);
};