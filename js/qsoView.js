import { showNotification, toggleSatelliteAndPropagationOptions, toggleEditSatelliteAndPropagationOptions } from './ui.js';
import { getLogs, saveLogs, getCurrentLog, setCurrentLog, getAllQSOs, deleteLogById, updateLog, getEditingQsoIndex, setEditingQsoIndex } from './storage.js';
import { generateADIF, generateADIFFromItems, parseADIF } from './adif.js';
import { settings } from './settings.js';

export function displayLogs() {
    const logs = getLogs();
    logs.sort((a, b) => b.id - a.id);
    const logsList = document.getElementById('logs-list');
    const noLogs = document.getElementById('no-logs');

    logsList.innerHTML = '';
    if (logs.length === 0) {
        noLogs.style.display = 'block';
        return;
    }
    noLogs.style.display = 'none';

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        const dateStr = log.filename.split('_')[0];
        const formattedDate = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
        item.innerHTML = `
            <div class="log-meta">${formattedDate}</div>
            <div class="log-title">${log.callsign} • ${log.activationType}</div>
            <div class="log-details">${log.location}${log.locator ? ` • ${log.locator}` : ''}</div>
            <div class="action-buttons">
                <button class="btn-secondary" onclick="openLog(${log.id}, 'edit')">
                    <i class="fas fa-edit"></i> Abrir
                </button>
                <button class="btn-success" onclick="downloadLog(${log.id})">
                    <i class="fas fa-download"></i> ADIF
                </button>
                <button class="btn-danger" onclick="deleteLog(${log.id})">
                    <i class="fas fa-trash"></i> Borrar
                </button>
            </div>
        `;
        logsList.appendChild(item);
    });
}

export function checkEmptyLogs() {
    const logs = getLogs();
    const noLogs = document.getElementById('no-logs');
    if (noLogs && logs.length === 0) {
        noLogs.style.display = 'block';
    }
}

export function openLog(id, mode = 'edit') {
    const logs = getLogs();
    const log = logs.find(l => l.id === id);
    if (!log) return;

    setCurrentLog(log);
    displayLogDetails(log);
    document.getElementById('log-title').textContent = `Log: ${log.callsign}`;

    if (mode === 'edit') {
        displayQSOsForEdit();
    }
    window.showScreen('log-view');
}

export function displayLogDetails(log) {
    const details = document.getElementById('log-details');
    details.innerHTML = `
        <p><strong>Indicativo:</strong> ${log.callsign}</p>
        <p><strong>Tipo:</strong> ${log.activationType}</p>
        ${log.llotaRef ? `<p><strong>Ref LLOTA:</strong> ${log.llotaRef}</p>` : ''}
        <p><strong>Ubicación:</strong> ${log.location}</p>
        ${log.locator ? `<p><strong>Locator:</strong> ${log.locator}</p>` : ''}
        ${log.comments ? `<p><strong>Comentarios:</strong> ${log.comments}</p>` : ''}
        <p><strong>QSOs:</strong> ${log.qsos.length}</p>
    `;
}

function formatQsoMode(qso) {
    if (qso.submode) {
        return `${qso.mode} (${qso.submode})`;
    }
    if (qso.mode === 'USB' || qso.mode === 'LSB') {
        return `SSB (${qso.mode})`;
    }
    return qso.mode;
}

function formatQsoDatetime(qso) {
    const date = new Date(qso.datetime);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { year: '2-digit', month: '2-digit', day: '2-digit' });
    return { dateStr, timeStr };
}

function createQsoItemHtml(qso, log, opts = {}) {
    const { dateStr, timeStr } = formatQsoDatetime(qso);
    const modeDisplay = formatQsoMode(qso);
    let html = `
        <div class="qso-meta">${dateStr} ${timeStr} • ${modeDisplay}</div>
        <div class="qso-title">${qso.dxCall} • ${qso.frequency} MHz</div>
        <div class="qso-details">
            RST: ${qso.rstSent}/${qso.rstRcvd}
            ${qso.gridsquare ? ` • ${qso.gridsquare}` : ''}
            ${qso.satellite ? ` • SAT: ${qso.satellite}` : ''}
            ${qso.propagationMode && qso.propagationMode !== 'SAT' ? ` • PROP: ${qso.propagationMode}` : ''}
    `;
    if (opts.showLogInfo) {
        html += `<br><span style="color:var(--text-muted);font-size:0.8rem;">
                    <i class="fas fa-file-alt"></i> ${log.callsign} • ${log.activationType} • ${log.location}
                </span>`;
    }
    html += `</div>`;
    if (opts.showActions) {
        html += `
            <div class="action-buttons">
                <button class="btn-secondary" onclick="openEditQsoById(${qso.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-danger" onclick="deleteQsoById(${qso.id})">
                    <i class="fas fa-trash"></i> Borrar
                </button>
            </div>`;
    }
    return html;
}

