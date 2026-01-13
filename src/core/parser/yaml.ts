import yaml from "js-yaml";
import { readText } from "../utils/fs.js";

export type YamlParseResult = {
  data: unknown;
};

export async function parseYamlFile(absPath: string): Promise<YamlParseResult> {
  const src = await readText(absPath);
  const data = yaml.load(src);
  return { data };
}
