import { listFiles } from "./utils/fs.js";
import { hashFile } from "./utils/hash.js";
import { parseAstroFile } from "./parser/astro.js";
import { parseMarkdownFile } from "./parser/markdown.js";
import { parseYamlFile } from "./parser/yaml.js";
import { inferRouteFromPage } from "./utils/path.js";
import type { FrontmatterBuild, FrontmatterManifest, FrontmatterError, Field } from "./ir/types.js";
import { validateBuild } from "./ir/validate.js";

export type ScanOptions = {
  root: string;   // absolute
  outDir: string; // absolute (unused in core scan, ok)
  verbose?: boolean;
};

export type ScanResult = {
  manifest: FrontmatterManifest;
  build: FrontmatterBuild;
  errors: FrontmatterError[];
};

const MARKDOWN_EXTS = [".md", ".mdoc", ".markdown"] as const;
const YAML_EXTS = [".yml", ".yaml"] as const;

function normPath(p: string): string {
  return p.replace(/\\/g, "/");
}

function isMarkdown(p: string) {
  const n = normPath(p).toLowerCase();
  return MARKDOWN_EXTS.some((e) => n.endsWith(e));
}

function isYaml(p: string) {
  const n = normPath(p).toLowerCase();
  return YAML_EXTS.some((e) => n.endsWith(e));
}

function isAstro(p: string) {
  const n = normPath(p).toLowerCase();
  return n.endsWith(".astro");
}

/** ignore any segment starting with "_" or "." (drafts, private, etc) */
function shouldIgnorePath(absPath: string): boolean {
  const parts = normPath(absPath).split("/");
  return parts.some((seg) => seg.startsWith("_") || seg.startsWith("."));
}

function astroPropsToFields(
  props: Array<{ key: string; type: any; required: boolean; default?: any; rawType?: string }>
): Field[] {
  return props.map((p) => ({
    key: p.key,
    type: p.type,
    required: p.required,
    default: p.default ?? undefined,
    rawType: p.rawType,
    source: "astro",
  }));
}


export async function scan(opts: ScanOptions): Promise<ScanResult> {
  const { root, verbose } = opts;

  // Track only what we care about (astro + md + yaml)
  const allFiles = await listFiles(root, (p) => {
    const n = normPath(p);
    if (shouldIgnorePath(n)) return false;
    return isAstro(n) || isMarkdown(n) || isYaml(n);
  });

  const srcFiles = allFiles.filter((p) => normPath(p).includes("/src/"));

  // Split by type
  const astroFiles = srcFiles.filter((p) => isAstro(p));
  const mdFiles = srcFiles.filter((p) => isMarkdown(p));
  const yamlFiles = srcFiles.filter((p) => isYaml(p));

  // Hash everything tracked
  const fileHashes: Record<string, string> = {};
  for (const f of srcFiles) {
    fileHashes[rel(root, f)] = await hashFile(f);
  }

  const pages: FrontmatterBuild["pages"] = [];
  const componentsIndex: FrontmatterBuild["componentsIndex"] = {};
  const datasets: FrontmatterBuild["datasets"] = [];

  // 1) Parse all .astro to index components (components + pages)
  for (const absPath of astroFiles) {
    const relPath = rel(root, absPath);
    const parsed = await parseAstroFile(absPath);

    componentsIndex[relPath] = {
      id: relPath,
      file: relPath,
      exportedProps: astroPropsToFields(parsed.exportedProps),
    };

    if (verbose) console.log(`• parsed astro ${relPath}`);
  }

  // 2) Pages from src/pages/* (.astro + markdown)
  const pageFiles = [...astroFiles, ...mdFiles].filter((p) => {
    const n = normPath(p);
    return n.includes("/src/pages/");
  });

  for (const absPath of pageFiles) {
    const relPath = rel(root, absPath);
    const route = inferRouteFromPage(absPath);

    if (isAstro(absPath)) {
      const parsed = await parseAstroFile(absPath);

      const usedComponents = parsed.usedComponents
        .map((name) => resolveComponentPathGuess(root, name))
        .filter(Boolean) as string[];

      pages.push({
        id: relPath,
        route,
        file: relPath,
        components: usedComponents.map((p) => rel(root, p)),
        fields: astroPropsToFields(parsed.exportedProps),
        sourceType: "astro",
      });

      if (verbose) console.log(`• page astro ${relPath} -> ${route}`);
    } else {
      const parsed = await parseMarkdownFile(absPath);

      pages.push({
        id: relPath,
        route,
        file: relPath,
        components: [],
        fields: parsed.fields,
        sourceType: "markdown",
      });

      if (verbose) console.log(`• page md ${relPath} -> ${route}`);
    }
  }

  // 3) Datasets from src/data/* (.yml/.yaml)
  const datasetFiles = yamlFiles.filter((p) => {
    const n = normPath(p);
    return n.includes("/src/data/");
  });

  for (const absPath of datasetFiles) {
    const relPath = rel(root, absPath);
    const id = datasetIdFromPath(relPath);
    const parsed = await parseYamlFile(absPath);

    datasets.push({
      id,
      file: relPath,
      format: "yaml",
      data: parsed.data,
      hash: fileHashes[relPath]!, // reuse file hash
    });

    if (verbose) console.log(`• dataset yaml ${relPath} -> ${id}`);
  }

  const build: FrontmatterBuild = {
    schemaVersion: 2,
    generatedAt: Date.now(),
    project: { root, name: basename(root) },
    pages,
    componentsIndex,
    datasets,
  };

  const validationErrors = validateBuild(build).map((m) => ({ message: m }));
  const errors: FrontmatterError[] = [...validationErrors];

  const manifest: FrontmatterManifest = {
    schemaVersion: 2,
    generatedAt: build.generatedAt,
    project: build.project,
    files: fileHashes,
  };

  return { manifest, build, errors };
}

function datasetIdFromPath(relPath: string): string {
  const file = normPath(relPath).split("/").pop() || relPath;
  return file.replace(/\.(yaml|yml)$/i, "");
}

function basename(p: string): string {
  const s = normPath(p).replace(/\/+$/, "");
  return s.split("/").pop() || "project";
}

function rel(root: string, abs: string): string {
  const r = normPath(root);
  const a = normPath(abs);
  return a.startsWith(r) ? a.slice(r.length).replace(/^\/+/, "") : a;
}

/**
 * Guess: <Hero /> -> src/components/Hero.astro
 * (core V1: volontairement simple)
 */
function resolveComponentPathGuess(root: string, componentName: string): string | null {
  const name = componentName.split(".")[0]!;
  const candidate = `${normPath(root)}/src/components/${name}.astro`;
  return candidate;
}
