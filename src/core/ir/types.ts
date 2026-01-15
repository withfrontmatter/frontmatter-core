export type FieldType = "string" | "number" | "boolean" | "unknown";

export type FieldSource = "astro" | "markdown" | "yaml";

export type Field = {
  key: string;
  type: FieldType;
  required: boolean;
  default?: string | number | boolean | null;

  /**
   * Best-effort original type information (e.g. TS type annotation).
   * Not guaranteed to be present.
   */
  rawType?: string;

  /**
   * Where this field was extracted from.
   */
  source?: FieldSource;
};

export type PageModel = {
  id: string;       // rel path
  route: string;    // inferred route
  file: string;     // rel path

  /**
   * Components directly used in this page file (non-transitive).
   * This does NOT include components used inside other components or layouts.
   */
  components: string[];

  fields: Field[];
  sourceType?: "astro" | "markdown";
};

export type ComponentModel = {
  id: string;
  file: string;
  exportedProps: Field[];
};

export type DatasetModel = {
  id: string;          // dataset id (basename by default)
  file: string;        // rel path
  format: "yaml";
  data: unknown;       // array | object
  hash: string;        // content hash (or file hash)
};

export type FrontmatterBuild = {
  schemaVersion: 2;
  generatedAt: number;
  project: { root: string; name: string };
  pages: PageModel[];
  componentsIndex: Record<string, ComponentModel>;
  datasets: DatasetModel[];
};

export type FrontmatterManifest = {
  schemaVersion: 2;
  generatedAt: number;
  project: { root: string; name: string };
  files: Record<string, string>; // rel path -> hash
};

export type FrontmatterError = {
  message: string;
};
