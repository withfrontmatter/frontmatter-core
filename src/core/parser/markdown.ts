import yaml from "js-yaml";
import { readText } from "../utils/fs.js";
import type { Field, FieldType } from "../ir/types.js";

export type MarkdownParseResult = {
  frontmatter: Record<string, any>;
  fields: Field[];
  body: string;
};

export async function parseMarkdownFile(absPath: string): Promise<MarkdownParseResult> {
  const src = await readText(absPath);

  const { fmRaw, body } = splitFrontmatter(src);
  const frontmatter = fmRaw ? (yaml.load(fmRaw) as any) ?? {} : {};
  const fields = inferFields(frontmatter);

  return { frontmatter: frontmatter ?? {}, fields, body };
}

function splitFrontmatter(src: string): { fmRaw: string | null; body: string } {
  const m = src.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!m) return { fmRaw: null, body: src };
  return { fmRaw: m[1] ?? "", body: m[2] ?? "" };
}

function inferFields(obj: Record<string, any>): Field[] {
  if (!obj || typeof obj !== "object") return [];

  return Object.entries(obj).map(([key, value]) => {
    const t: FieldType =
      typeof value === "string" ? "string" :
      typeof value === "number" ? "number" :
      typeof value === "boolean" ? "boolean" :
      "unknown";

    return { key, type: t, required: false };
  });
}
