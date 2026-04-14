/**
 * SGROUP ERP — Experience Library MCP Server (HERA V5)
 * 
 * Exposes the Experience Library as a queryable MCP service.
 * Replaces static markdown file scanning with structured search,
 * trajectory capture, scorecard management, and RoPE triggers.
 * 
 * Transport: stdio (local development)
 * Owner: MUSE (primary), all agents (read access)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, existsSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ─────────────────────────────────────────────────────────
// SERVER INITIALIZATION
// ─────────────────────────────────────────────────────────

const PROJECT_ROOT = resolve(join(__dirname, "../../../../.."));
const EXP_ROOT = join(PROJECT_ROOT, ".agents", "experience-library");
const TRAJ_ROOT = join(EXP_ROOT, "trajectories");
const SCORE_ROOT = join(EXP_ROOT, "scorecards");
const INSIGHT_ROOT = join(EXP_ROOT, "insights");
const EVOL_ROOT = join(EXP_ROOT, "evolution");

const server = new McpServer({
  name: "sgroup-experience-mcp-server",
  version: "1.0.0",
  capabilities: {
    tools: {},
    resources: {},
  },
});

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

function safeReadFile(path: string): string | null {
  try {
    return existsSync(path) ? readFileSync(path, "utf-8") : null;
  } catch {
    return null;
  }
}

function listMarkdownFiles(dir: string): string[] {
  try {
    return existsSync(dir)
      ? readdirSync(dir).filter(f => f.endsWith(".md") && !f.startsWith("_"))
      : [];
  } catch {
    return [];
  }
}

interface TrajectoryMeta {
  id: string;
  filename: string;
  date: string;
  content: string;
}

function parseTrajectories(): TrajectoryMeta[] {
  const files = listMarkdownFiles(TRAJ_ROOT);
  return files.map(f => {
    const content = safeReadFile(join(TRAJ_ROOT, f)) || "";
    const dateMatch = f.match(/traj-(\d{4}-\d{2}-\d{2})/);
    return {
      id: f.replace(".md", ""),
      filename: f,
      date: dateMatch ? dateMatch[1] : "unknown",
      content,
    };
  });
}

// ─────────────────────────────────────────────────────────
// MCP RESOURCES
// ─────────────────────────────────────────────────────────

server.resource(
  "trajectory-index",
  "experience://trajectories/index",
  async (uri) => {
    const indexContent = safeReadFile(join(TRAJ_ROOT, "_index.md"));
    return {
      contents: [{
        uri: uri.href,
        text: indexContent || "No trajectory index found. MUSE should create trajectories/_index.md.",
        mimeType: "text/markdown",
      }],
    };
  }
);

server.resource(
  "patterns",
  "experience://insights/patterns",
  async (uri) => {
    const patterns = safeReadFile(join(INSIGHT_ROOT, "_patterns.md"));
    return {
      contents: [{
        uri: uri.href,
        text: patterns || "No patterns documented yet.",
        mimeType: "text/markdown",
      }],
    };
  }
);

server.resource(
  "team-scorecard",
  "experience://scorecards/summary",
  async (uri) => {
    const summary = safeReadFile(join(SCORE_ROOT, "_summary.md"));
    return {
      contents: [{
        uri: uri.href,
        text: summary || "No team scorecard summary yet.",
        mimeType: "text/markdown",
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Search & Read (All agents)
// ─────────────────────────────────────────────────────────

server.tool(
  "exp_search_trajectories",
  "Search past execution trajectories by keyword, module, complexity, or status. Use BEFORE starting any task to learn from past experience.",
  {
    query: z.string().describe("Search keyword (task type, module name, technology, etc.)"),
    module: z.string().optional().describe("Filter by module name"),
    complexity: z.enum(["XS", "S", "M", "L", "XL"]).optional().describe("Filter by complexity"),
    status: z.enum(["success", "failure", "partial"]).optional().describe("Filter by outcome"),
    limit: z.number().default(5).describe("Max results to return"),
  },
  async ({ query, module, complexity, status, limit }) => {
    const trajectories = parseTrajectories();
    const queryLower = query.toLowerCase();

    let results = trajectories.filter(t => {
      const contentLower = t.content.toLowerCase();
      let matches = contentLower.includes(queryLower);

      if (module) {
        matches = matches && contentLower.includes(module.toLowerCase());
      }
      if (complexity) {
        matches = matches && contentLower.includes(`complexity: ${complexity.toLowerCase()}`);
      }
      if (status) {
        const statusMap: Record<string, string> = {
          success: "✅",
          failure: "❌",
          partial: "⚠️",
        };
        matches = matches && contentLower.includes(statusMap[status] || status);
      }

      return matches;
    });

    results = results.slice(0, limit);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          query,
          filters: { module, complexity, status },
          total_found: results.length,
          trajectories: results.map(t => ({
            id: t.id,
            date: t.date,
            preview: t.content.substring(0, 500) + (t.content.length > 500 ? "..." : ""),
          })),
          suggestion: results.length === 0
            ? "No matching trajectories found. This may be a novel task type."
            : `Found ${results.length} matching trajectories. Review them for applicable patterns.`,
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "exp_read_trajectory",
  "Read the full content of a specific execution trajectory.",
  {
    trajectory_id: z.string().describe("Trajectory ID (e.g., 'traj-2026-04-14-hr-api')"),
  },
  async ({ trajectory_id }) => {
    const filename = trajectory_id.endsWith(".md") ? trajectory_id : `${trajectory_id}.md`;
    const content = safeReadFile(join(TRAJ_ROOT, filename));

    if (!content) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Trajectory '${trajectory_id}' not found. Available: ${listMarkdownFiles(TRAJ_ROOT).map(f => f.replace(".md", "")).join(", ") || "none"}`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: content,
      }],
    };
  }
);

server.tool(
  "exp_get_agent_scorecard",
  "Get an agent's performance scorecard with rolling average, score history, strengths, and areas to improve.",
  {
    agent_name: z.string().describe("Agent name (e.g., 'brian', 'fiona', 'muse')"),
  },
  async ({ agent_name }) => {
    const agentLower = agent_name.toLowerCase();
    const scorecardPath = join(SCORE_ROOT, `agent-${agentLower}.md`);
    const content = safeReadFile(scorecardPath);

    if (!content) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            agent: agent_name,
            status: "NO_SCORECARD",
            message: `No scorecard found for ${agent_name}. This agent hasn't been evaluated yet. MUSE should create one after the first task.`,
            rolling_average: null,
          }, null, 2),
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: content,
      }],
    };
  }
);

server.tool(
  "exp_read_patterns",
  "Read all known patterns and anti-patterns from the Experience Library.",
  {},
  async () => {
    const patterns = safeReadFile(join(INSIGHT_ROOT, "_patterns.md"));
    const insightFiles = listMarkdownFiles(INSIGHT_ROOT);

    let allInsights = patterns || "# Known Patterns\n\nNo patterns documented yet.\n";

    if (insightFiles.length > 0) {
      allInsights += "\n\n---\n\n# Individual Insights\n\n";
      for (const file of insightFiles.slice(0, 10)) {
        const content = safeReadFile(join(INSIGHT_ROOT, file));
        if (content) {
          allInsights += `## ${file.replace(".md", "")}\n${content}\n\n`;
        }
      }
    }

    return {
      content: [{
        type: "text" as const,
        text: allInsights,
      }],
    };
  }
);

server.tool(
  "exp_get_evolution_history",
  "Get the prompt evolution history for a specific agent or all agents.",
  {
    agent_name: z.string().optional().describe("Agent name to get history for. Omit for all."),
  },
  async ({ agent_name }) => {
    if (agent_name) {
      const historyPath = join(EVOL_ROOT, `evo-${agent_name.toLowerCase()}-history.md`);
      const content = safeReadFile(historyPath);
      return {
        content: [{
          type: "text" as const,
          text: content || `No evolution history for ${agent_name}.`,
        }],
      };
    }

    const decisions = safeReadFile(join(EVOL_ROOT, "_decisions.md"));
    return {
      content: [{
        type: "text" as const,
        text: decisions || "No evolution decisions recorded yet.",
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Write (MUSE only)
// ─────────────────────────────────────────────────────────

server.tool(
  "exp_capture_trajectory",
  "Capture a new execution trajectory. RESTRICTED to MUSE agent only.",
  {
    requesting_agent: z.string().describe("Must be 'MUSE'"),
    task_id: z.string().describe("Task UUID"),
    task_name: z.string().describe("Human-readable task name"),
    date: z.string().describe("ISO date (YYYY-MM-DD)"),
    complexity: z.enum(["XS", "S", "M", "L", "XL"]),
    modules: z.array(z.string()).describe("Affected modules"),
    requester: z.string().describe("Who requested the task"),
    dag_template: z.string().describe("DAG template used"),
    dag_execution: z.string().describe("Execution DAG description (e.g., 'BRIAN → SENTRY → MUSE')"),
    agent_scores: z.record(z.string(), z.number()).describe("Agent name → final score mapping"),
    outcome: z.enum(["success", "failure", "partial"]),
    build_status: z.enum(["pass", "fail", "skip"]),
    quality_score: z.number().describe("Overall quality score 0-10"),
    what_worked: z.array(z.string()),
    what_failed: z.array(z.string()),
    new_patterns: z.array(z.string()),
  },
  async (params) => {
    if (params.requesting_agent !== "MUSE") {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Access denied. Only MUSE can capture trajectories. Agent: ${params.requesting_agent}`,
        }],
      };
    }

    const slug = params.task_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
    const filename = `traj-${params.date}-${slug}.md`;
    const filepath = join(TRAJ_ROOT, filename);

    const outcomeEmoji = { success: "✅ Success", failure: "❌ Failure", partial: "⚠️ Partial" };
    const buildEmoji = { pass: "Pass", fail: "Fail", skip: "Skip" };

    const agentScoreTable = Object.entries(params.agent_scores)
      .map(([agent, score]) => `| ${agent} | ${score} |`)
      .join("\n");

    const content = `# Trajectory: ${params.task_name}
Date: ${params.date}
Complexity: ${params.complexity}
Module(s): ${params.modules.join(", ")}
Requester: ${params.requester}
Task ID: ${params.task_id}

## Execution DAG
\`\`\`
${params.dag_execution}
\`\`\`
Template: ${params.dag_template}

## Agent Scores
| Agent | Final Score |
|-------|:----------:|
${agentScoreTable}

## Outcome
Status: ${outcomeEmoji[params.outcome]}
Build: ${buildEmoji[params.build_status]}
Quality Score: ${params.quality_score}/10

## Insights
### What worked
${params.what_worked.map(w => `- ${w}`).join("\n")}

### What failed
${params.what_failed.length > 0 ? params.what_failed.map(f => `- ${f}`).join("\n") : "- Nothing significant"}

### New patterns
${params.new_patterns.length > 0 ? params.new_patterns.map(p => `- ${p}`).join("\n") : "- None identified"}

---
*Captured by MUSE | HERA V5 Experience Library*
`;

    writeFileSync(filepath, content);

    // Update index
    const indexPath = join(TRAJ_ROOT, "_index.md");
    const indexEntry = `\n| ${params.date} | ${params.task_name} | ${params.complexity} | ${params.modules.join(",")} | ${outcomeEmoji[params.outcome]} | ${params.quality_score} | [${filename.replace(".md", "")}](./${filename}) |\n`;
    
    if (existsSync(indexPath)) {
      appendFileSync(indexPath, indexEntry);
    } else {
      writeFileSync(indexPath, `# Trajectory Index\n\n| Date | Task | Complexity | Module | Outcome | Score | Link |\n|------|------|:----------:|--------|---------|:-----:|------|\n${indexEntry}`);
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          trajectory_id: filename.replace(".md", ""),
          file: `experience-library/trajectories/${filename}`,
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "exp_update_scorecard",
  "Update an agent's performance scorecard. RESTRICTED to MUSE agent only.",
  {
    requesting_agent: z.string().describe("Must be 'MUSE'"),
    agent_name: z.string().describe("Agent to update scorecard for"),
    task_id: z.string().describe("Task this score is for"),
    date: z.string().describe("ISO date"),
    self_score: z.number().describe("Agent's self-reported score"),
    muse_score: z.number().describe("MUSE's independent score"),
    final_score: z.number().describe("Blended final score"),
    credit: z.enum(["PRIMARY", "SUPPORTING", "NEUTRAL", "BLOCKING", "CRITICAL_BLOCK"]),
    feedback: z.string().describe("MUSE feedback for the agent"),
  },
  async (params) => {
    if (params.requesting_agent !== "MUSE") {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Access denied. Only MUSE can update scorecards. Agent: ${params.requesting_agent}`,
        }],
      };
    }

    const agentLower = params.agent_name.toLowerCase();
    const scorecardPath = join(SCORE_ROOT, `agent-${agentLower}.md`);

    const entry = `\n| ${params.date} | ${params.task_id.slice(0, 8)}... | ${params.self_score} | ${params.muse_score} | **${params.final_score}** | ${params.credit} | ${params.feedback} |\n`;

    if (existsSync(scorecardPath)) {
      appendFileSync(scorecardPath, entry);
    } else {
      writeFileSync(scorecardPath, `# Scorecard: ${params.agent_name.toUpperCase()}\n\n| Date | Task | Self | MUSE | Final | Credit | Feedback |\n|------|------|:----:|:----:|:-----:|--------|----------|\n${entry}`);
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          agent: params.agent_name,
          final_score: params.final_score,
          scorecard_file: `experience-library/scorecards/agent-${agentLower}.md`,
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "exp_trigger_rope",
  "Trigger Role-Aware Prompt Evolution for an underperforming agent. RESTRICTED to MUSE only.",
  {
    requesting_agent: z.string().describe("Must be 'MUSE'"),
    agent_name: z.string().describe("Agent whose prompt needs evolution"),
    reason: z.string().describe("Reason for triggering RoPE"),
    proposed_changes: z.array(z.object({
      section: z.string(),
      change_type: z.enum(["ADD_RULE", "REFINE_RULE", "REMOVE_RULE", "ADD_EXAMPLE", "ADD_PATTERN"]),
      proposed: z.string(),
      rationale: z.string(),
    })),
    evidence_trajectories: z.array(z.string()).describe("Trajectory IDs as evidence"),
  },
  async (params) => {
    if (params.requesting_agent !== "MUSE") {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Access denied. Only MUSE can trigger RoPE. Agent: ${params.requesting_agent}`,
        }],
      };
    }

    const decisionsPath = join(EVOL_ROOT, "_decisions.md");
    const date = new Date().toISOString().split("T")[0];

    const entry = `\n---\n\n## RoPE: ${params.agent_name} (${date})\n\n**Reason:** ${params.reason}\n\n**Evidence:** ${params.evidence_trajectories.join(", ")}\n\n**Proposed Changes:**\n${params.proposed_changes.map((c, i) => `${i + 1}. [${c.change_type}] Section: ${c.section}\n   - Proposed: ${c.proposed}\n   - Rationale: ${c.rationale}`).join("\n")}\n\n**Status:** ⏳ Pending JAVIS approval\n`;

    if (existsSync(decisionsPath)) {
      appendFileSync(decisionsPath, entry);
    } else {
      writeFileSync(decisionsPath, `# Evolution Decisions Log\n\n> MUSE proposes → JAVIS reviews → Applied to AGENT.md\n${entry}`);
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          status: "PENDING_APPROVAL",
          message: `RoPE triggered for ${params.agent_name}. JAVIS must review and apply.`,
          decisions_file: "experience-library/evolution/_decisions.md",
        }, null, 2),
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Experience MCP Server] Started on stdio transport");
}

main().catch((error) => {
  console.error("[Experience MCP Server] Fatal error:", error);
  process.exit(1);
});
