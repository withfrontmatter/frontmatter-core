#!/usr/bin/env node
import { cmdScan } from "./commands/scan.js";
import { cmdValidate } from "./commands/validate.js";
import { cmdExport } from "./commands/export.js";

type Args = Record<string, string | boolean>;

function parseArgs(argv: string[]): { command: string; args: Args } {
  const [, , command = "", ...rest] = argv;
  const args: Args = {};
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i]!;
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = rest[i + 1];

    // boolean flags
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return { command, args };
}

function help() {
  console.log(`Frontmatter Core

Usage:
  frontmatter scan --root <path>
  frontmatter validate --root <path>
  frontmatter export --root <path> --out <path>

Options:
  --root     Project root (default: .)
  --out      Output dir (default: <root>/.frontmatter)
  --verbose  Verbose logs
`);
}

async function main() {
  const { command, args } = parseArgs(process.argv);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    help();
    process.exit(0);
  }

  try {
    if (command === "scan") return await cmdScan(args);
    if (command === "validate") return await cmdValidate(args);
    if (command === "export") return await cmdExport(args);

    console.error(`Unknown command: ${command}\n`);
    help();
    process.exit(1);
  } catch (e: any) {
    console.error(e?.message || String(e));
    process.exit(1);
  }
}

main();
