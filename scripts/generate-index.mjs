#!/usr/bin/env node
// Rebuilds index.json deterministically from packs/<id>/pack.json + the real
// .otpack sha256. Use this instead of editing index.json by hand.
// Usage: node scripts/generate-index.mjs [registryRoot]
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = resolve(process.argv[2] ?? process.cwd());
const PACKS = join(ROOT, 'packs');
const REPO = 'https://gitee.com/ontap-packs/packs';
const BRANCH = 'master';

const sha256File = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

// Preserve governance fields (e.g. deprecated) that live only in index.json,
// so regeneration does not silently un-delist a pack.
const existing = new Map();
const indexPath = join(ROOT, 'index.json');
if (existsSync(indexPath)) {
  try {
    for (const e of JSON.parse(readFileSync(indexPath, 'utf8')).packs ?? []) {
      if (e && e.id) existing.set(e.id, e);
    }
  } catch {
    // ignore unreadable existing index; generate fresh
  }
}

const dirs = existsSync(PACKS)
  ? readdirSync(PACKS)
      .filter((n) => !n.startsWith('.') && statSync(join(PACKS, n)).isDirectory())
      .sort()
  : [];

const packs = [];
for (const id of dirs) {
  const dir = join(PACKS, id);
  const metaPath = join(dir, 'pack.json');
  if (!existsSync(metaPath)) {
    console.error(`skip ${id}: no pack.json`);
    continue;
  }
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  const otpackPath = join(dir, `${id}.otpack`);
  if (!existsSync(otpackPath)) {
    console.error(`skip ${id}: no ${id}.otpack`);
    continue;
  }

  const prior = existing.get(id);
  const entry = {
    id,
    name: meta.name,
    author: meta.author,
    version: meta.version,
    description: meta.description ?? '',
    tags: meta.tags ?? [],
    categories: meta.categories ?? [],
    download: `packs/${id}/${id}.otpack`,
    sha256: sha256File(otpackPath),
    homepage: `${REPO}/tree/${BRANCH}/packs/${id}`,
    // Delisting flag is governance data (kept in index.json, not pack.json).
    deprecated: meta.deprecated ?? prior?.deprecated ?? false,
    // P167: emergency revocation is governance data too — must survive regeneration.
    revoked: meta.revoked ?? prior?.revoked ?? false,
  };
  // minAppVersion omitted (not null) when absent, per pack-spec.
  if (meta.minAppVersion) entry.minAppVersion = meta.minAppVersion;
  // P167: optional security notice (string); omitted when absent.
  const securityNotice = meta.securityNotice ?? prior?.securityNotice;
  if (securityNotice) entry.securityNotice = securityNotice;
  packs.push(entry);
}

const index = {
  schema: 1,
  // ISO-8601 UTC with a trailing Z (no milliseconds), matching the registry convention.
  updatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  packs,
};

writeFileSync(join(ROOT, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
console.log(`index.json written: ${packs.length} pack(s).`);
