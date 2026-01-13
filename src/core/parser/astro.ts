import { readText } from "../utils/fs.js";

/**
 * V1 parser:
 * - Extract exported props from frontmatter script:
 *   export interface Props { title: string; ... }
 *   OR
 *   const { title = "x" } = Astro.props;
 *
 * - Detect used components by tag names in markup: <Hero ... />
 *
 * This is intentionally minimal; we can swap to an AST-based parser later
 * without breaking the IR.
 */

export type FieldType = "string" | "number" | "boolean" | "unknown";

export type ExportedProp = {
  key: string;
  type: FieldType;
  required: boolean;
  default?: string | number | boolean | null;
};

export type AstroParseResult = {
  exportedProps: ExportedProp[];
  usedComponents: string[];
};

export async function parseAstroFile(absPath: string): Promise<AstroParseResult> {
  const src = await readText(absPath);

  const frontmatter = extractFrontmatter(src);
  const markup = removeFrontmatter(src);

  const exportedProps: ExportedProp[] = [
    ...extractPropsInterface(frontmatter),
    ...extractAstroPropsDestructuring(frontmatter),
  ];

  // de-dupe by key, keep first occurrence
  const seen = new Set<string>();
  const uniq = exportedProps.filter((p) => {
    if (seen.has(p.key)) return false;
    seen.add(p.key);
    return true;
  });

  const usedComponents = extractUsedComponents(markup);

  return { exportedProps: uniq, usedComponents };
}

function extractFrontmatter(src: string): string {
  const m = src.match(/^---\s*([\s\S]*?)\s*---/);
  return m?.[1] ?? "";
}

function removeFrontmatter(src: string): string {
  return src.replace(/^---\s*[\s\S]*?\s*---\s*/m, "");
}

function extractPropsInterface(frontmatter: string): ExportedProp[] {
  // export interface Props { title: string; count?: number; }
  const m = frontmatter.match(/export\s+interface\s+Props\s*{([\s\S]*?)}/m);
  if (!m) return [];

  const body = m[1]!;
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));

  const out: ExportedProp[] = [];

  for (const line of lines) {
    // title: string;
    // count?: number;
    const mm = line.match(/^([A-Za-z_][\w]*)\s*(\?)?\s*:\s*([^;]+)\s*;?/);
    if (!mm) continue;

    const key = mm[1]!;
    const optional = Boolean(mm[2]);
    const typeRaw = mm[3]!.trim();

    out.push({
      key,
      type: mapTsType(typeRaw),
      required: !optional,
    });
  }

  return out;
}

function extractAstroPropsDestructuring(frontmatter: string): ExportedProp[] {
  // const { title = "Hello", published = false } = Astro.props;
  const m = frontmatter.match(/const\s*{\s*([\s\S]*?)\s*}\s*=\s*Astro\.props\s*;/m);
  if (!m) return [];

  const inside = m[1]!;
  // naive split by commas (V1)
  const parts = inside
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const out: ExportedProp[] = [];

  for (const part of parts) {
    // title = "Hello"
    // count = 3
    // enabled = true
    // title (no default)
    const mm = part.match(/^([A-Za-z_][\w]*)\s*(?:=\s*([\s\S]+))?$/);
    if (!mm) continue;

    const key = mm[1]!;
    const defRaw = mm[2]?.trim();

    if (defRaw == null) {
      out.push({ key, type: "unknown", required: false });
      continue;
    }

    const def = parseLiteral(defRaw);
    out.push({
      key,
      type: typeof def === "string" ? "string" : typeof def === "number" ? "number" : typeof def === "boolean" ? "boolean" : "unknown",
      required: false,
      default: def as any,
    });
  }

  return out;
}

function extractUsedComponents(markup: string): string[] {
  // find tags that start with capital letter: <Hero ...>
  const re = /<([A-Z][A-Za-z0-9_]*)\b/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(markup))) {
    set.add(m[1]!);
  }
  return [...set.values()];
}

function mapTsType(typeRaw: string): FieldType {
  const t = typeRaw.replace(/\s+/g, "");
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "unknown";
}

function parseLiteral(raw: string): string | number | boolean | null {
  // strip trailing commas
  const v = raw.replace(/,\s*$/, "").trim();

  // string (simple quotes or double)
  const s = v.match(/^["']([\s\S]*)["']$/);
  if (s) return s[1]!;

  // boolean
  if (v === "true") return true;
  if (v === "false") return false;

  // number
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);

  // null
  if (v === "null") return null;

  // fallback: keep as string representation (unknown)
  return v;
}
