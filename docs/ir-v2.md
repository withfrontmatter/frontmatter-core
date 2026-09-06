# Frontmatter IR v2 (schemaVersion: 3)

This document describes the public contract produced by Frontmatter Core 2.x.

## Stability

The IR is versioned independently from the npm package through
`schemaVersion`. Consumers must reject schema versions they do not support.

For IR v2:
- Backward-compatible additions may introduce new optional fields.
- Renames, removals, required fields, and type changes require a new IR version.

## Migration from IR v1

IR v2 makes `DatasetModel.kind` required:
- `"collection"` identifies YAML whose root value is an array.
- `"config"` identifies YAML whose root value is an object.

The schema version changed from `2` to `3`. Consumers that previously inferred
dataset behavior from `data` should branch on `kind` instead.

## Output files

Frontmatter writes the following to `.frontmatter/`:
- `build.json`: full site model (IR)
- `manifest.json`: file hashes for sync workflows
- `errors.json`: validation errors, if any

Both `build.json` and `manifest.json` use `schemaVersion: 3`.

## build.json (FrontmatterBuild)

Top-level fields:
- `schemaVersion` (`3`): current IR schema version
- `generatedAt` (number): Unix timestamp in milliseconds
- `project.root` (string): absolute project path metadata
- `project.name` (string): project name
- `pages[]` (PageModel)
- `componentsIndex` (map: id to ComponentModel)
- `datasets[]` (DatasetModel)

## PageModel

- `id` (string): stable relative-path identifier
- `route` (string): inferred Astro route
- `file` (string): relative file path
- `components[]` (string[]): directly referenced components
- `fields[]` (Field[])
- `sourceType?` (`"astro" | "markdown"`)

## ComponentModel

- `id` (string): component identifier
- `file` (string): relative path
- `exportedProps[]` (Field[]): extracted component props

## DatasetModel

- `id` (string): dataset identifier, based on its filename by default
- `file` (string): relative path
- `format` (`"yaml"`)
- `kind` (`"collection" | "config"`): root data shape and consumer intent
- `data` (unknown): parsed YAML value, constrained by `kind`
- `hash` (string): content hash

A collection must contain an array. A config must contain a non-null,
non-array object. Other YAML root values are rejected by validation.

## Field

- `key` (string): field name
- `type` (`"string" | "number" | "boolean" | "unknown"`): best-effort type
- `required` (boolean): whether consumers should reject a missing value
- `default?` (string | number | boolean | null): optional fallback
- `rawType?` (string): best-effort original type information
- `source?` (`"astro" | "markdown" | "yaml"`): extraction source

## Notes

- Type extraction is best-effort. Complex TypeScript types may become
  `unknown`.
- Paths are relative to the project root and use `/` separators.
