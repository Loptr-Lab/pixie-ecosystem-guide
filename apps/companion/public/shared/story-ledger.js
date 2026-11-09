/* Portable Story Finder ledger. No network or storage side effects. */
(function (root) {
  'use strict';
  const notice = 'Creator review record only. Selection does not grant directory enrollment or publication consent.';
  function exportLedger({ actor, items, selectedAt, exportedAt = new Date().toISOString() }) {
    if (!actor || !/^did:[a-z]+:[^/\s]+$/.test(actor.did || '')) throw new Error('Load a resolved author feed before exporting.');
    const posts = items.map(item => {
      const p = item.post || {}, r = p.record || {};
      const match = /^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/.exec(p.uri || '');
      if (!match || p.author?.did !== match[1] || typeof p.cid !== 'string' || !p.cid) throw new Error('A selected post is missing source identity. Reload the feed before exporting.');
      const createdAt = new Date(r.createdAt || p.indexedAt).toISOString();
      const selection = selectedAt.get(p.uri);
      if (!selection || !Number.isFinite(Date.parse(selection))) throw new Error('A selected post is missing its selection time.');
      const post = { uri: p.uri, cid: p.cid, authorDid: p.author.did, createdAt, selectedAt: selection,
        url: 'https://bsky.app/profile/' + encodeURIComponent(p.author.did) + '/post/' + encodeURIComponent(match[2]),
        reply: Boolean(r.reply), repost: item.reason?.$type === 'app.bsky.feed.defs#reasonRepost',
        embedding: typeof p.viewer?.embeddingDisabled === 'boolean' ? (p.viewer.embeddingDisabled ? 'disabled' : 'allowed') : 'unknown' };
      if (p.author.did === actor.did && typeof r.text === 'string') post.text = r.text;
      return post;
    });
    return { schemaVersion: 2, title: 'Made Sick Story Finder research ledger', actor: { handle: actor.handle, did: actor.did }, exportedAt, notice, posts };
  }
  const api = { exportLedger, notice };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.STORY_LEDGER = api;
})(globalThis);
