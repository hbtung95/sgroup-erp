/**
 * SGROUP ERP — Auth & RBAC MCP Server (HERA V5)
 * 
 * Exposes authentication, RBAC queries, and audit log access as MCP tools.
 * Agents use this to verify permission configurations and audit trail integrity.
 * 
 * Transport: stdio
 * Owner: SENTRY (Security Agent)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJECT_ROOT = resolve(join(__dirname, "../../../../.."));
const AGENTS_ROOT = join(PROJECT_ROOT, ".agents");

const server = new McpServer({
  name: "sgroup-auth-mcp-server",
  version: "1.0.0",
  capabilities: { tools: {}, resources: {} },
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

// ─────────────────────────────────────────────────────────
// SGROUP RBAC HIERARCHY (from domain knowledge)
// ─────────────────────────────────────────────────────────

const ROLE_HIERARCHY = {
  CEO: {
    level: 1,
    permissions: ["ALL"],
    description: "Full system access — all modules, all operations",
  },
  DIRECTOR: {
    level: 2,
    permissions: ["MODULE_ADMIN", "REPORT_ALL", "APPROVE_L2"],
    description: "Department director — full access to assigned modules",
  },
  BRANCH_MANAGER: {
    level: 3,
    permissions: ["BRANCH_ALL", "REPORT_BRANCH", "APPROVE_L1", "COMMISSION_VIEW"],
    description: "Branch manager — full access within branch scope",
  },
  TEAM_LEAD: {
    level: 4,
    permissions: ["TEAM_ALL", "REPORT_TEAM", "COMMISSION_TEAM"],
    description: "Team lead — manage team members and view team reports",
  },
  SALES: {
    level: 5,
    permissions: ["BOOKING_CRUD", "CUSTOMER_OWN", "COMMISSION_SELF"],
    description: "Sales agent — manage own bookings and customers",
  },
  STAFF: {
    level: 6,
    permissions: ["SELF_PROFILE", "ATTENDANCE_SELF"],
    description: "General staff — view own profile and attendance",
  },
};

const MODULE_PERMISSIONS: Record<string, string[]> = {
  hr: ["EMPLOYEE_MANAGE", "DEPARTMENT_MANAGE", "PAYROLL_VIEW", "ATTENDANCE_MANAGE", "LEAVE_APPROVE"],
  crm: ["CUSTOMER_MANAGE", "LEAD_MANAGE", "DEAL_MANAGE", "CONTACT_MANAGE"],
  sales: ["BOOKING_MANAGE", "DEPOSIT_MANAGE", "CONTRACT_MANAGE", "HANDOVER_MANAGE"],
  project: ["PROJECT_MANAGE", "INVENTORY_MANAGE", "PRICING_MANAGE", "LEGAL_DOC_MANAGE"],
  accounting: ["INVOICE_MANAGE", "PAYMENT_MANAGE", "REPORT_FINANCIAL", "TAX_MANAGE"],
  commission: ["COMMISSION_CALCULATE", "COMMISSION_APPROVE", "COMMISSION_PAYOUT"],
};

// ─────────────────────────────────────────────────────────
// MCP RESOURCES
// ─────────────────────────────────────────────────────────

server.resource(
  "rbac-hierarchy",
  "auth://rbac/hierarchy",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(ROLE_HIERARCHY, null, 2),
      mimeType: "application/json",
    }],
  })
);

server.resource(
  "module-permissions",
  "auth://rbac/module-permissions",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify(MODULE_PERMISSIONS, null, 2),
      mimeType: "application/json",
    }],
  })
);

server.resource(
  "agent-boundaries",
  "auth://agents/boundaries",
  async (uri) => {
    const content = safeReadFile(join(AGENTS_ROOT, "sop", "agent-boundaries.md"));
    return {
      contents: [{
        uri: uri.href,
        text: content || "Agent boundaries SOP not found.",
        mimeType: "text/markdown",
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// MCP TOOLS — RBAC Queries
// ─────────────────────────────────────────────────────────

server.tool(
  "auth_get_role_hierarchy",
  "Get the full RBAC role hierarchy for SGROUP ERP (CEO → Director → BM → TL → Sales → Staff).",
  {},
  async () => ({
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        hierarchy: ROLE_HIERARCHY,
        levels: Object.entries(ROLE_HIERARCHY)
          .sort(([, a], [, b]) => a.level - b.level)
          .map(([role, info]) => `${info.level}. ${role}: ${info.description}`),
      }, null, 2),
    }],
  })
);

server.tool(
  "auth_get_module_permissions",
  "Get the permission matrix for a specific ERP module.",
  {
    module: z.string().describe("Module name (e.g., 'hr', 'crm', 'sales')"),
  },
  async ({ module }) => {
    const permissions = MODULE_PERMISSIONS[module];

    if (!permissions) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `No permissions defined for module '${module}'. Available: ${Object.keys(MODULE_PERMISSIONS).join(", ")}. Consider defining permissions with OSCAR (Org/Role Analyst).`,
        }],
      };
    }

    // Build role-permission matrix
    const matrix: Record<string, Record<string, boolean>> = {};
    for (const role of Object.keys(ROLE_HIERARCHY)) {
      matrix[role] = {};
      const roleInfo = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];

      for (const perm of permissions) {
        // CEO has all permissions
        if (roleInfo.permissions.includes("ALL")) {
          matrix[role][perm] = true;
        }
        // Module admin has all module permissions
        else if (roleInfo.permissions.includes("MODULE_ADMIN")) {
          matrix[role][perm] = true;
        }
        // Branch level has branch-scoped access
        else if (roleInfo.permissions.includes("BRANCH_ALL")) {
          matrix[role][perm] = !perm.includes("APPROVE") || perm === "LEAVE_APPROVE";
        }
        // Others: check specific permission overlap
        else {
          matrix[role][perm] = roleInfo.permissions.some(rp =>
            perm.toLowerCase().includes(rp.toLowerCase().split("_")[0])
          );
        }
      }
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          module,
          permissions,
          role_matrix: matrix,
          note: "Use this matrix when implementing middleware guards. SENTRY enforces these at API Gateway level.",
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "auth_check_agent_boundary",
  "Check if an agent is permitted to access specific files or directories. Enforces sop/agent-boundaries.md.",
  {
    agent_name: z.string().describe("Agent name (e.g., 'BRIAN', 'FIONA')"),
    file_path: z.string().describe("File path to check access for"),
  },
  async ({ agent_name, file_path }) => {
    // Agent boundary rules (from sop/agent-boundaries.md)
    const boundaries: Record<string, { permitted: string[]; denied: string[] }> = {
      BRIAN: {
        permitted: ["modules/*/api/**/*.go", "core/api-gateway/**/*.go"],
        denied: ["modules/*/web/**/*", "packages/ui/**/*"],
      },
      FIONA: {
        permitted: ["modules/*/web/src/**/*", "core/web-host/src/**/*"],
        denied: ["modules/*/api/**/*"],
      },
      JENNY: {
        permitted: ["modules/*/api/migrations/*.sql"],
        denied: [],
      },
      NOVA: {
        permitted: ["packages/ui/**/*"],
        denied: ["modules/**/*"],
      },
      SENTRY: {
        permitted: ["packages/rbac/**/*", "core/api-gateway/middleware/**/*"],
        denied: [],
      },
      BELLA: {
        permitted: [".agents/shared/domain/**/*", "docs/business-analysis/**/*"],
        denied: ["**/*.go", "**/*.ts", "**/*.tsx"],
      },
      DIANA: {
        permitted: ["docs/business-analysis/processes/**/*", "docs/business-analysis/user-journeys/**/*"],
        denied: ["**/*.go", "**/*.ts", "**/*.tsx"],
      },
      OSCAR: {
        permitted: ["docs/business-analysis/organization/**/*"],
        denied: ["**/*.go", "**/*.ts", "**/*.tsx"],
      },
      MARCO: {
        permitted: ["docs/business-analysis/industry/**/*"],
        denied: ["**/*.go", "**/*.ts", "**/*.tsx"],
      },
      IRIS: {
        permitted: ["modules/*/api/integrations/**/*"],
        denied: ["modules/*/web/**/*", "packages/ui/**/*"],
      },
      ATLAS: {
        permitted: [".github/**/*", "docker-compose.yml", "turbo.json", "Dockerfile"],
        denied: [],
      },
      QUINN: {
        permitted: ["**/*.test.*", "**/*.spec.*", "e2e/**/*"],
        denied: [],
      },
      MUSE: {
        permitted: [".agents/experience-library/**/*"],
        denied: ["**/*.go", "**/*.ts", "**/*.tsx"],
      },
      JAVIS: {
        permitted: [".agents/**/*.md"],
        denied: ["**/*.go", "**/*.ts", "**/*.tsx"],
      },
    };

    const agentUpper = agent_name.toUpperCase();
    const agentBounds = boundaries[agentUpper];

    if (!agentBounds) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Unknown agent: ${agent_name}. Valid agents: ${Object.keys(boundaries).join(", ")}`,
        }],
      };
    }

    // Simple glob matching (basic)
    const matchGlob = (pattern: string, path: string): boolean => {
      const regex = pattern
        .replace(/\*\*/g, "DOUBLE_STAR")
        .replace(/\*/g, "[^/]*")
        .replace(/DOUBLE_STAR/g, ".*");
      return new RegExp(`^${regex}$`).test(path.replace(/\\/g, "/"));
    };

    const isPermitted = agentBounds.permitted.some(p => matchGlob(p, file_path));
    const isDenied = agentBounds.denied.some(p => matchGlob(p, file_path));

    const allowed = isPermitted && !isDenied;

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          agent: agentUpper,
          file_path,
          allowed,
          reason: allowed
            ? `${agentUpper} is permitted to access this path.`
            : isDenied
              ? `${agentUpper} is explicitly DENIED access to this path. See sop/agent-boundaries.md.`
              : `${agentUpper} does not have permission for this path. Permitted patterns: ${agentBounds.permitted.join(", ")}`,
          permitted_patterns: agentBounds.permitted,
          denied_patterns: agentBounds.denied,
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "auth_get_financial_rules",
  "Get the mandatory financial data rules that ALL agents handling money must follow.",
  {},
  async () => ({
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        rules: [
          { rule: "DECIMAL_PRECISION", description: "ALL monetary values MUST use Decimal(18,4) — NEVER Float", applies_to: ["BRIAN", "JENNY", "IRIS"] },
          { rule: "TRANSACTION_WRAPPING", description: "ALL financial write operations MUST be wrapped in database transactions", applies_to: ["BRIAN", "JENNY"] },
          { rule: "AUDIT_LOGGING", description: "ALL financial state changes MUST create an audit log entry", applies_to: ["BRIAN"] },
          { rule: "SOFT_DELETE_ONLY", description: "NEVER hard-delete financial records — soft delete only", applies_to: ["BRIAN", "JENNY"] },
          { rule: "PESSIMISTIC_LOCKING", description: "Race conditions: pessimistic locking for booking/deposit operations", applies_to: ["BRIAN"] },
        ],
        source: "sop/agent-boundaries.md § Financial Data Rule",
      }, null, 2),
    }],
  })
);

// ─────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Auth MCP Server] Started on stdio transport");
}

main().catch((error) => {
  console.error("[Auth MCP Server] Fatal error:", error);
  process.exit(1);
});
