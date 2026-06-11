import { getAllQSOs } from './storage.js';
import { getBand } from './adif.js';

export function showStats() {
    const all = getAllQSOs();
    const container = document.getElementById('stats-content');

    if (all.length === 0) {
        container.innerHTML = `<div class="card" style="text-align:center;">
            <p style="color:var(--text-muted);">No hay QSOs registrados.</p>
        </div>`;
        return;
    }

    const total = all.length;
    const modeCount = {};
    const bandCount = {};
    const actCount = {};
    const dxCount = {};
    let oldest = null;
    let newest = null;

    all.forEach(item => {
        const { qso, log } = item;
        let mode = qso.mode;
        if (mode === 'USB' || mode === 'LSB') mode = 'SSB';
        modeCount[mode] = (modeCount[mode] || 0) + 1;

        const band = getBand(qso.frequency) || 'N/A';
        bandCount[band] = (bandCount[band] || 0) + 1;

        actCount[log.activationType] = (actCount[log.activationType] || 0) + 1;

        dxCount[qso.dxCall] = (dxCount[qso.dxCall] || 0) + 1;

        if (qso.datetime) {
            const d = new Date(qso.datetime);
            if (!oldest || d < oldest) oldest = d;
            if (!newest || d > newest) newest = d;
        }
    });

    const sortedModes = Object.entries(modeCount).sort((a, b) => b[1] - a[1]);
    const sortedBands = Object.entries(bandCount).sort((a, b) => b[1] - a[1]);
    const sortedActs = Object.entries(actCount).sort((a, b) => b[1] - a[1]);
    const sortedDx = Object.entries(dxCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const dateRange = oldest && newest
        ? `${oldest.toLocaleDateString()} — ${newest.toLocaleDateString()}`
        : '—';

    container.innerHTML = `
        <div class="stats-grid slide-up">
            <div class="stat-card">
                <span class="stat-number">${total}</span>
                <span class="stat-label">Total QSOs</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${Object.keys(dxCount).length}</span>
                <span class="stat-label">DX Únicos</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${Object.keys(bandCount).length}</span>
                <span class="stat-label">Bandas</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${Object.keys(modeCount).length}</span>
                <span class="stat-label">Modos</span>
            </div>
        </div>
        <div class="card stat-section slide-up">
            <h3><i class="fas fa-calendar"></i> Rango de fechas</h3>
            <p style="color:var(--text);">${dateRange}</p>
        </div>
        <div class="card stat-section slide-up">
            <h3><i class="fas fa-signal"></i> QSOs por Modo</h3>
            <div class="stat-list">
                ${sortedModes.map(([mode, count]) =>
                    `<span class="stat-tag">${mode}: ${count}</span>`
                ).join('')}
            </div>
        </div>
        <div class="card stat-section slide-up">
            <h3><i class="fas fa-wave-square"></i> QSOs por Banda</h3>
            <div class="stat-list">
                ${sortedBands.map(([band, count]) =>
                    `<span class="stat-tag">${band}: ${count}</span>`
                ).join('')}
            </div>
        </div>
        <div class="card stat-section slide-up">
            <h3><i class="fas fa-map-marker-alt"></i> QSOs por Activación</h3>
            <div class="stat-list">
                ${sortedActs.map(([type, count]) =>
                    `<span class="stat-tag">${type}: ${count}</span>`
                ).join('')}
            </div>
        </div>
        <div class="card stat-section slide-up">
            <h3><i class="fas fa-trophy"></i> Top 10 DXCC</h3>
            <div class="stat-list">
                ${sortedDx.map(([call, count]) =>
                    `<span class="stat-tag">${call}: ${count}</span>`
                ).join('')}
            </div>
        </div>
        <div class="card" style="text-align:center;cursor:pointer;padding:16px;" onclick="openGlobalMap()">
            <div style="font-size:2rem;color:var(--primary);margin-bottom:8px;">
                <i class="fas fa-map-marked-alt"></i>
            </div>
            <p style="color:var(--text);font-weight:600;">Ver Mapa Global</p>
            <p style="color:var(--text-muted);font-size:0.85rem;">QSOs con locator en el mapa</p>
        </div>
    `;
}
