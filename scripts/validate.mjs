#!/usr/bin/env node
// Validates the OnTap Pack registry.
//   - index.json <-> packs/<id>/ must be 1:1 (no orphans / missing)
//   - pack.json fields & id regex per docs/pack-spec.md
//   - recomputes each .otpack sha256 and compares against index.json
//   - ensures each .otpack is a pure-Prompt pack (no plugins / scripts)
// Usage: node scripts/validate.mjs [registryRoot]
// Exit code: 0 = ok, 1 = validation errors, 2 = fatal (missing/unreadable index.json)
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';

const ROOT = resolve(process.argv[2] ?? process.cwd());
const INDEX = join(ROOT, 'index.json');
const PACKS = join(ROOT, 'packs');
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const note = (m) => warnings.push(m);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

if (!existsSync(INDEX)) {
  console.error(`FATAL: index.json not found at ${INDEX}`);
  process.exit(2);
}
let index;
try {
  index = JSON.parse(readFileSync(INDEX, 'utf8'));
} catch (e) {
  console.error(`FATAL: index.json is not valid JSON: ${e.message}`);
  process.exit(2);
}
if (index.schema !== 1) fail(`index.schema must be 1 (got ${JSON.stringify(index.schema)})`);
if (!Array.isArray(index.packs)) fail('index.packs must be an array');

const entries = new Map();
for (const p of index.packs ?? []) {
  if (!p || typeof p !== 'object' || !p.id) {
    fail('index entry missing id');
    continue;
  }
  if (entries.has(p.id)) fail(`duplicate index id: ${p.id}`);
  entries.set(p.id, p);
}

const dirIds = new Set(
  existsSync(PACKS)
    ? readdirSync(PACKS).filter((n) => !n.startsWith('.') && statSync(join(PACKS, n)).isDirectory())
    : [],
);

for (const id of dirIds) {
  if (!ID_RE.test(id)) fail(`[${id}] directory name violates id regex ^[a-z0-9]+(-[a-z0-9]+)*$`);
  const dir = join(PACKS, id);
  const metaPath = join(dir, 'pack.json');
  if (!existsSync(metaPath)) {
    fail(`[${id}] missing pack.json`);
    continue;
  }

  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  } catch (e) {
    fail(`[${id}] pack.json invalid JSON: ${e.message}`);
    continue;
  }

  if (meta.id !== id) fail(`[${id}] pack.json id ('${meta.id}') != directory name`);
  if (!ID_RE.test(meta.id ?? '')) fail(`[${id}] pack.json id violates regex`);
  if (!meta.name) fail(`[${id}] pack.json missing name`);
  if (!meta.author) fail(`[${id}] pack.json missing author`);
  if (!Number.isInteger(meta.version) || meta.version < 1) {
    fail(`[${id}] version must be an integer >= 1 (got ${JSON.stringify(meta.version)})`);
  }

  const otpackPath = join(dir, `${id}.otpack`);
  if (!existsSync(otpackPath)) {
    fail(`[${id}] missing ${id}.otpack (filename must equal <id>)`);
    continue;
  }

  let buf;
  try {
    buf = readFileSync(otpackPath);
  } catch (e) {
    fail(`[${id}] cannot read .otpack: ${e.message}`);
    continue;
  }
  const hash = sha256(buf);

  const entry = entries.get(id);
  if (!entry) {
    fail(`[${id}] exists in repo but is missing from index.json`);
  } else {
    if (entry.sha256 !== hash) {
      fail(`[${id}] sha256 mismatch: index=${entry.sha256} actual=${hash}`);
    }
    if (entry.version !== meta.version) {
      fail(`[${id}] version mismatch: index=${entry.version} pack.json=${meta.version}`);
    }
    const expectedDownload = `packs/${id}/${id}.otpack`;
    if (entry.download !== expectedDownload) {
      note(`[${id}] download is "${entry.download}" (convention: "${expectedDownload}")`);
    }
    // P167: governance field types (revoked / securityNotice).
    if (entry.deprecated !== undefined && typeof entry.deprecated !== 'boolean') {
      fail(`[${id}] index.deprecated must be a boolean (got ${JSON.stringify(entry.deprecated)})`);
    }
    if (entry.revoked !== undefined && typeof entry.revoked !== 'boolean') {
      fail(`[${id}] index.revoked must be a boolean (got ${JSON.stringify(entry.revoked)})`);
    }
    if (entry.securityNotice !== undefined && typeof entry.securityNotice !== 'string') {
      fail(`[${id}] index.securityNotice must be a string (got ${JSON.stringify(entry.securityNotice)})`);
    }
  }

  try {
    const names = Object.keys(unzipSync(new Uint8Array(buf)));
    if (!names.includes('manifest.json')) fail(`[${id}] .otpack missing manifest.json`);
    if (!names.includes('prompts.json')) fail(`[${id}] .otpack missing prompts.json`);
    const bad = names.filter(
      (n) => n.startsWith('plugins/') || /\.(py|exe|sh|bat|cmd|ps1|dll|node|jar)$/i.test(n),
    );
    if (bad.length) fail(`[${id}] .otpack contains non-Prompt content: ${bad.join(', ')}`);
  } catch (e) {
    fail(`[${id}] .otpack is not a readable zip: ${e.message}`);
  }
}

for (const id of entries.keys()) {
  if (!dirIds.has(id)) fail(`[${id}] listed in index.json but no packs/${id}/ directory exists`);
}

if (warnings.length) {
  console.warn('WARNINGS:');
  for (const w of warnings) console.warn(`  - ${w}`);
}
if (errors.length) {
  console.error(`\nVALIDATION FAILED (${errors.length} error(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`OK: ${entries.size} pack(s) validated, ${warnings.length} warning(s).`);
