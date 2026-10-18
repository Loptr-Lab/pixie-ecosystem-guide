import { FOCUS_AREAS, PIXIE_ROLES } from "./data.js";

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function safeExternalLink(label, url, className = "") {
  if (typeof url !== "string" || !url.startsWith("https://")) return null;
  const link = element("a", className, label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function renderFocusAreas() {
  const list = document.querySelector("#focus-list");
  list.replaceChildren(...FOCUS_AREAS.map((area, index) => {
    const item = element("li", "focus-item");
    item.append(element("span", "focus-number", String(index + 1).padStart(2, "0")));
    item.append(element("span", "focus-name", area));
    return item;
  }));
}

function renderRole(role) {
  const card = element("article", "role-card");
  card.id = `role-${role.id}`;

  const header = element("div", "role-card-heading");
  header.append(element("span", "stage-label", role.stage));
  header.append(element("span", "role-spark", "✳"));
  card.append(header);

  card.append(element("h3", "", role.name));
  card.append(element("p", "role-project", role.project));
  card.append(element("p", "role-summary", role.summary));

  const boundary = element("p", "role-boundary");
  boundary.append(element("strong", "", "A helpful limit: "));
  boundary.append(document.createTextNode(role.boundary));
  card.append(boundary);

  const links = element("div", "role-links");
  for (const [index, item] of role.links.entries()) {
    const link = safeExternalLink(item.label, item.url, index === 0 ? "role-primary-link" : "role-secondary-link");
    if (link) links.append(link);
  }
  card.append(links);
  return card;
}

function start() {
  const focusList = document.querySelector("#focus-list");
  if (focusList && focusList.children.length === 0) renderFocusAreas();

  const grid = document.querySelector("#role-results");
  if (grid && grid.children.length === 0) grid.replaceChildren(...PIXIE_ROLES.map(renderRole));

  const count = document.querySelector("#roles-count");
  if (count) count.textContent = String(PIXIE_ROLES.length);
}

start();
