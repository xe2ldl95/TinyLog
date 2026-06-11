import { showNotification } from './ui.js';

export let settings = { theme: 'dark', showPropagation: false, useLastFreq: false };

export function loadSettings() {
    const fontSize = localStorage.getItem('fontSize') || '16';
    const useLastFreq = localStorage.getItem('useLastFreq') === 'true';
    const defaultRstSent = localStorage.getItem('defaultRstSent') || '599';
    const defaultRstRcvd = localStorage.getItem('defaultRstRcvd') || '599';
    const defaultMode = localStorage.getItem('defaultMode') || 'CW';
    const defaultCallsign = localStorage.getItem('defaultCallsign') || '';
    const defaultActivationType = localStorage.getItem('defaultActivationType') || 'General';
    const defaultLocator = localStorage.getItem('defaultLocator') || '';
    const showPropagation = localStorage.getItem('showPropagation') === 'true';

    settings.theme = localStorage.getItem('theme') || 'dark';
    settings.showPropagation = showPropagation;
    settings.useLastFreq = useLastFreq;

    document.getElementById('font-size').value = fontSize;
    document.getElementById('use-last-freq').checked = useLastFreq;
    document.getElementById('default-rst-sent').value = defaultRstSent;
    document.getElementById('default-rst-rcvd').value = defaultRstRcvd;
    document.getElementById('default-mode').value = defaultMode;
    document.getElementById('default-callsign').value = defaultCallsign;
    document.getElementById('default-activation-type').value = defaultActivationType;
    document.getElementById('default-locator').value = defaultLocator;

    document.getElementById('themeToggle').checked = settings.theme === 'dark';
    document.getElementById('show-propagation').checked = showPropagation;

    document.documentElement.style.setProperty('--font-size', fontSize + 'px');
}

export function toggleTheme() {
    settings.theme = document.getElementById('themeToggle').checked ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('theme', settings.theme);
}

export function applyTheme() {
    if (settings.theme === 'light') {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }
}

export function changeFontSize() {
    const size = document.getElementById('font-size').value;
    document.documentElement.style.setProperty('--font-size', size + 'px');
    localStorage.setItem('fontSize', size);
}

export function saveSettings() {
    const useLastFreq = document.getElementById('use-last-freq').checked;
    const defaultRstSent = document.getElementById('default-rst-sent').value;
    const defaultRstRcvd = document.getElementById('default-rst-rcvd').value;
    const defaultMode = document.getElementById('default-mode').value;
    const defaultCallsign = document.getElementById('default-callsign').value.toUpperCase();
    const defaultActivationType = document.getElementById('default-activation-type').value;
    const defaultLocator = document.getElementById('default-locator').value.toUpperCase();

    localStorage.setItem('useLastFreq', useLastFreq);
    settings.useLastFreq = useLastFreq;
    localStorage.setItem('defaultRstSent', defaultRstSent);
    localStorage.setItem('defaultRstRcvd', defaultRstRcvd);
    localStorage.setItem('defaultMode', defaultMode);
    localStorage.setItem('defaultCallsign', defaultCallsign);
    localStorage.setItem('defaultActivationType', defaultActivationType);
    localStorage.setItem('defaultLocator', defaultLocator);

    showNotification('Configuración guardada', 'success', 'settings');
}
