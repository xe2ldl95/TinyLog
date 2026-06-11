export function getLogs() {
    return JSON.parse(localStorage.getItem('logs') || '[]');
}

export function saveLogs(logs) {
    localStorage.setItem('logs', JSON.stringify(logs));
}

export function getCurrentLog() {
    return JSON.parse(localStorage.getItem('currentLog') || 'null');
}

export function setCurrentLog(log) {
    localStorage.setItem('currentLog', JSON.stringify(log));
}

export function getAllQSOs() {
    const logs = getLogs();
    const result = [];
    logs.forEach(log => {
        (log.qsos || []).forEach(qso => {
            result.push({ qso, log });
        });
    });
    result.sort((a, b) => new Date(b.qso.datetime) - new Date(a.qso.datetime));
    return result;
}

export function deleteLogById(id) {
    const logs = getLogs();
    const filtered = logs.filter(l => l.id !== id);
    saveLogs(filtered);
}

export function updateLog(updatedLog) {
    const logs = getLogs();
    const index = logs.findIndex(l => l.id === updatedLog.id);
    if (index !== -1) {
        logs[index] = updatedLog;
        saveLogs(logs);
    }
    return logs;
}

export function getEditingQsoIndex() {
    return parseInt(localStorage.getItem('editingQsoIndex'));
}

export function setEditingQsoIndex(idx) {
    localStorage.setItem('editingQsoIndex', idx);
}
