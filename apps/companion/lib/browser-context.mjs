// Browser hints are uncertain; an explicit participant choice always wins.
export function browserContext(nav = {}, now = new Date(), zone = '', override = '') {
 const ua = nav.userAgent || '';
 const touch = Number(nav.maxTouchPoints) > 0;
 const tabletHint = /iPad/.test(ua) || (/Macintosh|MacIntel/.test(ua + (nav.platform || '')) && touch);
 const detected = tabletHint ? 'apple-touch' : /iPhone|iPod/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : /Mac/.test(ua) ? 'mac' : /Windows/.test(ua) ? 'windows' : 'unknown';
 const device = ['ipad','ios','android','mac','windows','unknown'].includes(override) ? override : detected;
 const browserFirst = ['ipad','apple-touch','ios','android','unknown'].includes(device);
 return {device, source: override ? 'participant' : 'browser hint', touch, localTime: now.toLocaleString(), timeZone: zone || 'Unavailable', utcOffsetMinutes: -now.getTimezoneOffset(), guidance: browserFirst ? 'Use browser-first steps. Do not assume a desktop terminal or local Git is available.' : 'Prefer browser steps. Confirm a terminal is available before giving shell commands.', limits: 'Device model and installed apps are not exposed reliably. Time comes from the device clock, not a verified time service.'};
}
