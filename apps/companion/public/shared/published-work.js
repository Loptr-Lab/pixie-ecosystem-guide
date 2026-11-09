/* Read-only Standard.site discovery. No OAuth client, writes, or automatic indexing. */
(function (root) {
  'use strict';
  const COLLECTION = 'site.standard.document';
  function httpsUrl(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('An HTTPS public URL is required.');
    return url;
  }
  function didDocumentUrl(did) {
    if (/^did:plc:[a-z2-7]{24}$/.test(did)) return 'https://plc.directory/' + did;
    if (did.startsWith('did:web:')) {
      const parts = did.slice(8).split(':').map(decodeURIComponent);
      const host = parts.shift();
      if (!host || /[/?#@]/.test(host) || parts.some(p => !p || p === '.' || p === '..' || /[/?#\\]/.test(p))) throw new Error('Invalid did:web identity.');
      return httpsUrl('https://' + host + (parts.length ? '/' + parts.map(encodeURIComponent).join('/') + '/did.json' : '/.well-known/did.json')).href;
    }
    throw new Error('Enter an AT Protocol handle, did:plc, or did:web identity.');
  }
  function parsePublication(uri) {
    const match = /^at:\/\/(did:[^/]+)\/site\.standard\.publication\/([a-zA-Z0-9._~:-]+)$/.exec(uri || '');
    if (!match) throw new Error('Publication reference is unavailable.');
    return { did: match[1], rkey: match[2] };
  }
  function documentUrl(site, path) {
    const base = httpsUrl(site);
    if (!path || !path.startsWith('/') || path.startsWith('//')) throw new Error('No document-specific web link is available.');
    // Concatenate as specified by Standard.site; never allow the path to replace the host.
    const url = httpsUrl(base.href.replace(/\/$/, '') + path);
    if (url.origin !== base.origin) throw new Error('Invalid document link.');
    return url.href;
  }
  function createReader(fetcher, signal) {
    const identities = new Map(), publications = new Map();
    async function json(url) {
      const response = await fetcher(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error('The public service returned ' + response.status + '. Try again later.');
      return response.json();
    }
    async function identity(input) {
      let did = input.trim().replace(/^@/, '');
      if (!did.startsWith('did:')) {
        if (!/^[a-zA-Z0-9.-]+$/.test(did) || !did.includes('.')) throw new Error('Enter an AT Protocol handle or DID.');
        did = (await json('https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=' + encodeURIComponent(did.toLowerCase()))).did;
      }
      if (identities.has(did)) return identities.get(did);
      const doc = await json(didDocumentUrl(did));
      if (doc.id !== did) throw new Error('The identity document did not match the requested DID.');
      const service = (doc.service || []).find(s => (s.id === '#atproto_pds' || s.id === did + '#atproto_pds') && s.type === 'AtprotoPersonalDataServer');
      if (!service) throw new Error('No public repository service was found for this identity.');
      const pds = httpsUrl(service.serviceEndpoint).href.replace(/\/$/, '');
      const result = { did, pds }; identities.set(did, result); return result;
    }
    async function page(actor, cursor) {
      const params = new URLSearchParams({ repo: actor.did, collection: COLLECTION, limit: '20' });
      if (cursor) params.set('cursor', cursor);
      return json(actor.pds + '/xrpc/com.atproto.repo.listRecords?' + params);
    }
    async function link(value) {
      let site = value.site;
      if (typeof site !== 'string') throw new Error('No publication link is available.');
      if (site.startsWith('at://')) {
        if (!publications.has(site)) {
          publications.set(site, (async () => {
            const ref = parsePublication(site), publisher = await identity(ref.did);
            const params = new URLSearchParams({ repo: publisher.did, collection: 'site.standard.publication', rkey: ref.rkey });
            const publication = await json(publisher.pds + '/xrpc/com.atproto.repo.getRecord?' + params);
            return publication.value?.url;
          })());
        }
        site = await publications.get(site);
      }
      return documentUrl(site, value.path);
    }
    return { identity, page, link };
  }
  const api = { createReader, didDocumentUrl, documentUrl, parsePublication };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MADE_SICK_WORK = api;
  if (!root.document) return;
  const document = root.document, form = document.getElementById('work-form');
  if (!form) return;
  const input = document.getElementById('work-handle'), status = document.getElementById('work-status');
  const list = document.getElementById('work-list'), more = document.getElementById('work-more');
  const load = document.getElementById('work-load'), stop = document.getElementById('work-stop');
  const sifa = document.getElementById('work-sifa');
  let actor, reader, controller, cursor, busy = false, count = 0, missingLinks = 0;
  const seen = new Set();
  async function loadPage(reset) {
    if (busy) return;
    busy = true; load.disabled = true; more.disabled = true; stop.disabled = false; input.disabled = true;
    controller = new AbortController();
    // A new reader uses the current request signal; discovery stays local to this request.
    reader = createReader(root.fetch.bind(root), controller.signal);
    if (reset) { actor = null; cursor = null; count = 0; missingLinks = 0; seen.clear(); list.replaceChildren(); sifa.hidden = true; }
    status.textContent = 'Reading public published-work records…';
    try {
      if (!actor) actor = await reader.identity(input.value);
      const data = await reader.page(actor, cursor);
      const nextCursor = data.cursor || null;
      for (const entry of data.records || []) {
        if (seen.has(entry.uri) || entry.value?.$type !== COLLECTION || !entry.uri?.startsWith('at://' + actor.did + '/' + COLLECTION + '/')) continue;
        const value = entry.value, card = document.createElement('article'); card.className = 'work-card';
        const title = document.createElement('h3'); title.textContent = value.title || 'Untitled document';
        const date = document.createElement('p');
        const parsed = new Date(value.publishedAt); date.textContent = Number.isNaN(parsed.getTime()) ? 'Publication date unavailable' : parsed.toLocaleDateString();
        const source = document.createElement('p'); source.className = 'work-uri'; source.textContent = entry.uri;
        card.append(title, date, source);
        try {
          const href = await reader.link(value), link = document.createElement('a'); link.href = href;
          link.textContent = 'Read at the source ↗'; link.target = '_blank'; link.rel = 'noreferrer noopener'; card.append(link);
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          missingLinks++; const note = document.createElement('p'); note.textContent = 'Web link unavailable; the record URI above identifies the source.'; card.append(note);
        }
        seen.add(entry.uri); list.append(card); count++;
      }
      if (nextCursor && nextCursor === cursor) throw new Error('The service repeated a page cursor; stop here and retry the lookup.');
      cursor = nextCursor;
      sifa.href = 'https://sifa.id/p/' + encodeURIComponent(actor.did); sifa.hidden = false;
      status.textContent = count ? count + ' public document records shown.' + (cursor ? ' More records are available.' : ' End of the available collection.') + (missingLinks ? ' Some web links could not be resolved.' : '') : 'No Standard.site documents found in this repository. Joining alone does not create one. Existing records may use another format.';
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'Stopped. Already displayed records remain; load again or continue if an older page was available.' : error.message + ' Already displayed records remain.';
    } finally {
      busy = false; load.disabled = false; input.disabled = false; stop.disabled = true; more.disabled = !cursor; more.hidden = !cursor;
    }
  }
  input.addEventListener('input', () => { actor = null; cursor = null; more.hidden = true; more.disabled = true; sifa.hidden = true; });
  form.addEventListener('submit', event => { event.preventDefault(); loadPage(true); });
  more.addEventListener('click', () => loadPage(false));
  stop.addEventListener('click', () => controller?.abort());
})(typeof window === 'undefined' ? globalThis : window);
