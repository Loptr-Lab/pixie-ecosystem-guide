import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { FOCUS_AREAS, PIXIE_ROLES } from "../src/data.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const buildSource = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const routeManifest = JSON.parse(readFileSync(new URL("../manus-routes.json", import.meta.url), "utf8"));
const roleIds = new Set(PIXIE_ROLES.map((role) => role.id));

assert.equal(PIXIE_ROLES.length, 8, "Keep the eight documented PIXIE contexts.");
assert.equal(roleIds.size, PIXIE_ROLES.length, "PIXIE role IDs should be unique.");
assert.equal(FOCUS_AREAS.length, 8, "Show the eight creative areas in the supplied ecosystem vision.");
assert.deepEqual(FOCUS_AREAS, ["Development & integration", "Games & interactive worlds", "Art & design", "Storytelling", "Accessibility", "Consent & privacy", "Testing & learning", "Community"]);

for (const role of PIXIE_ROLES) {
  assert.ok(role.name && role.project && role.stage && role.summary && role.boundary, `${role.id} should explain its role and limits.`);
  assert.ok(role.links.length > 0, `${role.id} needs at least one source or way to explore.`);
  for (const link of role.links) assert.ok(link.url.startsWith("https://"), `${role.id} links must use HTTPS.`);
}

const discovery = PIXIE_ROLES.find((role) => role.id === "discovery");
assert.ok(discovery.stage.includes("review pending"), "Do not call the Public Discovery pilot externally verified.");
assert.ok(discovery.boundary.includes("remain open"), "Keep its external review gaps visible.");
const holdings = PIXIE_ROLES.find((role) => role.id === "holdings");
assert.ok(holdings.stage.includes("device review open"), "Keep device acceptance distinct from implementation.");
assert.ok(holdings.summary.includes("18 October 2026"), "Date the source/live-page review without claiming device acceptance.");
assert.ok(!holdings.links.some((link) => link.label.toLowerCase().startsWith("try")), "Do not invite visitors to try the non-working Holdings prototype.");
const readAloud = PIXIE_ROLES.find((role) => role.id === "read-aloud");
assert.equal(readAloud.stage, "Code reference", "GitHub source code is not a live browser example.");
assert.ok(readAloud.summary.includes("not a live"), "Explain that the read-aloud source is not a live demo.");
assert.ok(readAloud.boundary.includes("not a complete buildable Unity game"), "Do not imply there is a completed playable Unity game.");
assert.ok(readAloud.links.some((link) => link.label === "View the read-aloud code"), "Label the read-aloud GitHub link as source code.");
const learning = PIXIE_ROLES.find((role) => role.id === "learning");
assert.equal(learning.stage, "Written learning track", "Represent Training as guide material, not a running app.");
assert.ok(learning.summary.includes("six proposed practice exercises"), "Describe the written exercise track as proposals, not completed lessons.");
assert.ok(learning.boundary.includes("out-of-world"), "Keep Training distinct from canon and live teaching.");
assert.ok(learning.links.some((link) => link.url === "https://github.com/Loptr-Lab/training/blob/main/docs/PIXIE_ANNOUNCER_TRACK.md"), "Link to the existing PIXIE Announcer track.");
assert.ok(learning.links.some((link) => link.url === "https://kentcdodds.com/courses"), "Link to the existing external course catalog.");
const duet = PIXIE_ROLES.find((role) => role.id === "duet");
assert.ok(duet.stage.includes("fixed-answer"), "Do not portray DUET helper code as a general AI assistant.");
assert.ok(duet.boundary.includes("DUET only"), "Keep DUET's helper project-specific.");
const codex = PIXIE_ROLES.find((role) => role.id === "codex");
assert.equal(codex.stage, "Public development edition", "The public Codex site is not a private preview.");
assert.ok(codex.links.some((link) => link.url === "https://codex.loptrlab.com/"), "Link directly to the public Codex site.");
assert.ok(codex.boundary.includes("no orders or support payments are open"), "Preserve the Codex site's current sales boundary.");

assert.ok(html.includes("id=\"origin\""), "Include the published story source in the guide.");
assert.ok(html.includes("https://pixie.pckt.blog/pixie-9ues7zd"), "Link directly to the owner-identified story treatment.");
assert.ok(html.includes("further development of that project should remain offline"), "Preserve the origin post's offline-development boundary.");
assert.ok(html.includes("does not identify itself as part of"), "Do not assert that the origin treatment is 50 Ways canon.");
assert.ok(html.includes("id=\"why-fractured\""), "Explain why the project appears in many parts.");
assert.ok(html.toLowerCase().includes("two different kinds of “scattered”"), "Distinguish the transmedia story method from real implementation separation.");
assert.ok(html.includes("not an ARG clue, a live PIXIE assistant, or a new project directory"), "Do not duplicate the existing project catalog.");
assert.ok(html.includes("not a complete playable experience"), "Do not imply the ARG is complete.");
assert.ok(html.includes("freeCodeCamp’s contribution-led learning model"), "Preserve the owner-provided learning-model inspiration.");
assert.ok(html.includes("VIKI is the warning, not the architecture"), "Use VIKI as a caution, not a software capability claim.");
assert.ok(html.includes("not PIXIE’s character or proof that all projects are connected"), "Distinguish MCP from PIXIE's character and shared access.");
assert.ok(html.includes("diversity, equity and inclusion (DEI)"), "Name the owner's wider inclusion themes in plain language.");
assert.ok(html.includes("digital divide has been solved"), "Avoid claiming the prototypes solve access inequalities.");
assert.ok(html.includes("https://www.unesco.org/en/gender-equality/education/digital-divide"), "Link the wider gender-and-digital-skills context to UNESCO.");
assert.ok(html.includes("https://ibloud.github.io/collaborate/"), "Link to the existing collaboration pathways.");
assert.ok(html.includes("voluntary and unpaid"), "Disclose the current participation status.");
assert.ok(html.includes("does not promise employment, ownership, academic credit, or future pay"), "Do not imply guaranteed compensation or work.");
assert.ok(html.includes("https://github.com/Loptr-Lab/pixie-ecosystem-guide/issues/new"), "Send feedback to the approved guide repository, not the DUET repository.");
assert.ok(html.includes("anyone can read"), "Tell visitors that feedback is public.");
assert.ok(html.includes("need a GitHub account to post"), "Disclose the public feedback account requirement.");
assert.ok(html.includes("GitHub Pages may log visitor IP addresses"), "Disclose host-level visitor logging.");
assert.ok(html.includes('name="robots" content="noindex, nofollow"'), "Keep the public testing preview out of search until the custom domain is ready.");
assert.ok(!html.includes("logic101.in"), "Do not cite the Rubik's Cube site as a formal logic source.");

