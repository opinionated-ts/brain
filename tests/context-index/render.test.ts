import { describe, expect, it } from "bun:test";

import type { ContextIndexEntry } from "@/context-tree/types";

import {
  renderTreeToString,
  renderTreeToCompactString,
  renderTreeToMarkdown,
  renderTreeToJSON,
} from "@/context-tree/render";
import { buildContextTree } from "@/context-tree/tree";

// ── Helpers ──────────────────────────────────────────────────────────
function entry(
  partial: Pick<ContextIndexEntry, "folderPath" | "description"> &
    Partial<Omit<ContextIndexEntry, "folderPath" | "description">>,
): ContextIndexEntry {
  return {
    filePath: `${partial.folderPath}/index.instructions.md`,
    bodyContent: "",
    depth: 0,
    ...partial,
  };
}

function build(entries: ContextIndexEntry[]) {
  return buildContextTree(entries);
}

// ── renderTreeToString ───────────────────────────────────────────────
describe("renderTreeToString", () => {
  it("returns empty string for empty tree", () => {
    const tree = build([]);
    const output = renderTreeToString(tree);

    expect(output).toBe("");
  });

  it("skips root node in output", () => {
    const tree = build([entry({ folderPath: ".", description: "Root" })]);
    const output = renderTreeToString(tree);

    expect(output).toBe("");
  });

  it("renders single node with description", () => {
    const tree = build([entry({ folderPath: "src", description: "Source code" })]);
    const output = renderTreeToString(tree);

    expect(output).toContain("src");
    expect(output).toContain("Source code");
    expect(output).toContain("── ");
  });

  it("renders nested nodes with proper ASCII connectors", () => {
    const tree = build([
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "a/b", description: "B" }),
    ]);
    const output = renderTreeToString(tree);
    const lines = output.split("\n").filter(Boolean);

    // First level should use ├── or └──
    expect(lines[0]).toMatch(/[├└]── /);
    expect(lines[0]).toContain("a");
    expect(lines[0]).toContain("A");

    // Nested level should have │   or indentation
    expect(lines[1]).toMatch(/[│ ]/);
  });

  it("truncates descriptions when descriptionMaxLength is set", () => {
    const tree = build([
      entry({
        folderPath: "src",
        description: "A very long description that should be truncated at some point",
      }),
    ]);
    const output = renderTreeToString(tree, { descriptionMaxLength: 20 });

    expect(output).toContain("A very long descript");
    expect(output).not.toContain("A very long description that should be truncated");
  });

  it("does not truncate by default", () => {
    const longDesc = "A".repeat(200);
    const tree = build([entry({ folderPath: "src", description: longDesc })]);
    const output = renderTreeToString(tree);

    expect(output).toContain(longDesc);
  });

  it("omits description when node has none", () => {
    const tree = build([entry({ folderPath: "src", description: "" })]);
    const output = renderTreeToString(tree);

    expect(output).toContain("src");
    expect(output).not.toContain("—");
  });

  it("uses └── for last child and ├── for non-last", () => {
    const tree = build([
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "b", description: "B" }),
      entry({ folderPath: "c", description: "C" }),
    ]);
    const output = renderTreeToString(tree);
    const lines = output.split("\n").filter(Boolean);

    expect(lines[0]).toContain("├── a");
    expect(lines[1]).toContain("├── b");
    expect(lines[2]).toContain("└── c");
  });
});

// ── renderTreeToMarkdown ─────────────────────────────────────────────
describe("renderTreeToMarkdown", () => {
  it("produces valid markdown with title", () => {
    const tree = build([entry({ folderPath: "src", description: "Source" })]);
    const md = renderTreeToMarkdown(tree, "My Index");

    expect(md).toContain("# My Index");
    expect(md).toContain("## Directory Structure");
    expect(md).toContain("```");
    expect(md).toContain("## Details");
  });

  it("uses 'Context Index' as default title", () => {
    const tree = build([]);
    const md = renderTreeToMarkdown(tree);

    expect(md).toContain("# Context Index");
  });

  it("includes tree visualization in code block", () => {
    const tree = build([entry({ folderPath: "src", description: "Source" })]);
    const md = renderTreeToMarkdown(tree);

    expect(md).toContain("```");
    expect(md).toContain("src");
  });

  it("lists details section with per-node descriptions", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Source code" }),
      entry({ folderPath: "skills", description: "Skill modules" }),
    ]);
    const md = renderTreeToMarkdown(tree);

    expect(md).toContain("### `src`");
    expect(md).toContain("Source code");
    expect(md).toContain("### `skills`");
    expect(md).toContain("Skill modules");
  });

  it("skips nodes without descriptions in details", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Has desc" }),
      entry({ folderPath: "empty", description: "" }),
    ]);
    const md = renderTreeToMarkdown(tree);

    expect(md).toContain("### `src`");
    // Empty description node should not have a heading
    expect(md).not.toMatch(/### `empty`/);
  });
});

