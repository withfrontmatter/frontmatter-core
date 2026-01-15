# Frontmatter IR v1 (schemaVersion: 2)

This document describes the public contract produced by Frontmatter Core.

## Stability

The IR is versioned via `schemaVersion`.

For IR v1:
- Backward-compatible additions are allowed (new optional fields).
- Breaking changes (renames/removals/type changes) will only occur in a future IR v2.

## Output files

Frontmatter writes the following to `.frontmatter/`:
- `build.json`: full site model (IR)
- `manifest.json`: file hashes for sync workflows
- `errors.json`: validation errors (if any)

## build.json (FrontmatterBuild)

Top-level fields:
- `schemaVersion` (number): current IR schema version
- `generatedAt` (number): unix timestamp (ms)
- `project.root` (string): absolute project path (metadata; not meant for adapters)
- `project.name` (string): project name
- `pages[]` (PageModel)
- `componentsIndex` (map: id -> ComponentModel)
- `datasets[]` (DatasetModel)

## PageModel

- `id` (string): stable id (relative path)
- `route` (string): inferred route (Astro pages)
- `file` (string): relative file path
- `components[]` (string[]): components directly referenced in the page file (non-transitive)
- `fields[]` (Field[])
- `sourceType?` ("astro" | "markdown")

## ComponentModel

- `id` (string): component id
- `file` (string): relative path
- `exportedProps[]` (Field[]): props extracted from `export interface Props` or `Astro.props` patterns

## DatasetModel

- `id` (string): dataset id (basename by default)
- `file` (string): relative path
- `format` ("yaml")
- `data` (unknown): parsed data (array or object)
- `hash` (string): content hash

## Field

- `key` (string): field name
- `type` ("string" | "number" | "boolean" | "unknown"): best-effort type
- `required` (boolean):
  - `true` means missing values should be treated as validation errors by consumers
  - `false` means optional
- `default?` (string | number | boolean | null): optional fallback
- `rawType?` (string): best-effort original type information (e.g. TS annotation)
- `source?` ("astro" | "markdown" | "yaml"): where the field was extracted from

## Notes

- Type extraction is best-effort. Complex TypeScript types may be reduced to `unknown`.
- Paths are relative to the project root and use `/` separators.
