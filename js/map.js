import { getAllQSOs, getLogs } from './storage.js';

export function gridToLatLng(grid) {
    if (!grid || grid.length < 4) return null;
    grid = grid.toUpperCase();

    const lng = (grid.charCodeAt(0) - 65) * 20 + (parseInt(grid[2]) * 2) + 1 - 180;
    const lat = (grid.charCodeAt(1) - 65) * 10 + parseInt(grid[3]) + 0.5 - 90;

    if (grid.length >= 6) {
        const lngSub = (grid.charCodeAt(4) - 65) * 0.08333 + 0.04166;
        const latSub = (grid.charCodeAt(5) - 65) * 0.04166 + 0.02083;
        return { lat: lat + latSub, lng: lng + lngSub };
    }

    return { lat, lng };
}

let mapInstance = null;
let markersLayer = null;
let linesLayer = null;

let sourceQsos = [];
let sourceMyGrid = '';

function initMap() {
    const container = document.getElementById('map-container');
    container.innerHTML = '';

    mapInstance = L.map('map-container').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
        maxZoom: 18
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
    linesLayer = L.layerGroup().addTo(mapInstance);

    setTimeout(() => mapInstance.invalidateSize(), 100);
}

function clearMap() {
    if (markersLayer) markersLayer.clearLayers();
    if (linesLayer) linesLayer.clearLayers();
}

function removeInfoControl() {
    if (mapInstance.infoControl) {
        mapInstance.removeControl(mapInstance.infoControl);
        mapInstance.infoControl = null;
    }
}

function getFilteredQsos() {
    const dateFrom = document.getElementById('map-filter-date-from').value;
    const dateTo = document.getElementById('map-filter-date-to').value;
    const modeFilter = document.getElementById('map-filter-mode').value;

    return sourceQsos.filter(item => {
        const { qso } = item;
        const qsoDate = qso.datetime ? qso.datetime.slice(0, 10) : '';
        if (dateFrom && qsoDate < dateFrom) return false;
        if (dateTo && qsoDate > dateTo) return false;
        let qsoMode = qso.mode;
        if (qsoMode === 'USB' || qsoMode === 'LSB') qsoMode = 'SSB';
        if (modeFilter && qsoMode !== modeFilter) return false;
        return true;
    });
}

function renderFilteredMap() {
    if (!mapInstance) {
        initMap();
    } else {
        clearMap();
        removeInfoControl();
    }

    const filtered = getFilteredQsos();
    const myPos = gridToLatLng(sourceMyGrid);
    let bounds = [];
    let markersCount = 0;

    if (myPos) {
        const myMarker = L.marker([myPos.lat, myPos.lng], {
            icon: L.divIcon({
                className: '',
                html: '<div style="background:#00a8cc;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        });
        myMarker.bindPopup(`<b>Mi estación</b><br>${sourceMyGrid}`);
        markersLayer.addLayer(myMarker);
        bounds.push([myPos.lat, myPos.lng]);
        markersCount++;
    }

    filtered.forEach(item => {
        const { qso, log } = item;
        const dxGrid = qso.gridsquare || '';
        const dxPos = gridToLatLng(dxGrid);
        if (!dxPos) return;

        const dxMarker = L.marker([dxPos.lat, dxPos.lng], {
            icon: L.divIcon({
                className: '',
                html: '<div style="background:#f87171;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            })
        });
        dxMarker.bindPopup(`<b>${qso.dxCall}</b><br>${dxGrid}<br>${qso.frequency} MHz • ${qso.mode}<br>${log.callsign} • ${log.location}`);
        markersLayer.addLayer(dxMarker);
        bounds.push([dxPos.lat, dxPos.lng]);
        markersCount++;

        if (myPos) {
            const line = L.polyline([[myPos.lat, myPos.lng], [dxPos.lat, dxPos.lng]], {
                color: '#00a8cc',
                weight: 1,
                opacity: 0.4,
                dashArray: '5, 5'
            });
            linesLayer.addLayer(line);
        }
    });

    if (markersCount > 0) {
        mapInstance.fitBounds(bounds, { padding: [30, 30] });
    } else {
        mapInstance.setView([20, 0], 2);
        const info = L.control({ position: 'bottomleft' });
        info.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-info');
            const msg = filtered.length === 0
                ? 'Ningún QSO coincide con los filtros'
                : 'Sin datos de ubicación — agrega grids a tus QSOs';
            div.innerHTML = msg;
            div.style.cssText = 'background:var(--card-bg,#1b263b);color:var(--text,#e0e1dd);padding:8px 16px;border-radius:8px;font-size:0.85rem;margin-bottom:10px;border:1px solid var(--border,#3a506b);';
            return div;
        };
        mapInstance.infoControl = info;
        info.addTo(mapInstance);
    }
    setTimeout(() => mapInstance.invalidateSize(), 50);
}

export function openQsoMapForLog() {
    const log = JSON.parse(localStorage.getItem('currentLog') || 'null');
    if (!log) return;

    sourceMyGrid = log.locator || '';
    sourceQsos = (log.qsos || []).map(q => ({ qso: q, log }));
    document.getElementById('map-modal').classList.remove('hidden');
    renderFilteredMap();
}

export function openGlobalMap() {
    const all = getAllQSOs();
    const logs = getLogs();
    sourceMyGrid = logs.length > 0 ? (logs[0].locator || '') : '';
    sourceQsos = all;
    document.getElementById('map-modal').classList.remove('hidden');
    renderFilteredMap();
}

export function applyMapFilters() {
    renderFilteredMap();
}

export function closeMapModal() {
    document.getElementById('map-modal').classList.add('hidden');
}
