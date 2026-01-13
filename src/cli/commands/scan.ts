import { scanProject } from "../../core/index.js";
import { writeJson } from "../../core/utils/fs.js";
import { resolvePath } from "../../core/utils/path.js";

type Args = Record<string, string | boolean>;

export async function cmdScan(args: Args) {
  const root = String(args.root ?? ".");
  const verbose = Boolean(args.verbose ?? false);

  const absRoot = resolvePath(root);
  const outDir = resolvePath(String(args.out ?? `${absRoot}/.frontmatter`));

  const result = await scanProject({ root: absRoot, outDir, verbose });

  await writeJson(`${outDir}/manifest.json`, result.manifest);
  await writeJson(`${outDir}/build.json`, result.build);

  if (result.errors.length) {
    await writeJson(`${outDir}/errors.json`, { errors: result.errors });
    console.error(`❌ Scan completed with ${result.errors.length} error(s).`);
    process.exit(2);
  }

  console.log(`✅ Scan OK. Output: ${outDir}`);
}
