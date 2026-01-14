<p align="center">
  <img src="https://github.com/withfrontmatter/.github/blob/main/frontmatter-logo-512.png" width="120" />
</p>

<h1 align="center">Frontmatter Core</h1>

<p align="center">Zero-runtime CMS bridge for Astro → Headless CMS</p>
<br><br>

## What is this

Frontmatter Core is a developer tool that turns your Astro project into a CMS-ready data model.

It scans your Astro files, Markdown pages and YAML datasets, and produces a clean, structured representation of:

- Pages
- Editable fields
- Components
- Data collections

This representation is written into a `.frontmatter/` folder and can then be consumed by adapters (Grav, Kirby, Craft, Strapi, etc.) to generate CMS themes, blueprints and content structures.

Frontmatter does **not** run in production.
It is a **build-time tool**.

Your Astro site remains fast, static and framework-free.<br>
The CMS only edits data.<br>
Your design stays untouched.<br>

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

## Commercial tiers

This repository is open-source.

Paid editions exist that include:

- Grav theme generator
- Grav blueprint generator
- Grav Sync engine

Other CMS adapters may exist in the future, but Grav is the reference implementation.

## License

MIT

## Status

This is an early developer release.<br>
The internal schema is stable.<br>
Adapters can safely be built on top of it.<br>
