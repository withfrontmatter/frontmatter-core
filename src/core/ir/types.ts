export type FieldType = "string" | "number" | "boolean" | "unknown";

export type Field = {
  key: string;
  type: FieldType;
  required: boolean;
  default?: string | number | boolean | null;
};

export type PageModel = {
  id: string;       // rel path
  route: string;    // inferred route
  file: string;     // rel path
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
