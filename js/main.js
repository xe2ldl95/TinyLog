import { settings, loadSettings, applyTheme, toggleTheme, changeFontSize, saveSettings } from './settings.js';
import { checkEmptyLogs, displayLogs, displayQSOsForEdit, displayAllQSOs, exportFilteredLogs, importADIF, openLog, downloadLog, deleteLog, openEditQsoById, saveCurrentQso, deleteCurrentQso, deleteQsoById } from './qsoView.js';
import { showStats } from './stats.js';
import { showNotification, toggleSatelliteAndPropagationOptions, toggleOtherSatellite, toggleEditSatelliteAndPropagationOptions, toggleEditOtherSatellite, toggleLlotaReference, togglePropagationVisibility } from './ui.js';
import { loadInitDefaults, loadDefaultsForQSO, setCurrentUTC } from './logForms.js';
import { openQsoMapForLog, openGlobalMap, closeMapModal, applyMapFilters } from './map.js';
import { getLogs, getCurrentLog } from './storage.js';
import { generateADIF } from './adif.js';

window.showScreen = function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if (screenId === 'open-logs') {
        displayLogs();
    } else if (screenId === 'add-qso') {
        loadDefaultsForQSO();
        toggleSatelliteAndPropagationOptions();
    } else if (screenId === 'init-log') {
        loadInitDefaults();
    } else if (screenId === 'stats') {
        showStats();
    }
};

window.showNotification = showNotification;
window.toggleSatelliteAndPropagationOptions = toggleSatelliteAndPropagationOptions;
window.toggleOtherSatellite = toggleOtherSatellite;
window.toggleEditSatelliteAndPropagationOptions = toggleEditSatelliteAndPropagationOptions;
window.toggleEditOtherSatellite = toggleEditOtherSatellite;
window.toggleLlotaReference = toggleLlotaReference;
window.togglePropagationVisibility = togglePropagationVisibility;
window.toggleTheme = toggleTheme;
window.changeFontSize = changeFontSize;
window.saveSettings = saveSettings;
window.setCurrentUTC = setCurrentUTC;
window.displayLogs = displayLogs;
window.displayQSOsForEdit = displayQSOsForEdit;
window.displayAllQSOs = displayAllQSOs;
window.exportFilteredLogs = exportFilteredLogs;
window.importADIF = importADIF;
window.openLog = openLog;
window.downloadLog = downloadLog;
window.deleteLog = deleteLog;
window.openEditQsoById = openEditQsoById;
window.saveCurrentQso = saveCurrentQso;
window.deleteCurrentQso = deleteCurrentQso;
window.deleteQsoById = deleteQsoById;
window.showStats = showStats;
window.openQsoMapForLog = openQsoMapForLog;
window.openGlobalMap = openGlobalMap;
window.closeMapModal = closeMapModal;
window.applyMapFilters = applyMapFilters;

window.openLicensesModal = function openLicensesModal() {
    document.getElementById('licenses-modal').classList.remove('hidden');
};

window.closeLicensesModal = function closeLicensesModal() {
    document.getElementById('licenses-modal').classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    applyTheme();
    checkEmptyLogs();

    document.getElementById('init-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const callsign = document.getElementById('callsign').value.trim().toUpperCase();
        const activationType = document.getElementById('activation-type').value;
        const location = document.getElementById('location').value.trim();
        const locator = document.getElementById('locator').value.trim().toUpperCase();
        const comments = document.getElementById('comments').value.trim();
        const llotaRef = document.getElementById('llota-ref').value.trim().toUpperCase();

        if (!callsign || !location) {
            showNotification('Indicativo y ubicación son obligatorios', 'warning');
            return;
        }

        if (activationType === 'LLOTA' && !llotaRef) {
            showNotification('La referencia LLOTA es obligatoria para activaciones LLOTA', 'warning');
            return;
        }

        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const filename = `${date}_${activationType}_${location.replace(/\s+/g, '_')}.adi`;
        const log = {
            id: Date.now(),
            filename,
            callsign,
            activationType,
            location,
            locator,
            comments,
            llotaRef,
            qsos: []
        };

        const logs = getLogs();
        logs.push(log);
        localStorage.setItem('logs', JSON.stringify(logs));
        localStorage.setItem('currentLog', JSON.stringify(log));

        window.showScreen('add-qso');
        showNotification('Log creado exitosamente', 'success');
    });

    document.getElementById('qso-form').addEventListener('submit', (e) => {
        e.preventDefault();
        let datetime = document.getElementById('qso-datetime').value;
        if (!datetime) {
            datetime = new Date().toISOString().slice(0, 16);
        }
        const dxCall = document.getElementById('dx-call').value.trim().toUpperCase();
        const rstSent = document.getElementById('rst-sent').value.trim();
        const rstRcvd = document.getElementById('rst-rcvd').value.trim();
        const dxGridsquare = document.getElementById('dx-gridsquare').value.trim().toUpperCase();
        const frequency = document.getElementById('frequency').value.trim();
        const mode = document.getElementById('mode').value;

        let satellite = '';
        let propagationMode = '';
        let submode = '';

        if (mode === 'SAT') {
            const satSelect = document.getElementById('satellite').value;
            satellite = satSelect === 'other' ? document.getElementById('satellite-other').value.trim().toUpperCase() : satSelect.toUpperCase();
        }

        if (mode === 'SSB') {
            submode = document.getElementById('ssb-submode-select').value;
        }

        if (settings && settings.showPropagation) {
            propagationMode = document.getElementById('propagation-mode').value.toUpperCase();
        }

        if (!dxCall || !frequency) {
            showNotification('Indicativo DX y frecuencia son obligatorios', 'warning');
            return;
        }

        const qso = {
            id: Date.now(),
            dxCall,
            rstSent,
            rstRcvd,
            gridsquare: dxGridsquare,
            frequency,
            mode,
            submode,
            datetime,
            satellite,
            propagationMode
        };

        const log = getCurrentLog();
        log.qsos.push(qso);
        localStorage.setItem('currentLog', JSON.stringify(log));

        const logs = getLogs();
        const index = logs.findIndex(l => l.id === log.id);
        if (index !== -1) {
            logs[index] = log;
            localStorage.setItem('logs', JSON.stringify(logs));
        }

        if (settings.useLastFreq) {
            const currentLog = getCurrentLog();
            currentLog.lastFreq = frequency;
            currentLog.lastMode = mode;
            currentLog.lastSubmode = submode;
            currentLog.lastPropagationMode = propagationMode;
            localStorage.setItem('currentLog', JSON.stringify(currentLog));

            const allLogs = getLogs();
            const idx = allLogs.findIndex(l => l.id === currentLog.id);
            if (idx !== -1) {
                allLogs[idx] = currentLog;
                localStorage.setItem('logs', JSON.stringify(allLogs));
            }
        }
        localStorage.setItem('defaultRstSent', rstSent);
        localStorage.setItem('defaultRstRcvd', rstRcvd);

        showNotification('Guardado correctamente', 'success');
        document.getElementById('qso-form').reset();
        loadDefaultsForQSO();
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(reg => reg.unregister());
        });
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => {
                    console.log('SW registrado:', reg.scope);
                    reg.update();
                })
                .catch(err => console.log('SW error:', err));
        });
    }
});
