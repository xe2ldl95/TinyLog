# TinyLog

Logbook portable y progresivo para radioaficionados. Los datos se almacenan en `localStorage` — no requiere servidor ni backend.

## Características

- **Gestión de logs** — Crea múltiples logs con indicativo, tipo de activación (POTA, SOTA, LLOTA, General, Cazador), locator y ubicación.
- **QSOs** — Añade, edita y elimina contactos con frecuencia, modo, RST, satélite, propagación y submode SSB.
- **ADIF** — Importa y exporta en formato ADIF 3.1.6. Exportación por rango de fechas.
- **Estadísticas** — Totales por modo, banda, tipo de activación y top DX.
- **Mapa** — Visualización en Leaflet con gridsquares de 4 y 6 caracteres. Filtros por fecha y modo.
- **Offline** — Service worker que cachea todos los assets para funcionar sin conexión.
- **Configuración** — Modo oscuro/claro, tamaño de fuente, valores por defecto (RST, modo, indicativo, locator), autocompletar última frecuencia.

## Tecnologías

- JavaScript vanilla (ES modules)
- Leaflet + OpenStreetMap tiles
- Font Awesome 6
- Service Worker API
- localStorage

## Captura

```
Pantalla de bienvenida → Menú principal → Nuevo Log / Abrir Log
                                    → Estadísticas
                                    → Configuración
```

## Instalación

Es una PWA. Abre `index.html` en un servidor web (local o remoto) y se puede instalar en el dispositivo desde el navegador.

```bash
# Servir localmente (ej. con Python)
python -m http.server 8000
# o con Node
npx serve .
```

No requiere compilación ni dependencias npm.

## Uso rápido

1. Presiona **Comenzar** en la pantalla de bienvenida.
2. Ve a **Nuevo Log**, completa indicativo y ubicación, crea el log.
3. Se abre el formulario de QSO. Ingresa los datos del contacto y guarda.
4. Desde **Abrir Log** puedes ver, editar, descargar ADIF o borrar logs.
5. Usa **Exportar (rango de fechas)** para generar ADIF parcial.
6. Las **Estadísticas** agregan datos de todos los logs.

## Estructura del proyecto

```
TinyLog/
├── index.html             # Pantallas y formularios
├── manifest.json          # PWA manifest
├── service-worker.js      # Cache offline
├── css/
│   └── style.css          # Estilos (dark/light theme)
├── js/
│   ├── main.js            # Entry point, event handlers
│   ├── storage.js         # Capa de acceso a localStorage
│   ├── adif.js            # Parseo y generación ADIF
│   ├── ui.js              # Notificaciones, toggles UI
│   ├── settings.js        # Configuración y tema
│   ├── logForms.js        # Lógica de formularios
│   ├── qsoView.js         # Visualización y edición de QSOs
│   ├── stats.js           # Estadísticas
│   └── map.js             # Mapa Leaflet con grids
└── icon.svg / .png        # Íconos PWA
```

## ADIF

- Formato: ADIF 3.1.6
- Campos incluidos: `QSO_DATE`, `TIME_ON`, `QSO_DATE_OFF`, `TIME_OFF`, `CALL`, `BAND`, `FREQ`, `MODE`, `SUBMODE`, `RST_SENT`, `RST_RCVD`, `STATION_CALLSIGN`, `GRIDSQUARE`, `MY_GRIDSQUARE`, `SAT_NAME`, `PROP_MODE`, `MY_SIG`, `MY_SIG_INFO` (LLOTA)
- Las horas se registran y exportan en UTC.

## Licencia

Código abierto. 73 de XE2LDL.
