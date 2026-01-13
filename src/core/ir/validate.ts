import type { PageModel, Field, DatasetModel } from "./types.js";

export function validateBuild(build: any): string[] {
  const errors: string[] = [];

  if (!build || typeof build !== "object") return ["Build is not an object."];
  if (build.schemaVersion !== 2) errors.push(`Unsupported schemaVersion: ${String(build.schemaVersion)}`);

  if (!build.project?.root) errors.push("Missing project.root");
  if (!build.project?.name) errors.push("Missing project.name");
  if (!Array.isArray(build.pages)) errors.push("pages must be an array");
  if (!build.componentsIndex || typeof build.componentsIndex !== "object") {
    errors.push("componentsIndex must be an object");
  }
  if (!Array.isArray(build.datasets)) errors.push("datasets must be an array");

  if (Array.isArray(build.pages)) {
    for (const p of build.pages as PageModel[]) errors.push(...validatePage(p));
  }

  if (Array.isArray(build.datasets)) {
    for (const d of build.datasets as DatasetModel[]) errors.push(...validateDataset(d));
  }

  return errors;
}

function validatePage(p: PageModel): string[] {
  const e: string[] = [];
  if (!p?.id) e.push("Page missing id");
  if (!p?.file) e.push(`Page(${p?.id ?? "?"}) missing file`);
  if (!p?.route) e.push(`Page(${p?.id ?? "?"}) missing route`);
  if (p.sourceType && p.sourceType !== "astro" && p.sourceType !== "markdown") {
    e.push(`Page(${p.id}) invalid sourceType: ${String(p.sourceType)}`);
  }

  if (!Array.isArray(p?.fields)) e.push(`Page(${p?.id ?? "?"}) fields must be an array`);
  if (Array.isArray(p?.fields)) {
    for (const f of p.fields as Field[]) e.push(...validateField(p.id, f));
  }
  return e;
}

function validateField(pageId: string, f: Field): string[] {
  const e: string[] = [];
  if (!f?.key) e.push(`Page(${pageId}) field missing key`);
  if (!f?.type) e.push(`Page(${pageId}) field(${f?.key ?? "?"}) missing type`);
  if (typeof f?.required !== "boolean") e.push(`Page(${pageId}) field(${f?.key ?? "?"}) required must be boolean`);
  return e;
}

function validateDataset(d: DatasetModel): string[] {
  const e: string[] = [];
  if (!d?.id) e.push("Dataset missing id");
  if (!d?.file) e.push(`Dataset(${d?.id ?? "?"}) missing file`);
  if (d.data === undefined) {
    e.push(`Dataset(${d.id}) missing data`);
  }
  if (d?.format !== "yaml") e.push(`Dataset(${d?.id ?? "?"}) unsupported format: ${String(d?.format)}`);
  if (typeof d?.hash !== "string" || !d.hash) e.push(`Dataset(${d?.id ?? "?"}) missing hash`);
  return e;
}
