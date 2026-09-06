export { scan as scanProject } from "./core/scanner.js";

export type {
  ScanOptions,
  ScanResult,
} from "./core/scanner.js";

// IR types (stable contract)
export type {
  FrontmatterBuild,
  FrontmatterManifest,
  FrontmatterError,
  PageModel,
  ComponentModel,
  DatasetModel,
  DatasetKind,
  Field,
  FieldType,
  FieldSource
} from "./core/ir/types.js";

export { validateBuild } from "./core/ir/validate.js";
export { SCHEMA_VERSION } from "./core/ir/schema.js";
