import { scan } from "./scanner.js";
import type { ScanOptions, ScanResult } from "./scanner.js";

export async function scanProject(opts: ScanOptions): Promise<ScanResult> {
  return scan(opts);
}