export function displayQSOsForEdit() {
    const log = getCurrentLog();
    const qsoList = document.getElementById('qso-list');
    const noQsos = document.getElementById('no-qsos');

    qsoList.innerHTML = '';
    if (!log || !log.qsos || log.qsos.length === 0) {
        noQsos.style.display = 'block';
        return;
    }
    noQsos.style.display = 'none';

    log.qsos.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    log.qsos.forEach(qso => {
        const item = document.createElement('div');
        item.className = 'qso-item';
        item.innerHTML = createQsoItemHtml(qso, log, { showActions: true });
        qsoList.appendChild(item);
    });
}

export function openEditQsoById(id) {
    const log = getCurrentLog();
    const qso = log.qsos.find(q => q.id === id);
    if (!qso) return;

    const index = log.qsos.indexOf(qso);
    setEditingQsoIndex(index);

    document.getElementById('edit-qso-datetime').value = qso.datetime;
    document.getElementById('edit-qso-dxcall').value = qso.dxCall;
    document.getElementById('edit-qso-rstsent').value = qso.rstSent;
    document.getElementById('edit-qso-rstrcvd').value = qso.rstRcvd;
    document.getElementById('edit-qso-gridsquare').value = qso.gridsquare || '';
    document.getElementById('edit-qso-freq').value = qso.frequency;

    if (qso.mode === 'USB' || qso.mode === 'LSB') {
        document.getElementById('edit-qso-mode').value = 'SSB';
        document.getElementById('edit-ssb-submode-select').value = qso.mode;
    } else {
        document.getElementById('edit-qso-mode').value = qso.mode;
        if (qso.mode === 'SSB' && qso.submode) {
            document.getElementById('edit-ssb-submode-select').value = qso.submode;
        }
    }

    toggleEditSatelliteAndPropagationOptions();

    if (qso.mode === 'SAT') {
        const satSelect = document.getElementById('edit-satellite');
        const satOther = document.getElementById('edit-satellite-other');
        if (['AO-91','AO-92','SO-50','FO-118','CAS-6','LUSAT','PO-101','ISS'].includes(qso.satellite)) {
            satSelect.value = qso.satellite;
            satOther.style.display = 'none';
        } else if (qso.satellite) {
            satSelect.value = 'other';
            satOther.value = qso.satellite;
            satOther.style.display = 'block';
        }
    }

    if (settings.showPropagation && qso.propagationMode) {
        document.getElementById('edit-qso-prop').value = qso.propagationMode;
    }

    window.showScreen('edit-qso');
}

export function saveCurrentQso() {
    const index = getEditingQsoIndex();
    const log = getCurrentLog();
    if (!log || !log.qsos[index]) return;

    const qso = log.qsos[index];
    qso.datetime = document.getElementById('edit-qso-datetime').value;
    qso.dxCall = document.getElementById('edit-qso-dxcall').value.trim().toUpperCase();
    qso.rstSent = document.getElementById('edit-qso-rstsent').value.trim();
    qso.rstRcvd = document.getElementById('edit-qso-rstrcvd').value.trim();
    qso.gridsquare = document.getElementById('edit-qso-gridsquare').value.trim().toUpperCase();
    qso.frequency = document.getElementById('edit-qso-freq').value.trim();
    qso.mode = document.getElementById('edit-qso-mode').value;

    if (qso.mode === 'SAT') {
        const satSelect = document.getElementById('edit-satellite').value;
        qso.satellite = satSelect === 'other' ? document.getElementById('edit-satellite-other').value.trim().toUpperCase() : satSelect.toUpperCase();
    } else {
        delete qso.satellite;
    }

    if (qso.mode === 'SSB') {
        qso.submode = document.getElementById('edit-ssb-submode-select').value;
    } else {
        delete qso.submode;
    }

    if (settings.showPropagation) {
        qso.propagationMode = document.getElementById('edit-qso-prop').value.toUpperCase();
    } else {
        delete qso.propagationMode;
    }

    setCurrentLog(log);
    updateLog(log);

    showNotification('QSO actualizado', 'success');
    displayQSOsForEdit();
    window.showScreen('log-view');
}

