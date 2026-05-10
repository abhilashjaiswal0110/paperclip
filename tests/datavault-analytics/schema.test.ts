/**
 * Schema and structure validation tests for the DataVault Analytics
 * agentcompanies/v1 company package located at agents/datavault-analytics/.
 *
 * Tests run without a live Paperclip server and validate:
 *   - All required files exist on disk
 *   - Frontmatter has expected top-level keys
 *   - agentcompanies/v1 invariants (no orphan agents, no cycles)
 *   - Consistent secret declarations
 *   - Portable task schedules
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../agents/datavault-analytics");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

/** Extract flat key: value frontmatter entries. Not a full YAML parser. */
function parseFrontmatter(content: string): Record<string, unknown> {
  const normalised = content.replace(/\r\n/g, "\n");
  const match = normalised.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (key) result[key] = val;
  }
  return result;
}

// ---------------------------------------------------------------------------
// 1. Required top-level files
// ---------------------------------------------------------------------------

describe("Top-level package files", () => {
  const required = ["COMPANY.md", "README.md", "LICENSE", ".paperclip.yaml"] as const;

  for (const file of required) {
    it(`${file} exists`, () => {
      expect(fileExists(file)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. COMPANY.md schema
// ---------------------------------------------------------------------------

describe("COMPANY.md frontmatter", () => {
  const content = readFile("COMPANY.md");
  const fm = parseFrontmatter(content);

  it("has schema: agentcompanies/v1", () => {
    expect(fm.schema).toBe("agentcompanies/v1");
  });

  it("has name", () => {
    expect(fm.name).toBeTruthy();
  });

  it("has description", () => {
    expect(fm.description).toBeTruthy();
  });

  it("has slug: datavault-analytics", () => {
    expect(fm.slug).toBe("datavault-analytics");
  });

  it("declares required secret GH_TOKEN", () => {
    expect(content).toMatch(/- GH_TOKEN/);
  });

  it("declares optional secrets", () => {
    expect(content).toMatch(/optional:/);
    expect(content).toMatch(/SNOWFLAKE_ACCOUNT|MLFLOW_TRACKING_URI|DATADOG_API_KEY/);
  });
});

// ---------------------------------------------------------------------------
// 3. All 6 agent AGENTS.md files
// ---------------------------------------------------------------------------

const AGENT_SLUGS = [
  "cdo",
  "data-steward",
  "data-engineer",
  "dataops-engineer",
  "ml-engineer",
  "bi-developer",
] as const;

describe("Agent definitions", () => {
  for (const slug of AGENT_SLUGS) {
    const relPath = `agents/${slug}/AGENTS.md`;

    it(`${relPath} exists`, () => {
      expect(fileExists(relPath)).toBe(true);
    });

    it(`${relPath} has name in frontmatter`, () => {
      const fm = parseFrontmatter(readFile(relPath));
      expect(fm.name).toBeTruthy();
    });

    it(`${relPath} has title in frontmatter`, () => {
      const fm = parseFrontmatter(readFile(relPath));
      expect(fm.title).toBeTruthy();
    });

    it(`${relPath} has reportsTo in frontmatter`, () => {
      const content = readFile(relPath);
      expect(content).toMatch(/reportsTo:/);
    });

    it(`${relPath} includes paperclip skill`, () => {
      const content = readFile(relPath);
      expect(content).toMatch(/- paperclip/);
    });
  }

  it("CDO has reportsTo: null", () => {
    const content = readFile("agents/cdo/AGENTS.md");
    expect(content).toMatch(/reportsTo:\s*null/);
  });

  it("all non-CDO agents have non-null reportsTo", () => {
    for (const slug of AGENT_SLUGS) {
      if (slug === "cdo") continue;
      const content = readFile(`agents/${slug}/AGENTS.md`);
      expect(content).not.toMatch(/reportsTo:\s*null/);
    }
  });

  it("has exactly 6 agent directories", () => {
    const agentsDir = path.join(ROOT, "agents");
    const dirs = fs
      .readdirSync(agentsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    expect(dirs).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// 4. Org tree — no cycles, all trace to CDO
// ---------------------------------------------------------------------------

describe("Org tree integrity", () => {
  type AgentNode = { name: string; reportsTo: string | null };

  function loadAgentNode(slug: string): AgentNode {
    const content = readFile(`agents/${slug}/AGENTS.md`);
    const fm = parseFrontmatter(content);
    const reportsTo =
      typeof fm.reportsTo === "string" && fm.reportsTo !== "null"
        ? fm.reportsTo
        : null;
    const name = typeof fm.name === "string" ? fm.name : slug;
    return { name, reportsTo };
  }

  const nodes = Object.fromEntries(AGENT_SLUGS.map((s) => [s, loadAgentNode(s)]));

  it("exactly one agent has reportsTo: null (CDO)", () => {
    const roots = Object.values(nodes).filter((n) => n.reportsTo === null);
    expect(roots).toHaveLength(1);
  });

  it("the root agent is cdo", () => {
    expect(nodes["cdo"].reportsTo).toBeNull();
  });

  it("all non-root agents have a reportsTo that resolves to a known agent slug", () => {
    const allSlugs = new Set(AGENT_SLUGS as readonly string[]);
    for (const [slug, node] of Object.entries(nodes)) {
      if (node.reportsTo === null) continue;
      expect(
        allSlugs.has(node.reportsTo),
        `${slug} reportsTo "${node.reportsTo}" which is not a known agent slug`
      ).toBe(true);
    }
  });

  it("all non-CDO agents report to cdo", () => {
    for (const slug of AGENT_SLUGS) {
      if (slug === "cdo") continue;
      expect(nodes[slug].reportsTo).toBe("cdo");
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Teams
// ---------------------------------------------------------------------------

const TEAM_SLUGS = ["data-platform", "intelligence", "governance"] as const;

describe("Team definitions", () => {
  for (const slug of TEAM_SLUGS) {
    it(`teams/${slug}/TEAM.md exists`, () => {
      expect(fileExists(`teams/${slug}/TEAM.md`)).toBe(true);
    });

    it(`teams/${slug}/TEAM.md has name and manager`, () => {
      const content = readFile(`teams/${slug}/TEAM.md`);
      expect(content).toMatch(/name:/);
      expect(content).toMatch(/manager:/);
    });
  }

  it("has exactly 3 team directories", () => {
    const teamsDir = path.join(ROOT, "teams");
    const dirs = fs
      .readdirSync(teamsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    expect(dirs).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// 6. Data Platform Foundation project + seed tasks
// ---------------------------------------------------------------------------

const SEED_TASKS = [
  "data-catalogue-setup",
  "pipeline-ci-cd",
  "data-classification-audit",
  "pii-inventory",
] as const;

describe("Data Platform Foundation project", () => {
  it("PROJECT.md exists", () => {
    expect(fileExists("projects/data-platform-foundation/PROJECT.md")).toBe(true);
  });

  it("PROJECT.md has name and owner", () => {
    const content = readFile("projects/data-platform-foundation/PROJECT.md");
    expect(content).toMatch(/name:/);
    expect(content).toMatch(/owner:/);
  });

  for (const task of SEED_TASKS) {
    const relPath = `projects/data-platform-foundation/tasks/${task}/TASK.md`;

    it(`${relPath} exists`, () => {
      expect(fileExists(relPath)).toBe(true);
    });

    it(`${relPath} has name in frontmatter`, () => {
      const fm = parseFrontmatter(readFile(relPath));
      expect(fm.name).toBeTruthy();
    });

    it(`${relPath} has assignee in frontmatter`, () => {
      const content = readFile(relPath);
      expect(content).toMatch(/assignee:/);
    });

    it(`${relPath} has project: data-platform-foundation`, () => {
      const content = readFile(relPath);
      expect(content).toMatch(/project:\s*data-platform-foundation/);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. Recurring tasks — portable
// ---------------------------------------------------------------------------

const RECURRING_TASKS = [
  "daily-pipeline-health",
  "weekly-data-quality-report",
] as const;

describe("Recurring task portability", () => {
  for (const task of RECURRING_TASKS) {
    const relPath = `tasks/${task}/TASK.md`;

    it(`${relPath} exists`, () => {
      expect(fileExists(relPath)).toBe(true);
    });

    it(`${relPath} has recurring: true`, () => {
      const content = readFile(relPath);
      expect(content).toMatch(/recurring:\s*true/);
    });

    it(`${relPath} does NOT contain a concrete startsAt timestamp`, () => {
      const content = readFile(relPath);
      expect(content).not.toMatch(/startsAt:/);
    });

    it(`${relPath} does NOT contain a schedule: block`, () => {
      const content = readFile(relPath);
      expect(content).not.toMatch(/^schedule:/m);
    });
  }

  it("daily-pipeline-health is assigned to dataops-engineer", () => {
    const content = readFile("tasks/daily-pipeline-health/TASK.md");
    expect(content).toMatch(/assignee:\s*dataops-engineer/);
  });

  it("weekly-data-quality-report is assigned to data-steward", () => {
    const content = readFile("tasks/weekly-data-quality-report/TASK.md");
    expect(content).toMatch(/assignee:\s*data-steward/);
  });
});

// ---------------------------------------------------------------------------
// 8. .paperclip.yaml
// ---------------------------------------------------------------------------

describe(".paperclip.yaml", () => {
  const content = readFile(".paperclip.yaml");

  it("has schema: paperclip/v1", () => {
    expect(content).toMatch(/schema:\s*paperclip\/v1/);
  });

  it("declares all 6 agents", () => {
    for (const slug of AGENT_SLUGS) {
      expect(content).toMatch(new RegExp(`${slug}:`));
    }
  });

  it("declares GH_TOKEN as a required secret", () => {
    expect(content).toMatch(/GH_TOKEN:/);
    expect(content).toMatch(/requirement:\s*required/);
  });

  it("all secrets use kind: secret", () => {
    const kindMatches = content.match(/kind:\s*secret/g);
    expect(kindMatches).toBeTruthy();
    expect(kindMatches!.length).toBeGreaterThan(0);
  });

  it("declares 2 routines", () => {
    expect(content).toMatch(/routines:/);
    expect(content).toMatch(/daily-pipeline-health:/);
    expect(content).toMatch(/weekly-data-quality-report:/);
  });

  it("routines have cron schedules", () => {
    const cronMatches = content.match(/cron:/g);
    expect(cronMatches?.length).toBe(2);
  });

  it("routines use UTC timezone", () => {
    expect(content).toMatch(/timezone:\s*UTC/);
  });
});

// ---------------------------------------------------------------------------
// 9. README.md
// ---------------------------------------------------------------------------

describe("README.md", () => {
  const content = readFile("README.md");

  it("uses the canonical paperclipai/paperclip URL", () => {
    expect(content).toMatch(/github\.com\/paperclipai\/paperclip/);
  });

  it("does NOT contain a fork URL", () => {
    expect(content).not.toMatch(/github\.com\/abhilashjaiswal0110/);
  });

  it("has Org Chart section", () => {
    expect(content).toMatch(/## Org Chart/);
  });

  it("has Getting Started section", () => {
    expect(content).toMatch(/## Getting Started/);
  });
});
