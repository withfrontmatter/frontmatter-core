import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";

export async function hashFile(path: string): Promise<string> {
  const buf = await fs.readFile(path);
  const h = createHash("sha256").update(buf).digest("hex");
  return h;
}