// ── renderTreeToCompactString ───────────────────────────────────────
describe("renderTreeToCompactString", () => {
  it("returns empty string for empty tree", () => {
    const tree = build([]);
    const output = renderTreeToCompactString(tree);

    expect(output).toBe("");
  });

  it("returns empty string when root has no described children", () => {
    const tree = build([entry({ folderPath: "src", description: "" })]);
    const output = renderTreeToCompactString(tree);

    expect(output).toBe("");
  });

  it("renders single node with description", () => {
    const tree = build([entry({ folderPath: "src", description: "Source code" })]);
    const output = renderTreeToCompactString(tree);

    expect(output).toBe("src — Source code");
  });

  it("excludes nodes without descriptions", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Source" }),
      entry({ folderPath: "empty", description: "" }),
      entry({ folderPath: "other", description: "Other stuff" }),
    ]);
    const output = renderTreeToCompactString(tree);

    expect(output).toContain("src — Source");
    expect(output).toContain("other — Other stuff");
    expect(output).not.toContain("empty");
  });

  it("excludes intermediate folders without descriptions even if they have children", () => {
    const tree = build([
      entry({ folderPath: "src", description: "" }),
      entry({ folderPath: "src/context-tree", description: "Context tree impl" }),
    ]);
    const output = renderTreeToCompactString(tree);

    // src should not appear because it has no description
    expect(output).not.toContain("src —");
    expect(output).toContain("src/context-tree — Context tree impl");
  });

  it("renders multiple entries on separate lines", () => {
    const tree = build([
      entry({ folderPath: "scripts", description: "Maintenance scripts" }),
      entry({ folderPath: "skills", description: "Reusable skills" }),
      entry({ folderPath: "src", description: "Source code" }),
    ]);
    const output = renderTreeToCompactString(tree);
    const lines = output.split("\n").filter(Boolean);

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("scripts — Maintenance scripts");
    expect(lines[1]).toBe("skills — Reusable skills");
    expect(lines[2]).toBe("src — Source code");
  });

  it("renders nested structure with descriptions", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Source" }),
      entry({ folderPath: "src/context-tree", description: "Context tree impl" }),
      entry({ folderPath: "src/utils", description: "Utilities" }),
    ]);
    const output = renderTreeToCompactString(tree);
    const lines = output.split("\n").filter(Boolean);

    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("src — Source");
    expect(lines[1]).toContain("src/context-tree — Context tree impl");
    expect(lines[2]).toContain("src/utils — Utilities");
  });

  it("does not include nodes with children but no description", () => {
    const tree = build([
      entry({ folderPath: "src", description: "" }),
      entry({ folderPath: "src/context-tree", description: "Has desc" }),
      entry({ folderPath: "src/utils", description: "" }),
    ]);
    const output = renderTreeToCompactString(tree);

    // src should not appear at all (no description)
    expect(output).not.toMatch(/^src —/m);
    // Only src/context-tree should appear
    expect(output).toBe("src/context-tree — Has desc");
  });
});

// ── renderTreeToJSON ─────────────────────────────────────────────────
describe("renderTreeToJSON", () => {
  it("produces root object with children", () => {
    const tree = build([entry({ folderPath: "src", description: "Source" })]);
    const json = renderTreeToJSON(tree);

    expect(json).toEqual({
      root: {
        description: "Project root",
        children: [
          {
            path: "src",
            description: "Source",
          },
        ],
      },
    });
  });

  it("includes path and description at each level", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Source" }),
      entry({ folderPath: "src/utils", description: "Utils" }),
    ]);
    const json = renderTreeToJSON(tree);

    expect(json).toEqual({
      root: {
        description: "Project root",
        children: [
          {
            path: "src",
            description: "Source",
            children: [
              {
                path: "src/utils",
                description: "Utils",
              },
            ],
          },
        ],
      },
    });
  });

  it("omits children key when node has no children", () => {
    const tree = build([entry({ folderPath: "src", description: "Source" })]);
    const json = renderTreeToJSON(tree);

    expect(json).toEqual({
      root: {
        description: "Project root",
        children: [
          {
            path: "src",
            description: "Source",
          },
        ],
      },
    });
  });

  it("produces valid JSON string", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Source" }),
      entry({ folderPath: "skills", description: "Skills" }),
    ]);
    const json = renderTreeToJSON(tree);
    const str = JSON.stringify(json, null, 2);

    // Must be valid JSON
    expect(() => JSON.parse(str)).not.toThrow();
  });
});
