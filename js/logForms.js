import { settings } from './settings.js';
import { toggleSatelliteAndPropagationOptions, toggleLlotaReference } from './ui.js';
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
    let defaultMode = localStorage.getItem('defaultMode') || 'CW';
    let defaultSubmode = '';

    if (['USB', 'LSB'].includes(defaultMode)) {
        defaultSubmode = defaultMode;
        defaultMode = 'SSB';
    }

    document.getElementById('rst-sent').value = defaultRstSent;
    document.getElementById('rst-rcvd').value = defaultRstRcvd;

    if (useLastFreq) {
        const log = getCurrentLog();
        if (log && log.lastFreq) {
            document.getElementById('frequency').value = log.lastFreq;
        }
        if (log && log.lastMode) {
            document.getElementById('mode').value = log.lastMode;
            if (log.lastMode === 'SSB' && log.lastSubmode) {
                document.getElementById('ssb-submode-select').value = log.lastSubmode;
            }
        } else {
            document.getElementById('mode').value = defaultMode;
            if (defaultMode === 'SSB') {
                document.getElementById('ssb-submode-select').value = defaultSubmode || 'USB';
            }
        }
        if (log && settings && settings.showPropagation && log.lastPropagationMode) {
            document.getElementById('propagation-mode').value = log.lastPropagationMode;
        }
    } else {
        document.getElementById('mode').value = defaultMode;
        if (defaultMode === 'SSB') {
            document.getElementById('ssb-submode-select').value = defaultSubmode || 'USB';
        }
    }

    toggleSatelliteAndPropagationOptions();

    document.getElementById('satellite-other').style.display = 'none';
    document.getElementById('satellite').value = 'AO-91';
}

export function setCurrentUTC() {
    const now = new Date();
    const utcString = now.toISOString().slice(0, 16);
    document.getElementById('qso-datetime').value = utcString;
}
