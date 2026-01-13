import { readJson, exists } from "../../core/utils/fs.js";
import { resolvePath } from "../../core/utils/path.js";
import { validateBuild } from "../../core/ir/validate.js";

type Args = Record<string, string | boolean>;

export async function cmdValidate(args: Args) {
  const root = resolvePath(String(args.root ?? "."));
  const outDir = resolvePath(String(args.out ?? `${root}/.frontmatter`));
  const buildPath = `${outDir}/build.json`;

  if (!(await exists(buildPath))) {
    console.error(`❌ build.json not found. Run: frontmatter scan --root ${root}`);
    process.exit(2);
  }

  const build = await readJson(buildPath);
  const errors = validateBuild(build);

  if (errors.length) {
    console.error(`❌ Invalid build (${errors.length} error(s))`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(2);
  }

  console.log("✅ Build is valid.");
}