assert.ok(html.indexOf("id=\"origin\"") < html.indexOf("id=\"why-fractured\""), "Show the story source before the ecosystem explanation.");
assert.ok(html.indexOf("id=\"roles\"") < html.indexOf("id=\"contribute\""), "Show project-specific scopes before the contribution invitation.");
assert.ok(html.includes("./assets/pixie-ecosystem.jpeg"), "Reuse the supplied ecosystem visual.");
assert.ok(buildSource.includes("writeFileSync(path.join(output, \"index.html\"), builtHtml)"), "Write a content-bearing built HTML page.");
assert.ok(appSource.includes("grid && grid.children.length === 0"), "Use client-side rendering only as a Preview fallback.");
assert.deepEqual(routeManifest.routes, [{ path: "/", title: "PIXIE across Loptr Lab · Ecosystem Guide" }], "Keep the one-page route manifest aligned with the guide.");

const declaredFontSizes = [...css.matchAll(/\bfont(?:-size)?\s*:\s*([^;]+);/g)]
  .flatMap((declaration) => [...declaration[1].matchAll(/(?<![\w.])(\d+(?:\.\d+)?)px/g)].map((size) => Number(size[1])));
assert.ok(css.includes("font: 18px/1.65 var(--sans)"), "Set plain-text body copy to a comfortable 18px size.");
assert.ok(declaredFontSizes.every((size) => size >= 18), "Keep every explicit text size at or above 18px.");

if (existsSync(new URL("../public/index.html", import.meta.url))) {
  const builtHtml = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  for (const file of ["index.html", "manus-routes.json", "src/app.js", "src/data.js", "src/styles.css", "assets/pixie-ecosystem.jpeg"]) {
    assert.ok(existsSync(new URL(`../public/${file}`, import.meta.url)), `Static output should include ${file}.`);
  }
  assert.ok(builtHtml.includes("The story format and the software map are related"), "Keep the rationale in initial HTML.");
  assert.ok(builtHtml.includes("role-discovery") && builtHtml.includes("role-holdings") && builtHtml.includes("role-learning"), "Build every role card into the initial HTML.");
  assert.ok(builtHtml.includes("Searches public Bluesky posts") && builtHtml.includes("device review open"), "Keep role maturity visible without JavaScript.");
  assert.ok(builtHtml.includes("Read the pilot questions") && builtHtml.includes("voluntary and unpaid"), "Keep concrete contribution guidance in the initial HTML.");
}

console.log(`Project check passed: ${PIXIE_ROLES.length} source-linked roles, accurate story boundaries, contribution disclosures, 18px minimum text, and static content.`);

// The public entry journey must ship complete, with local reading/download assets.
const outputRoot = new URL('../public/', import.meta.url);
if (existsSync(outputRoot)) {
  for (const href of [...html.matchAll(/href="(\.\/[^"#]+)"/g)].map(m => m[1])) {
    assert.ok(existsSync(new URL(href, outputRoot)), `Packaged link must resolve: ${href}`);
  }
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'Section IDs must be unique.');
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `Local navigation must resolve: ${id}`);
  assert.ok(readFileSync(new URL('assets/make-room-for-the-work.pdf', outputRoot)).subarray(0, 5).equals(Buffer.from('%PDF-')), 'Download must be a PDF.');
}


// Canonical navigation is separate from retained legacy OAuth/MCP migration evidence.
const canonical='https://pixie-project-companion-production.up.railway.app';
const legacy='pixie-project-companion.ibloud-ivxx.chatgpt.site';
for(const file of ['../index.html','../assets/make-room-for-the-work.html','../assets/make-room-for-the-work.pdf']){
 const content=readFileSync(new URL(file,import.meta.url)).toString('latin1').replace(/\\([0-7]{1,3})/g,(_,octal)=>String.fromCharCode(parseInt(octal,8)));
 assert.ok(content.includes(canonical),file+' routes to canonical Companion');assert.ok(!content.includes(legacy),file+' has no active old Site navigation');
}


// Guard the current-main hosting correction during integration.
assert.ok(!/^(?:<{7}|={7}|>{7})/m.test(html), 'Published guide must not contain unresolved merge markers.');
assert.ok(html.includes('The live Companion runs on Railway.'), 'Keep the published Railway hosting disclosure.');
assert.ok(!html.includes('separately hosted on ChatGPT'), 'Do not restore obsolete Companion hosting language.');
