import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  SCHEMA_VERSION,
  scanProject,
  validateBuild,
} from "../dist/index.js";

test("scanner emits schema v3 and classifies YAML datasets", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "frontmatter-core-ir-v2-"));

  try {
    const dataDir = path.join(root, "src/data");
    await mkdir(dataDir, { recursive: true });
    await writeFile(
      path.join(dataDir, "config.yml"),
      "site:\n  name: Example\n",
    );
    await writeFile(
      path.join(dataDir, "works.yml"),
      "- title: First\n- title: Second\n",
    );

    const result = await scanProject({ root, outDir: path.join(root, "output") });
    const datasets = Object.fromEntries(
      result.build.datasets.map(({ id, kind }) => [id, kind]),
    );

    assert.equal(SCHEMA_VERSION, 3);
    assert.equal(result.build.schemaVersion, SCHEMA_VERSION);
    assert.equal(result.manifest.schemaVersion, SCHEMA_VERSION);
    assert.deepEqual(datasets, {
      config: "config",
      works: "collection",
    });
    assert.deepEqual(result.errors, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("validator rejects old schemas and mismatched dataset kinds", () => {
  const base = {
    schemaVersion: SCHEMA_VERSION,
    project: { root: "/project", name: "project" },
    pages: [],
    componentsIndex: {},
    datasets: [],
  };

  assert.deepEqual(validateBuild({ ...base, schemaVersion: 2 }), [
    "Unsupported schemaVersion: 2",
  ]);

  assert.deepEqual(
    validateBuild({
      ...base,
      datasets: [
        {
          id: "config",
          file: "src/data/config.yml",
          format: "yaml",
          kind: "collection",
          data: { site: {} },
          hash: "hash",
        },
      ],
    }),
    ["Dataset(config) collection data must be an array"],
  );
});
