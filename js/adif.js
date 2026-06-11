export function getBand(freq) {
    const f = parseFloat(freq);
    if (!f) return '';
    if (f >= 0.1357 && f <= 0.1378) return '2190M';
    if (f >= 0.472 && f <= 0.479) return '630M';
    if (f >= 0.501 && f <= 0.504) return '560M';
    if (f >= 1.8 && f <= 2.0) return '160M';
    if (f >= 3.5 && f <= 4.0) return '80M';
    if (f >= 5.06 && f <= 5.45) return '60M';
    if (f >= 7.0 && f <= 7.3) return '40M';
    if (f >= 10.1 && f <= 10.15) return '30M';
    if (f >= 14.0 && f <= 14.35) return '20M';
    if (f >= 18.068 && f <= 18.168) return '17M';
    if (f >= 21.0 && f <= 21.45) return '15M';
    if (f >= 24.89 && f <= 24.99) return '12M';
    if (f >= 28.0 && f <= 29.7) return '10M';
    if (f >= 50 && f <= 54) return '6M';
    if (f >= 144 && f <= 148) return '2M';
    if (f >= 420 && f <= 450) return '70CM';
    if (f >= 1240 && f <= 1300) return '23CM';
    return '';
}

export function normalizeModeForADIF(mode) {
    if (mode === 'USB' || mode === 'LSB') return 'SSB';
    return mode;
}

export function normalizeSubmodeForADIF(mode, originalMode, submode) {
    if (mode === 'SSB') {
        return submode || 'USB';
    }
    return originalMode;
}

function generateADIFHeader() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    return `ADIF export from TinyLog v0.1.6
<ADIF_VER:5>3.1.6
<CREATED_TIMESTAMP:14>${timestamp}
<PROGRAMID:8>TinyLog
<PROGRAMVERSION:5>0.1.6
<EOH>
`;
}

function generateADIFRecords(items) {
    let adif = '';
    items.forEach(({ qso, log }) => {
        const startDate = new Date(qso.datetime + 'Z');
        const endDate = new Date(startDate.getTime() + 60000);
        const date = startDate.toISOString().split('T')[0].replace(/-/g, '');
        const timeOn = startDate.toISOString().split('T')[1].replace(/:/g, '').slice(0, 6);
        const dateOff = endDate.toISOString().split('T')[0].replace(/-/g, '');
        const timeOff = endDate.toISOString().split('T')[1].replace(/:/g, '').slice(0, 6);
        const band = getBand(qso.frequency);
        const adifMode = normalizeModeForADIF(qso.mode);
        const adifSubmode = normalizeSubmodeForADIF(adifMode, qso.mode, qso.submode);

        adif += `<QSO_DATE:${date.length}>${date} `;
        adif += `<TIME_ON:${timeOn.length}>${timeOn} `;
        adif += `<QSO_DATE_OFF:${dateOff.length}>${dateOff} `;
        adif += `<TIME_OFF:${timeOff.length}>${timeOff} `;
        adif += `<CALL:${qso.dxCall.length}>${qso.dxCall}`;

        if (band) adif += ` <BAND:${band.length}>${band}`;
        adif += ` <FREQ:${qso.frequency.length}>${qso.frequency}`;
        adif += ` <MODE:${adifMode.length}>${adifMode}`;
        if (adifSubmode && adifSubmode !== adifMode) {
            adif += ` <SUBMODE:${adifSubmode.length}>${adifSubmode}`;
        }
        adif += ` <RST_SENT:${qso.rstSent.length}>${qso.rstSent}`;
        adif += ` <RST_RCVD:${qso.rstRcvd.length}>${qso.rstRcvd}`;
        adif += ` <STATION_CALLSIGN:${log.callsign.length}>${log.callsign}`;

        if (log.locator) adif += ` <MY_GRIDSQUARE:${log.locator.length}>${log.locator}`;
        if (qso.gridsquare) adif += ` <GRIDSQUARE:${qso.gridsquare.length}>${qso.gridsquare}`;

        if (log.activationType === 'LLOTA' && log.llotaRef) {
            adif += ` <MY_SIG:4>LLOTA`;
            adif += ` <MY_SIG_INFO:${log.llotaRef.length}>${log.llotaRef}`;
        }

        if (qso.mode === 'SAT' && qso.satellite) {
            adif += ` <SAT_NAME:${qso.satellite.length}>${qso.satellite}`;
        }

        if (qso.propagationMode) {
            adif += ` <PROP_MODE:${qso.propagationMode.length}>${qso.propagationMode}`;
        }

        adif += ` <EOR>\n`;
    });
    return adif;
}

export function generateADIF(log) {
    return generateADIFHeader() + generateADIFRecords(log.qsos.map(q => ({ qso: q, log })));
}

export function generateADIFFromItems(items) {
    return generateADIFHeader() + generateADIFRecords(items);
}

export function parseADIF(text) {
    const headerEnd = text.indexOf('<EOH>');
    const bodyStart = headerEnd !== -1 ? headerEnd + 5 : 0;
    const body = text.slice(bodyStart);

    let stationCall = '';
    let myGrid = '';
    const headerMatch = text.slice(0, bodyStart);
    const headerFieldRegex = /<(\w+):(\d+)(?::\w+)?>([^<]+)/gi;
    let m;
    while ((m = headerFieldRegex.exec(headerMatch)) !== null) {
        const field = m[1].toUpperCase();
        const val = m[3].trim();
        if (field === 'STATION_CALLSIGN') stationCall = val;
        if (field === 'MY_GRIDSQUARE') myGrid = val;
    }

    const records = body.split(/<EOR>/i).filter(r => r.trim());
    const qsos = [];

    records.forEach(rec => {
        const fieldRegex = /<(\w+):(\d+)(?::\w+)?>([^<]+)/gi;
        const fields = {};
        let fm;
        while ((fm = fieldRegex.exec(rec)) !== null) {
            fields[fm[1].toUpperCase()] = fm[3].trim();
        }

        if (!fields['CALL']) return;

        const rawDate = fields['QSO_DATE'] || '';
        const rawTime = fields['TIME_ON'] || '000000';
        const year = rawDate.slice(0, 4);
        const month = rawDate.slice(4, 6);
        const day = rawDate.slice(6, 8);
        const hours = rawTime.slice(0, 2);
        const mins = rawTime.slice(2, 4);
        let datetime = '';
        if (year && month && day) {
            datetime = `${year}-${month}-${day}T${hours}:${mins}`;
        }

        let mode = fields['MODE'] || 'CW';
        let submode = fields['SUBMODE'] || '';
        if ((mode === 'SSB' || mode === 'USB' || mode === 'LSB') && !submode) {
            if (mode === 'USB' || mode === 'LSB') {
                submode = mode;
                mode = 'SSB';
            }
        }
        if (mode === 'SSB' && submode && !['USB', 'LSB'].includes(submode)) {
            submode = '';
        }

        const satName = fields['SAT_NAME'] || '';
        if (satName) mode = 'SAT';

        const propMode = fields['PROP_MODE'] || '';

        qsos.push({
            id: Date.now() + Math.random(),
            dxCall: fields['CALL'],
            rstSent: fields['RST_SENT'] || '599',
            rstRcvd: fields['RST_RCVD'] || '599',
            gridsquare: fields['GRIDSQUARE'] || '',
            frequency: fields['FREQ'] || '',
            mode: mode,
            submode: submode,
            datetime: datetime,
            satellite: satName,
            propagationMode: propMode
        });
    });

    return { stationCall, myGrid, qsos };
}
