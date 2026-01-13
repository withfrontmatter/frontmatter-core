import * as path from "node:path";

export function resolvePath(p: string): string {
  return path.resolve(process.cwd(), p);
}

export function inferRouteFromPage(absPath: string): string {
  // .../src/pages/index.astro -> /
  // .../src/pages/about.mdoc -> /about
  // .../src/pages/blog/index.md -> /blog
  const norm = absPath.replace(/\\/g, "/");
  const idx = norm.indexOf("/src/pages/");
  if (idx === -1) return "/";

  let rel = norm.slice(idx + "/src/pages/".length);

  // strip known extensions
  rel = rel.replace(/\.(astro|md|mdoc|markdown)$/i, "");

  if (rel === "index") return "/";
  if (rel.endsWith("/index")) rel = rel.slice(0, -"/index".length);

  return "/" + rel;
}
