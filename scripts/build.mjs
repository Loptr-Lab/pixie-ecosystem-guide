import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FOCUS_AREAS, PIXIE_ROLES } from "../src/data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderFocusArea(area, index) {
  return `<li class="focus-item"><span class="focus-number">${String(index + 1).padStart(2, "0")}</span><span class="focus-name">${escapeHtml(area)}</span></li>`;
}

function renderRole(role) {
  const links = role.links.map((item, index) => {
    const className = index === 0 ? "role-primary-link" : "role-secondary-link";
    return `<a class="${className}" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`;
  }).join("");

  return `<article class="role-card" id="role-${escapeHtml(role.id)}"><div class="role-card-heading"><span class="stage-label">${escapeHtml(role.stage)}</span><span class="role-spark" aria-hidden="true">✳</span></div><h3>${escapeHtml(role.name)}</h3><p class="role-project">${escapeHtml(role.project)}</p><p class="role-summary">${escapeHtml(role.summary)}</p><p class="role-boundary"><strong>A helpful limit: </strong>${escapeHtml(role.boundary)}</p><div class="role-links">${links}</div></article>`;
}

rmSync(output, { recursive: true, force: true });
mkdirSync(path.join(output, "src"), { recursive: true });
mkdirSync(path.join(output, "assets"), { recursive: true });

const sourceHtml = readFileSync(path.join(root, "index.html"), "utf8");
const focusPlaceholder = '<ul class="focus-list" id="focus-list" aria-label="Creative areas in the Loptr Lab ecosystem"></ul>';
const rolePlaceholder = '<div class="role-grid" id="role-results" aria-label="PIXIE roles across separate projects"></div>';
if (!sourceHtml.includes(focusPlaceholder) || !sourceHtml.includes(rolePlaceholder)) {
  throw new Error("Could not find the focus-area or role-card placeholder in index.html.");
}

const builtHtml = sourceHtml
  .replace(focusPlaceholder, `<ul class="focus-list" id="focus-list" aria-label="Creative areas in the Loptr Lab ecosystem">${FOCUS_AREAS.map(renderFocusArea).join("")}</ul>`)
  .replace(rolePlaceholder, `<div class="role-grid" id="role-results" aria-label="PIXIE roles across separate projects">${PIXIE_ROLES.map(renderRole).join("")}</div>`);
writeFileSync(path.join(output, "index.html"), builtHtml);

for (const file of ["manus-routes.json", "logo.svg"]) {
  copyFileSync(path.join(root, file), path.join(output, file));
}
for (const file of ["app.js", "data.js", "styles.css"]) {
  copyFileSync(path.join(root, "src", file), path.join(output, "src", file));
}
copyFileSync(path.join(root, "assets", "pixie-ecosystem.jpeg"), path.join(output, "assets", "pixie-ecosystem.jpeg"));

console.log("Static PIXIE guide built in public/ with the page content present in its initial HTML.");
