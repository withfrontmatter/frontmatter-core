import { cmdScan } from "./scan.js";

type Args = Record<string, string | boolean>;

/**
 * V1: export == scan (same output)
 * Later: export could support multiple formats or adapters.
 */
export async function cmdExport(args: Args) {
  return cmdScan(args);
}
