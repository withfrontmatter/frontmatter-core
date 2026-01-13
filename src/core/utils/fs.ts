import { promises as fs } from "node:fs";
import * as path from "node:path";

export async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function readText(p: string): Promise<string> {
  return fs.readFile(p, "utf8");
}

export async function writeJson(p: string, obj: unknown): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

export async function readJson(p: string): Promise<any> {
  const txt = await readText(p);
  return JSON.parse(txt);
}

export async function listFiles(root: string, filter: (p: string) => boolean): Promise<string[]> {
  const out: string[] = [];
  await walk(root, out, filter);
  return out;
}

async function walk(dir: string, out: string[], filter: (p: string) => boolean): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === ".frontmatter") continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(abs, out, filter);
    else if (ent.isFile() && filter(abs)) out.push(abs);
  }
}