export function deleteCurrentQso() {
    if (!confirm('¿Estás seguro de borrar este QSO?')) return;

    const index = getEditingQsoIndex();
    const log = getCurrentLog();
    if (!log || !log.qsos[index]) return;

    log.qsos.splice(index, 1);
    setCurrentLog(log);
    updateLog(log);

    showNotification('QSO eliminado', 'success');
    window.showScreen('log-view');
    displayQSOsForEdit();
}

export function deleteQsoById(id) {
    if (!confirm('¿Borrar este QSO permanentemente?')) return;

    const log = getCurrentLog();
    const index = log.qsos.findIndex(q => q.id === id);
    if (index === -1) return;

    log.qsos.splice(index, 1);
    setCurrentLog(log);
    updateLog(log);

    showNotification('QSO eliminado', 'success');
    displayQSOsForEdit();
}

export function deleteLog(id) {
    if (!confirm('¿Borrar este log y todos sus QSOs? Esta acción no se puede deshacer.')) return;

    deleteLogById(id);
    showNotification('Log eliminado', 'success');
    displayLogs();
    checkEmptyLogs();
}

export function downloadLog(id) {
    const logs = getLogs();
    const log = logs.find(l => l.id === id);
    if (!log) return;

    const adif = generateADIF(log);
    const blob = new Blob([adif], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = log.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Descargando ADIF...', 'success');
}

export function displayAllQSOs() {
    const dateFrom = document.getElementById('all-filter-date-from').value;
    const dateTo = document.getElementById('all-filter-date-to').value;
    const modeFilter = document.getElementById('all-filter-mode').value;
    const all = getAllQSOs();
    const list = document.getElementById('all-qso-list');
    const noQsos = document.getElementById('no-all-qsos');

    list.innerHTML = '';

    const filtered = all.filter(item => {
        const qsoDate = item.qso.datetime ? item.qso.datetime.slice(0, 10) : '';
        if (dateFrom && qsoDate < dateFrom) return false;
        if (dateTo && qsoDate > dateTo) return false;
        let qsoMode = item.qso.mode;
        if (qsoMode === 'USB' || qsoMode === 'LSB') qsoMode = 'SSB';
        if (modeFilter && qsoMode !== modeFilter) return false;
        return true;
    });

    if (filtered.length === 0) {
        noQsos.style.display = 'block';
        return;
    }
    noQsos.style.display = 'none';

    filtered.forEach(item => {
        const { qso, log } = item;
        const el = document.createElement('div');
        el.className = 'qso-item';
        el.innerHTML = createQsoItemHtml(qso, log, { showLogInfo: true });
        list.appendChild(el);
    });
}

export function exportFilteredLogs() {
    const dateFrom = document.getElementById('export-date-from').value;
    const dateTo = document.getElementById('export-date-to').value;
    const all = getAllQSOs();

    const filtered = all.filter(item => {
        const qsoDate = item.qso.datetime ? item.qso.datetime.slice(0, 10) : '';
        if (dateFrom && qsoDate < dateFrom) return false;
        if (dateTo && qsoDate > dateTo) return false;
        return true;
    });

    if (filtered.length === 0) {
        showNotification('No hay QSOs en el rango seleccionado', 'warning');
        return;
    }

    const adif = generateADIFFromItems(filtered);

    const blob = new Blob([adif], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateLabel = dateFrom || dateTo ? `_${dateFrom || 'inicio'}_${dateTo || 'fin'}` : '';
    a.download = `TinyLog_export${dateLabel}.adi`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`Exportados ${filtered.length} QSOs`, 'success');
}

export function importADIF(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const parsed = parseADIF(text);

        if (parsed.qsos.length === 0) {
            showNotification('No se encontraron QSOs en el archivo ADIF', 'warning');
            input.value = '';
            return;
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const log = {
            id: Date.now(),
            filename: `${dateStr}_Importado_${file.name.replace(/\.\w+$/, '')}.adi`,
            callsign: parsed.stationCall || 'IMPORTADO',
            activationType: 'General',
            location: parsed.stationCall ? parsed.stationCall : 'Importado',
            locator: parsed.myGrid || '',
            comments: `Importado desde ${file.name} el ${now.toLocaleDateString()}`,
            llotaRef: '',
            qsos: parsed.qsos
        };

        const logs = getLogs();
        logs.push(log);
        saveLogs(logs);

        showNotification(`Importados ${parsed.qsos.length} QSOs desde ${file.name}`, 'success');
        input.value = '';
        displayLogs();
    };
    reader.readAsText(file);
}
