import { settings } from './settings.js';

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
    const ssbId = prefix === 'edit-' ? 'edit-ssb-submode' : 'ssb-submode';
    const propId = prefix === 'edit-' ? 'edit-propagation-options' : 'propagation-options';

    document.getElementById(satId).classList.toggle('hidden', mode !== 'SAT');
    document.getElementById(ssbId).classList.toggle('hidden', mode !== 'SSB');
    document.getElementById(propId).classList.toggle('hidden', !settings.showPropagation);
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
