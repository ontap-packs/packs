# OnTap Packs

The OnTap community Prompt Pack registry — browse, install, and share `.otpack` collections.

This repository hosts **pure-Prompt** instruction packs (writing / development / sales /
support / office, etc.). The OnTap client reads `index.json` from this repository to
discover and install packs in one click.

> Phase 0 accepts pure-Prompt content only; packs containing scripts are not supported yet.

## Repository layout

```
.
├── index.json                  # Registry index (the OnTap client reads only this file)
├── packs/
│   └── <pack-id>/
│       ├── pack.json           # Pack metadata (human-readable + used to build index)
│       └── <pack-id>.otpack    # The actual pack
├── docs/pack-spec.md           # Field / naming / version / download-URL rules
└── CONTRIBUTING.md             # Contribution guide
```

## Install a Pack

1. Open the OnTap client, go to "Library → Online Packs"
2. Find the pack you want and click "Install"
3. The client downloads the `.otpack` from this repository and verifies its sha256 before installing

Alternatively, download `packs/<pack-id>/<pack-id>.otpack` directly and choose the file
via "Import Pack" in the client.

## Submit a Pack

1. Export a `.otpack` from the OnTap client ("Export as Pack") and prepare `pack.json`
2. Fork this repository, create `packs/<pack-id>/`, and add `pack.json` and `<pack-id>.otpack`
3. Compute the sha256 and update `index.json`
4. Open a Pull Request and wait for review

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/pack-spec.md](./docs/pack-spec.md) for details.

## Index format

`index.json`:

```json
{
  "schema": 1,
  "updatedAt": "2026-09-24T00:00:00Z",
  "packs": [
    {
      "id": "customer-support-zh",
      "name": "Customer Support Replies (Chinese)",
      "author": "your-name",
      "version": 1,
      "description": "High-EQ reply templates for common support scenarios",
      "tags": ["support", "chinese"],
      "categories": ["Sales/Support"],
      "download": "packs/customer-support-zh/customer-support-zh.otpack",
      "sha256": "<64-char hex>",
      "homepage": "https://gitee.com/ontap-packs/packs/tree/master/packs/customer-support-zh",
      "minAppVersion": "1.3.0"
    }
  ]
}
```

- `download` accepts a **relative path** (resolved against the directory of this index) or an **absolute URL**.
- `version` is an **integer** and must be incremented on every update.
