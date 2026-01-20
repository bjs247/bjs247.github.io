// Tiny DOM helpers (no framework)

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v === false || v === null || v === undefined) continue;
    else node.setAttribute(k, String(v));
  }
  for (const child of (Array.isArray(children) ? children : [children])) {
    if (child === null || child === undefined) continue;
    if (typeof child === "string") node.appendChild(document.createTextNode(child));
    else node.appendChild(child);
  }
  return node;
}

export function text(str) {
  return document.createTextNode(str);
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function qs(sel, root = document) {
  return root.querySelector(sel);
}

export function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

export function formatPercent(x) {
  if (!Number.isFinite(x)) return "—";
  return `${Math.round(x)}%`;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
