'use strict';

const {
  NOTION_TOOL_NAMES, TITLE_TO_KEY: TITLE_TO_KEY_OBJ, KEY_TO_TITLE,
  VERSIONED_TITLE_PREFIXES,
} = require('./constants.json');
const TITLE_TO_KEY = new Map(Object.entries(TITLE_TO_KEY_OBJ));
// Keys whose pages are versioned: one page per planning-doc version, titled
// "<prefix> - <version>". They accumulate as multi-page links (one entry per
// full title) instead of overwriting a single page.
const VERSIONED = VERSIONED_TITLE_PREFIXES || {};

// Notion MCP tools are named `mcp__<server>__<toolName>`. The server segment
// varies by how the connector was registered (readable name vs claude.ai's
// UUID), but the tool-name suffix is invariant. Match by the suffix so links
// recording works under any server (PRB-01). The single source for these
// suffixes is constants.json `NOTION_TOOL_NAMES`.
function notionToolRegExp(shortName) {
  const escaped = shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^mcp__.+__${escaped}$`);
}

const CREATE_RE = notionToolRegExp(NOTION_TOOL_NAMES.createPages);
const UPDATE_RE = notionToolRegExp(NOTION_TOOL_NAMES.updatePage);

function notionToolKind(toolName) {
  if (typeof toolName !== 'string') return null;
  if (CREATE_RE.test(toolName)) return 'create';
  if (UPDATE_RE.test(toolName)) return 'update';
  return null;
}

function isNotionWriteTool(toolName) {
  return notionToolKind(toolName) !== null;
}

function resolveKey(title) {
  if (typeof title !== 'string') return undefined;
  const t = title.trim();
  const exact = TITLE_TO_KEY.get(t);
  if (exact) return exact;
  // Versioned titles ("기획서 검토 - v0.7") match by prefix. Require the
  // " -" separator so sibling headings like "기획서 검토 결과" never match.
  for (const key of Object.keys(VERSIONED)) {
    const prefix = VERSIONED[key];
    if (t === prefix || t.startsWith(prefix + ' -')) return key;
  }
  return undefined;
}

// A key is multi-page when it has >1 fixed title (draw-data-flow) or it is
// versioned (write-policy-feedback). Multi-page links store { title: pageId }.
function isMultiPageKey(key) {
  const titles = KEY_TO_TITLE[key];
  if (Array.isArray(titles) && titles.length > 1) return true;
  return Object.prototype.hasOwnProperty.call(VERSIONED, key);
}

function normalizeTitle(raw) {
  return typeof raw === 'string' ? raw.trim() : '';
}

function pickTitle(p) {
  return normalizeTitle(p?.properties?.title ?? p?.title ?? p?.name ?? '');
}

function extractPagesFromInput(toolName, toolInput) {
  if (!toolInput) return [];
  const kind = notionToolKind(toolName);
  if (kind === 'create') {
    const raw = Array.isArray(toolInput.pages)
      ? toolInput.pages
      : toolInput.page ? [toolInput.page] : [];
    return raw.map((p) => ({
      title: pickTitle(p),
      markdown: typeof p?.content === 'string' ? p.content : '',
    }));
  }
  if (kind === 'update') {
    const cmd = toolInput?.command;
    let markdown = null;
    if (cmd === 'replace_content' && typeof toolInput?.new_str === 'string') {
      markdown = toolInput.new_str;
    } else if (cmd === 'update_content' && Array.isArray(toolInput?.content_updates)) {
      markdown = toolInput.content_updates
        .map((u) => (typeof u?.new_str === 'string' ? u.new_str : ''))
        .join('\n');
    }
    const title = normalizeTitle(toolInput?.properties?.title ?? toolInput?.title ?? '');
    return [{ title, markdown }];
  }
  return [];
}

// Recover a Notion page id (32 hex, dashed or dashless) from free text such as
// a page URL — the last resort when the envelope carries prose, not JSON.
const NOTION_ID_RE = /[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i;

function idsFromText(text) {
  if (typeof text !== 'string') return [];
  try {
    const ids = extractPageIds(JSON.parse(text));
    if (ids.length) return ids;
  } catch { /* not JSON — fall through to id-in-text recovery */ }
  const m = text.match(NOTION_ID_RE);
  return m ? [m[0]] : [];
}

// The harness wraps an MCP tool_response in a content envelope before it reaches
// the PostToolUse hook, so the page id is not at the top level. Unwrap the
// envelope (content[].text holds the real payload, often JSON-as-string), then
// read whichever array/scalar shape create-pages or update-page actually used.
function extractPageIds(toolResponse) {
  let r = toolResponse;
  if (typeof r === 'string') {
    try { r = JSON.parse(r); } catch { return idsFromText(toolResponse); }
  }
  if (!r || typeof r !== 'object') return [];
  // MCP content envelope: { content: [{ type: 'text', text: '…' }] }
  if (Array.isArray(r.content) && r.content.length) {
    for (const block of r.content) {
      const ids = idsFromText(block?.text);
      if (ids.length) return ids;
    }
  }
  for (const arr of [r.results, r.pages, r.data]) {
    if (Array.isArray(arr) && arr.length) {
      const ids = arr.map((x) => x?.id ?? x?.page_id).filter(Boolean);
      if (ids.length) return ids;
    }
  }
  const single = r.id ?? r.page_id;
  return single ? [single] : [];
}

module.exports = {
  NOTION_TOOL_NAMES,
  isNotionWriteTool,
  notionToolKind,
  TITLE_TO_KEY,
  KEY_TO_TITLE,
  VERSIONED_TITLE_PREFIXES: VERSIONED,
  resolveKey,
  isMultiPageKey,
  extractPagesFromInput,
  extractPageIds,
};
