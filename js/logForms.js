import { settings } from './settings.js';
import { toggleSatelliteAndPropagationOptions, toggleLlotaReference, populateSubmodes } from './ui.js';
import { getCurrentLog } from './storage.js';

export function loadInitDefaults() {
    const defaultCallsign = localStorage.getItem('defaultCallsign') || '';
    const defaultActivationType = localStorage.getItem('defaultActivationType') || 'General';
    const defaultLocator = localStorage.getItem('defaultLocator') || '';

    document.getElementById('callsign').value = defaultCallsign;
    document.getElementById('activation-type').value = defaultActivationType;
    document.getElementById('locator').value = defaultLocator;
    toggleLlotaReference();
}

export function loadDefaultsForQSO() {
    const useLastFreq = settings.useLastFreq;
    const defaultRstSent = localStorage.getItem('defaultRstSent') || '599';
    const defaultRstRcvd = localStorage.getItem('defaultRstRcvd') || '599';
    const defaultFrequency = localStorage.getItem('defaultFrequency') || '';
    let defaultMode = localStorage.getItem('defaultMode') || 'CW';
    let defaultSubmode = '';

    if (['USB', 'LSB'].includes(defaultMode)) {
        defaultSubmode = defaultMode;
        defaultMode = 'SSB';
    }

    document.getElementById('rst-sent').value = defaultRstSent;
    document.getElementById('rst-rcvd').value = defaultRstRcvd;
    document.getElementById('frequency').value = defaultFrequency;

    const log = getCurrentLog();

    if (useLastFreq && log) {
        if (log.lastFreq) document.getElementById('frequency').value = log.lastFreq;
        if (log.lastMode) {
            document.getElementById('mode').value = log.lastMode;
            populateSubmodes('submode-select', log.lastMode);
            if (log.lastSubmode) {
                const subSel = document.getElementById('submode-select');
                if (subSel && subSel.options.length > 0) subSel.value = log.lastSubmode;
            }
        } else {
            document.getElementById('mode').value = defaultMode;
            populateSubmodes('submode-select', defaultMode);
            if (defaultMode === 'SSB' && defaultSubmode) {
                const subSel = document.getElementById('submode-select');
                if (subSel && subSel.options.length > 0) subSel.value = defaultSubmode;
            }
        }
        if (log.lastPropagationMode) {
            document.getElementById('propagation-mode').value = log.lastPropagationMode;
        }
        if (log.lastPropagationMode === 'SAT' && log.lastSatellite) {
            document.getElementById('satellite').value = log.lastSatellite;
        }
    } else {
        document.getElementById('mode').value = defaultMode;
        populateSubmodes('submode-select', defaultMode);
        if (defaultMode === 'SSB' && defaultSubmode) {
            const subSel = document.getElementById('submode-select');
            if (subSel && subSel.options.length > 0) subSel.value = defaultSubmode;
        }
        if (log && log.lastPropagationMode) {
            document.getElementById('propagation-mode').value = log.lastPropagationMode;
        }
    }

    toggleSatelliteAndPropagationOptions();

    document.getElementById('satellite-other').style.display = 'none';
    if (!document.getElementById('satellite').value) {
        document.getElementById('satellite').value = 'AO-91';
    }
    document.getElementById('dx-call').focus();
}

export function setCurrentUTC() {
    const now = new Date();
    const utcString = now.toISOString().slice(0, 16);
    document.getElementById('qso-datetime').value = utcString;
}
