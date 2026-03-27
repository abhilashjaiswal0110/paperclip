/**
 * Schema and structure validation tests for the DevLaunch Studio
 * agentcompanies/v1 company package located at agents/devlaunch-studio/.
 *
 * Tests run without a live Paperclip server and validate:
 *   - All required files exist on disk
 *   - Frontmatter has expected top-level keys
 *   - agentcompanies/v1 invariants (no orphan agents, no cycles)
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
const ROOT = path.resolve(__dirname, "../../agents/devlaunch-studio");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

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

  it("has slug: devlaunch-studio", () => {
    expect(fm.slug).toBe("devlaunch-studio");
  });

  it("declares required secret GH_TOKEN", () => {
    expect(content).toMatch(/required:/);
    expect(content).toMatch(/- GH_TOKEN/);
  });

  it("declares optional deployment secrets", () => {
    expect(content).toMatch(/optional:/);
    expect(content).toMatch(/VERCEL_TOKEN|AWS_ACCESS_KEY_ID/);
  });
});

// ---------------------------------------------------------------------------
// 3. All 9 agent AGENTS.md files
// ---------------------------------------------------------------------------

const AGENT_SLUGS = [
  "ceo",
  "cto",
  "backend-engineer",
  "frontend-engineer",
  "qa-engineer",
  "devops-engineer",
  "product-manager",
  "ux-designer",
  "technical-writer",
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

  it("CEO has reportsTo: null", () => {
    const content = readFile("agents/ceo/AGENTS.md");
    expect(content).toMatch(/reportsTo:\s*null/);
  });

  it("all non-CEO agents have non-null reportsTo", () => {
    for (const slug of AGENT_SLUGS) {
      if (slug === "ceo") continue;
      const content = readFile(`agents/${slug}/AGENTS.md`);
      expect(content).not.toMatch(/reportsTo:\s*null/);
    }
  });

  it("has exactly 9 agent directories", () => {
    const agentsDir = path.join(ROOT, "agents");
    const dirs = fs
      .readdirSync(agentsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    expect(dirs).toHaveLength(9);
  });
});

// ---------------------------------------------------------------------------
// 4. Org tree integrity
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

  it("exactly one agent has reportsTo: null (CEO)", () => {
    const roots = Object.values(nodes).filter((n) => n.reportsTo === null);
    expect(roots).toHaveLength(1);
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

  it("CTO reports to ceo", () => {
    expect(nodes["cto"].reportsTo).toBe("ceo");
  });

  it("backend-engineer, frontend-engineer, qa-engineer, devops-engineer all report to cto", () => {
    expect(nodes["backend-engineer"].reportsTo).toBe("cto");
    expect(nodes["frontend-engineer"].reportsTo).toBe("cto");
    expect(nodes["qa-engineer"].reportsTo).toBe("cto");
    expect(nodes["devops-engineer"].reportsTo).toBe("cto");
  });

  it("product-manager, ux-designer, technical-writer all report to ceo", () => {
    expect(nodes["product-manager"].reportsTo).toBe("ceo");
    expect(nodes["ux-designer"].reportsTo).toBe("ceo");
    expect(nodes["technical-writer"].reportsTo).toBe("ceo");
  });
});

// ---------------------------------------------------------------------------
// 5. Teams
// ---------------------------------------------------------------------------

const TEAM_SLUGS = ["engineering", "product", "design"] as const;

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
// 6. MVP Factory project + seed tasks
// ---------------------------------------------------------------------------

const SEED_TASKS = [
  "requirements-discovery",
  "api-design",
  "backend-implementation",
  "frontend-implementation",
  "test-automation",
  "cicd-pipeline",
  "api-documentation",
] as const;

describe("MVP Factory project", () => {
  it("PROJECT.md exists", () => {
    expect(fileExists("projects/mvp-factory/PROJECT.md")).toBe(true);
  });

  it("PROJECT.md has name and owner", () => {
    const content = readFile("projects/mvp-factory/PROJECT.md");
    expect(content).toMatch(/name:/);
    expect(content).toMatch(/owner:/);
  });

  for (const task of SEED_TASKS) {
    const relPath = `projects/mvp-factory/tasks/${task}/TASK.md`;

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

    it(`${relPath} has project: mvp-factory`, () => {
      const content = readFile(relPath);
      expect(content).toMatch(/project:\s*mvp-factory/);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. Recurring tasks — portable
// ---------------------------------------------------------------------------

const RECURRING_TASKS = [
  "daily-standup",
  "weekly-sprint-review",
  "sprint-retrospective",
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

  it("daily-standup is assigned to product-manager", () => {
    const content = readFile("tasks/daily-standup/TASK.md");
    expect(content).toMatch(/assignee:\s*product-manager/);
  });

  it("weekly-sprint-review is assigned to product-manager", () => {
    const content = readFile("tasks/weekly-sprint-review/TASK.md");
    expect(content).toMatch(/assignee:\s*product-manager/);
  });

  it("sprint-retrospective is assigned to product-manager", () => {
    const content = readFile("tasks/sprint-retrospective/TASK.md");
    expect(content).toMatch(/assignee:\s*product-manager/);
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

  it("declares heartbeat config for all 9 agents", () => {
    for (const slug of AGENT_SLUGS) {
      expect(content).toMatch(new RegExp(`${slug}:`));
    }
    expect(content.match(/intervalSec:\s*300/g)?.length).toBe(9);
    expect(content.match(/wakeOnDemand:\s*true/g)?.length).toBe(9);
  });

  it("declares GH_TOKEN as required for multiple engineering agents", () => {
    expect(content).toMatch(/GH_TOKEN:/);
    expect(content).toMatch(/requirement:\s*required/);
  });

  it("declares optional deployment secrets", () => {
    expect(content).toMatch(/VERCEL_TOKEN:/);
    expect(content).toMatch(/AWS_ACCESS_KEY_ID:/);
    expect(content).toMatch(/requirement:\s*optional/);
  });

  it("declares all 3 routines", () => {
    expect(content).toMatch(/routines:/);
    expect(content).toMatch(/daily-standup:/);
    expect(content).toMatch(/weekly-sprint-review:/);
    expect(content).toMatch(/sprint-retrospective:/);
  });

  it("routines have cron schedules", () => {
    const cronMatches = content.match(/cron:/g);
    expect(cronMatches?.length).toBe(3);
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

  it("has Org Chart section", () => {
    expect(content).toMatch(/## Org Chart/);
  });

  it("has Getting Started section", () => {
    expect(content).toMatch(/## Getting Started/);
  });

  it("has Teams section", () => {
    expect(content).toMatch(/## Teams/);
  });

  it("documents 14-day MVP delivery", () => {
    expect(content).toMatch(/14.day|14 day/);
  });

  it("documents 80% test coverage requirement", () => {
    expect(content).toMatch(/80%/);
  });

  it("documents the sprint gate", () => {
    expect(content).toMatch(/[Ss]print [Gg]ate|sprint gate/);
  });

  it("documents zero P1 bugs requirement", () => {
    expect(content).toMatch(/P1/);
  });
});

// ---------------------------------------------------------------------------
// 10. Agent-specific content checks
// ---------------------------------------------------------------------------

describe("Agent content checks", () => {
  it("backend-engineer mentions OWASP security standards", () => {
    const content = readFile("agents/backend-engineer/AGENTS.md");
    expect(content).toMatch(/OWASP/);
  });

  it("backend-engineer mentions p99 latency target", () => {
    const content = readFile("agents/backend-engineer/AGENTS.md");
    expect(content).toMatch(/p99|200ms/);
  });

  it("frontend-engineer mentions React or Next.js", () => {
    const content = readFile("agents/frontend-engineer/AGENTS.md");
    expect(content).toMatch(/React|Next\.js/);
  });

  it("qa-engineer mentions 80% coverage gate", () => {
    const content = readFile("agents/qa-engineer/AGENTS.md");
    expect(content).toMatch(/80%/);
  });

  it("qa-engineer defines release gate criteria", () => {
    const content = readFile("agents/qa-engineer/AGENTS.md");
    expect(content).toMatch(/[Rr]elease [Gg]ate/);
  });

  it("devops-engineer mentions zero-downtime deployment", () => {
    const content = readFile("agents/devops-engineer/AGENTS.md");
    expect(content).toMatch(/zero.downtime|zero-downtime/);
  });

  it("devops-engineer mentions rollback", () => {
    const content = readFile("agents/devops-engineer/AGENTS.md");
    expect(content).toMatch(/rollback/);
  });

  it("technical-writer mentions API documentation on day 1", () => {
    const content = readFile("agents/technical-writer/AGENTS.md");
    expect(content).toMatch(/day 1/);
  });
});
