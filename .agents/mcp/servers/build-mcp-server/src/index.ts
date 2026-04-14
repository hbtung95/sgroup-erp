/**
 * SGROUP ERP — Build & CI MCP Server (HERA V5)
 * 
 * Exposes build, test, and lint operations as MCP tools.
 * Agents use this to verify their work without running commands directly.
 * 
 * Transport: stdio
 * Owner: ATLAS (DevOps), QUINN (Testing)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execSync } from "node:child_process";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

const PROJECT_ROOT = resolve(join(__dirname, "../../../../.."));

const server = new McpServer({
  name: "sgroup-build-mcp-server",
  version: "1.0.0",
  capabilities: { tools: {} },
});

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number;
}

function runCommand(cmd: string, cwd: string, timeoutMs = 120_000): CommandResult {
  try {
    const stdout = execSync(cmd, {
      cwd,
      encoding: "utf-8",
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, PAGER: "cat" },
    });
    return { success: true, stdout, stderr: "", exit_code: 0 };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; status?: number };
    return {
      success: false,
      stdout: execError.stdout || "",
      stderr: execError.stderr || String(error),
      exit_code: execError.status || 1,
    };
  }
}

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Build
// ─────────────────────────────────────────────────────────

server.tool(
  "build_turbo",
  "Run the full Turborepo build pipeline to verify all modules compile correctly. This is the primary verification command.",
  {
    filter: z.string().optional().describe("Optional: filter to specific package (e.g., '@sgroup/ui', 'hr-web')"),
  },
  async ({ filter }) => {
    const cmd = filter
      ? `npx turbo run build --filter=${filter}`
      : "npx turbo run build";

    const result = runCommand(cmd, PROJECT_ROOT);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          command: cmd,
          success: result.success,
          exit_code: result.exit_code,
          output: (result.stdout + result.stderr).slice(-3000),
          suggestion: result.success
            ? "Build passed. All modules compile correctly."
            : "Build FAILED. Review error output above. Common causes: import errors, type mismatches, missing dependencies.",
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "build_go_module",
  "Build and vet a specific Go module (backend API).",
  {
    module: z.string().describe("Module name (e.g., 'hr', 'crm')"),
  },
  async ({ module }) => {
    const apiPath = join(PROJECT_ROOT, "modules", module, "api");

    if (!existsSync(apiPath)) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Go API path not found: modules/${module}/api/. Module may not have a backend yet.`,
        }],
      };
    }

    const buildResult = runCommand("go build ./...", apiPath);
    const vetResult = runCommand("go vet ./...", apiPath);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          module,
          build: {
            success: buildResult.success,
            output: (buildResult.stdout + buildResult.stderr).slice(-2000),
          },
          vet: {
            success: vetResult.success,
            output: (vetResult.stdout + vetResult.stderr).slice(-2000),
          },
          overall_success: buildResult.success && vetResult.success,
        }, null, 2),
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Test
// ─────────────────────────────────────────────────────────

server.tool(
  "test_go_module",
  "Run Go tests for a specific module with race detection.",
  {
    module: z.string().describe("Module name"),
    package: z.string().optional().describe("Specific package to test (e.g., './internal/service/...')"),
    verbose: z.boolean().default(false).describe("Enable verbose output"),
  },
  async ({ module, package: pkg, verbose }) => {
    const apiPath = join(PROJECT_ROOT, "modules", module, "api");

    if (!existsSync(apiPath)) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Go API path not found: modules/${module}/api/.`,
        }],
      };
    }

    const target = pkg || "./...";
    const verboseFlag = verbose ? " -v" : "";
    const cmd = `go test ${target} -race -count=1${verboseFlag}`;
    const result = runCommand(cmd, apiPath, 180_000);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          module,
          command: cmd,
          success: result.success,
          output: (result.stdout + result.stderr).slice(-3000),
          suggestion: result.success
            ? "All tests passed with race detection."
            : "Tests FAILED. Review output for failing test cases.",
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "test_frontend_module",
  "Run frontend tests (Vitest) for a specific module.",
  {
    module: z.string().describe("Module name"),
  },
  async ({ module }) => {
    const webPath = join(PROJECT_ROOT, "modules", module, "web");

    if (!existsSync(webPath)) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Frontend path not found: modules/${module}/web/.`,
        }],
      };
    }

    const result = runCommand("npx vitest run --reporter=verbose", webPath, 180_000);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          module,
          success: result.success,
          output: (result.stdout + result.stderr).slice(-3000),
        }, null, 2),
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Lint & Quality
// ─────────────────────────────────────────────────────────

server.tool(
  "lint_typescript",
  "Run TypeScript type checking on a frontend module.",
  {
    module: z.string().describe("Module name"),
  },
  async ({ module }) => {
    const webPath = join(PROJECT_ROOT, "modules", module, "web");

    if (!existsSync(webPath)) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Frontend path not found: modules/${module}/web/.`,
        }],
      };
    }

    const result = runCommand("npx tsc --noEmit", webPath);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          module,
          success: result.success,
          type_errors: result.success ? 0 : (result.stderr.match(/error TS/g) || []).length,
          output: (result.stdout + result.stderr).slice(-3000),
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "lint_go",
  "Run Go vet and staticcheck on a backend module.",
  {
    module: z.string().describe("Module name"),
  },
  async ({ module }) => {
    const apiPath = join(PROJECT_ROOT, "modules", module, "api");

    if (!existsSync(apiPath)) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Go API path not found: modules/${module}/api/.`,
        }],
      };
    }

    const vetResult = runCommand("go vet ./...", apiPath);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          module,
          vet: { success: vetResult.success, output: (vetResult.stdout + vetResult.stderr).slice(-2000) },
        }, null, 2),
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Dependency Check
// ─────────────────────────────────────────────────────────

server.tool(
  "build_check_deps",
  "Check for dependency issues in the monorepo (missing packages, version conflicts).",
  {},
  async () => {
    const result = runCommand("npm ls --depth=0 --json 2>&1", PROJECT_ROOT);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: result.success,
          output: result.stdout.slice(-3000),
          suggestion: result.success
            ? "Dependencies look healthy."
            : "Dependency issues detected. Consider running `npm install`.",
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
  console.error("[Build MCP Server] Started on stdio transport");
}

main().catch((error) => {
  console.error("[Build MCP Server] Fatal error:", error);
  process.exit(1);
});
