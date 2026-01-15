<p align="center">
  <img src="https://github.com/withfrontmatter/.github/blob/main/frontmatter-logo-512.png" width="120" />
</p>

<h1 align="center">Frontmatter Core</h1>

<p align="center">Zero-runtime CMS bridge for Astro → CMS adapters</p>
<br><br>

## What is this

Frontmatter Core is a developer tool that turns your Astro project into a CMS-ready data model.

It scans your Astro files, Markdown pages and YAML datasets, and produces a clean, structured representation of:

- Pages
- Editable fields
- Components
- Data collections

This representation is written into a `.frontmatter/` folder and can then be consumed by adapters (for example: flat-file CMS or headless CMS implementations) to generate CMS themes, blueprints, and content structures.

Frontmatter does **not** run in production.
It is a **build-time tool**.

Your Astro site remains fast, static and framework-free.<br>
The CMS only edits data.<br>
Your design stays untouched.<br>

<p align="center">
  <img src="https://github.com/withfrontmatter/.github/blob/main/frontmatter-core-diagram.png" />
</p>

---

### Scope

This repository contains the core engine only.

It builds a stable, versioned Intermediate Representation (IR).<br>
Adapters, reference implementations, and examples live outside the core.

---

## Stability

Frontmatter Core exposes a versioned Intermediate Representation (IR).

IR v1 is stable (schemaVersion: 2).
- Backward-compatible additions only.
- Breaking changes will only happen in a future IR v2 and will be documented.


## What it does

Frontmatter Core reads:

- `.astro` files (components and pages)
- `.md`, `.mdoc`, `.markdown` pages
- `.yml` and `.yaml` datasets (in src/data)

From those files it extracts:

### From Astro

- Exported props from `export interface Props`
- Props destructured from `Astro.props`
- Component usage (for example: `<Hero />`, `<Gallery />`)

### From Markdown

- YAML frontmatter fields

### From YAML datasets

- Structured collections (lists and objects)

It builds a unified **Internal Representation (IR)** describing your site.

### Field rules

Each extracted field includes:

- `key`: the field name
- `type`: `string | number | boolean | unknown` (best-effort)
- `required`: when `true`, missing values should be treated as validation errors by consumers
- `default` (optional): a fallback value when provided
- `rawType` (optional): best-effort original type information (e.g. TypeScript annotation)
- `source` (optional): where the field was extracted from (`astro`, `markdown`, `yaml`)

Frontmatter Core itself does not enforce content presence at runtime; required is part of the data contract.

Type extraction is best-effort. Complex TypeScript types may be reduced to `unknown`.

### Component usage

For each page, `components[]` lists the components directly referenced in that page file (non-transitive).<br>
It does not include components used inside other components or layouts.<br>
`componentsIndex` is an index of parsed .astro files (components and pages).

## What you get

After running:

`frontmatter scan`


You get:
```
.frontmatter/
  build.json     → the full site model
  manifest.json  → file hashes for sync
  errors.json    → validation errors if any
```

This is the source of truth for adapters.

## Why this exists

Most CMS workflows destroy frontend quality.

You design in Figma, then re-build badly in WordPress.

Frontmatter flips the workflow:

You design and build in Astro first.<br>
Then you expose only the data to a CMS.

Developers own structure and layout.<br>
Editors only touch content.

This is not a site builder.<br>
This is not a WYSIWYG.<br>
This is a data layer.

## Install

From the repository root:
```
pnpm install
pnpm build
pnpm link --global
```

This exposes the CLI:

`frontmatter`

or

`fm`

## Usage

In any Astro project:

`frontmatter scan`

This creates `.frontmatter/` in the project.

You can validate the output:

`frontmatter validate`

## Supported inputs
### Pages

- `src/pages/*.astro`
- `src/pages/*.md`
- `src/pages/*.mdoc`
- `src/pages/*.markdown`

### Components

`src/components/*.astro`

### Datasets

- `src/data/*.yml`
- `src/data/*.yaml`

## Core philosophy

Astro controls:

- Layout
- Markup
- SEO
- Components

CMS controls:

- Text
- Images
- Lists
- Metadata

They never fight.

## What this repo is

This is the **core engine only**.

It does **not**:

- Generate CMS themes
- Talk to Grav
- Render anything

Adapters do that.

## Non-goals

Frontmatter Core does not:
- Act as a CMS
- Provide a user interface
- Manage content, users or permissions
- Guarantee compatibility with any CMS
- Provide hosting, syncing or deployment

Frontmatter Core produces a data contract.
What you build on top of it is your responsibility.

## Commercial editions

This repository contains the core engine only.

Commercial editions may exist that package:
- Reference adapters
- Templates
- Scripts and tooling around the core

These editions do not change the core behavior.
They provide convenience and packaging, not managed services.

No compatibility, support or upgrade guarantees are implied.

## Support

This project is provided as-is.

There is no guaranteed support, SLA, or compatibility promise.
Issues and discussions are community-driven.

## License

MIT

## Status

This is an early developer release.<br>
The internal schema is versioned and designed to be stable.<br>
Breaking changes, if any, will be explicit and documented.<br>

