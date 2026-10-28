import test from 'node:test';
import assert from 'node:assert/strict';
import {browserContext} from '../lib/browser-context.mjs';
test('desktop-mode Apple touch browser never defaults to Mac terminal steps',()=>{
 const c=browserContext({userAgent:'Macintosh',platform:'MacIntel',maxTouchPoints:5});
 assert.equal(c.device,'apple-touch');assert.match(c.guidance,/Do not assume/);
});
test('explicit iPad selection wins over a Mac browser hint',()=>{
 const c=browserContext({userAgent:'Macintosh',maxTouchPoints:0},new Date(),'UTC','ipad');
 assert.equal(c.device,'ipad');assert.equal(c.source,'participant');
});
test('missing browser signals remain unknown and clock context is explicit',()=>{
 const date=new Date('2026-10-25T12:00:00Z');const c=browserContext({},date,'UTC');
 assert.equal(c.device,'unknown');assert.equal(c.localTime,date.toLocaleString());assert.equal(c.timeZone,'UTC');assert.match(c.limits,/not a verified/);
});
