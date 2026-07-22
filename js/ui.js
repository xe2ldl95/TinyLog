import { settings } from './settings.js';

const submodeMap = {
    'SSB': ['USB', 'LSB'],
    'DIGITALVOICE': ['C4FM', 'DMR', 'DSTAR', 'FREEDV', 'M17'],
    'MFSK': ['FT4', 'FT8', 'FST4', 'Q65'],
    'PSK': ['PSK31', 'PSK63', 'PSK125']
};

export function populateSubmodes(selectId, mode) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const containerId = selectId === 'submode-select' ? 'submode-container' : 'edit-submode-container';
    const container = document.getElementById(containerId);
    const submodes = submodeMap[mode] || [];
    if (submodes.length === 0) {
        container.classList.add('hidden');
        select.innerHTML = '';
        return;
    }
    select.innerHTML = submodes.map(sm => `<option value="${sm}">${sm}</option>`).join('');
    container.classList.remove('hidden');
}

export function showNotification(message, type = 'success', scope = 'main') {
    const targetId = scope === 'settings' ? 'settings-notification' : 'notification';
    const notification = document.getElementById(targetId);
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function toggleSatelliteAndPropagationOptionsWithPrefix(prefix) {
    const modeEl = document.getElementById(prefix + 'mode');
    if (!modeEl) return;
    const mode = modeEl.value;
    const satId = prefix === 'edit-' ? 'edit-satellite-options' : 'satellite-options';
    const submodeSelectId = prefix === 'edit-' ? 'edit-submode-select' : 'submode-select';
    const propId = prefix === 'edit-' ? 'edit-propagation-options' : 'propagation-options';

    const propSel = document.getElementById(prefix === 'edit-' ? 'edit-qso-prop' : 'propagation-mode');
    const propMode = propSel ? propSel.value : '';

    document.getElementById(satId).classList.toggle('hidden', propMode !== 'SAT');
    populateSubmodes(submodeSelectId, mode);

    const showProp = settings.showPropagation || ['FM', 'SSB', 'CW'].includes(mode);
    document.getElementById(propId).classList.toggle('hidden', !showProp);
}

function toggleOtherSatelliteWithPrefix(prefix) {
    const sel = document.getElementById(prefix + 'satellite');
    const otherId = prefix === 'edit-' ? 'edit-satellite-other' : 'satellite-other';
    const other = document.getElementById(otherId);
    if (sel.value === 'other') {
        other.style.display = 'block';
        other.focus();
    } else {
        other.style.display = 'none';
        other.value = '';
    }
}

export function toggleSatelliteAndPropagationOptions() {
    toggleSatelliteAndPropagationOptionsWithPrefix('');
}

export function toggleOtherSatellite() {
    toggleOtherSatelliteWithPrefix('');
}

export function toggleEditSatelliteAndPropagationOptions() {
    toggleSatelliteAndPropagationOptionsWithPrefix('edit-');
}

export function toggleEditOtherSatellite() {
    toggleOtherSatelliteWithPrefix('edit-');
}

export function toggleLlotaReference() {
    const activationType = document.getElementById('activation-type').value;
    const llotaRef = document.getElementById('llota-reference');
    if (activationType === 'LLOTA') {
        llotaRef.classList.remove('hidden');
    } else {
        llotaRef.classList.add('hidden');
    }
}

export function togglePropagationVisibility() {
    settings.showPropagation = document.getElementById('show-propagation').checked;
    localStorage.setItem('showPropagation', settings.showPropagation);
    toggleSatelliteAndPropagationOptions();
    toggleEditSatelliteAndPropagationOptions();
}
