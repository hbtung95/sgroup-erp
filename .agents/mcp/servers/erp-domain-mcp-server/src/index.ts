/**
 * SGROUP ERP — ERP Domain MCP Server (HERA V5)
 * 
 * Exposes ERP business domain data as MCP tools and resources.
 * Agents query this server for domain specs, API contracts, entity schemas,
 * and scaffolding operations.
 * 
 * Transport: stdio (local development)
 * Owner: JAVIS (orchestrator) + Domain Agents
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

// ─────────────────────────────────────────────────────────
// SERVER INITIALIZATION
// ─────────────────────────────────────────────────────────

const PROJECT_ROOT = resolve(join(__dirname, "../../../../.."));
const AGENTS_ROOT = join(PROJECT_ROOT, ".agents");
const DOMAIN_ROOT = join(AGENTS_ROOT, "shared", "domain");
const MODULES_ROOT = join(PROJECT_ROOT, "modules");

const server = new McpServer({
  name: "sgroup-erp-domain-mcp-server",
  version: "1.0.0",
  capabilities: {
    tools: {},
    resources: {},
  },
});

// ─────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────

function safeReadFile(path: string): string | null {
  try {
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function listModules(): string[] {
  try {
    return readdirSync(MODULES_ROOT, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch {
    return [];
  }
}

function listDomainSpecs(): string[] {
  try {
    return readdirSync(DOMAIN_ROOT)
      .filter(f => f.endsWith(".md"))
      .map(f => f.replace(".md", ""));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────
// MCP RESOURCES (Read-only data access)
// ─────────────────────────────────────────────────────────

// Resource: Domain specifications
server.resource(
  "domain-specs",
  "domain://specs",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        available_specs: listDomainSpecs(),
        path: DOMAIN_ROOT,
        description: "Domain specifications for all ERP modules. Use domain_get_spec tool to read individual specs.",
      }),
      mimeType: "application/json",
    }],
  })
);

// Resource: Tech stack reference
server.resource(
  "tech-stack",
  "domain://tech-stack",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: safeReadFile(join(AGENTS_ROOT, "shared", "tech-stack.md")) ?? "Tech stack not found",
      mimeType: "text/markdown",
    }],
  })
);

// Resource: API contract reference
server.resource(
  "api-contract",
  "domain://api-contract",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: safeReadFile(join(AGENTS_ROOT, "shared", "api-contract.md")) ?? "API contract not found",
      mimeType: "text/markdown",
    }],
  })
);

// Resource: Architecture reference
server.resource(
  "architecture",
  "domain://architecture",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: safeReadFile(join(AGENTS_ROOT, "shared", "architecture.md")) ?? "Architecture doc not found",
      mimeType: "text/markdown",
    }],
  })
);

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Domain Queries (Read-only, all agents)
// ─────────────────────────────────────────────────────────

server.tool(
  "domain_get_spec",
  "Retrieve the domain specification for a specific ERP module. Returns entity definitions, business rules, state machines, and cross-module dependencies.",
  {
    module: z.string().describe("Module name, e.g., 'hr', 'crm', 'sales', 'project', 'accounting'"),
    section: z.string().optional().describe("Optional: specific section to extract (e.g., 'entities', 'rules', 'state-machines')"),
  },
  async ({ module, section }) => {
    const specPath = join(DOMAIN_ROOT, `${module}.md`);
    const content = safeReadFile(specPath);

    if (!content) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Domain spec not found for module '${module}'. Available modules: ${listDomainSpecs().join(", ")}. Suggestion: Ask BELLA to create the domain spec first.`,
        }],
      };
    }

    let result = content;
    if (section) {
      // Extract specific section by heading
      const regex = new RegExp(`## ${section}[\\s\\S]*?(?=## |$)`, "i");
      const match = content.match(regex);
      result = match ? match[0] : `Section '${section}' not found in ${module} domain spec. Available sections can be seen in the full spec.`;
    }

    return {
      content: [{
        type: "text" as const,
        text: result,
      }],
    };
  }
);

server.tool(
  "domain_list_modules",
  "List all available ERP modules with their development status.",
  {},
  async () => {
    const modules = listModules();
    const specs = listDomainSpecs();

    const moduleInfo = modules.map(m => ({
      name: m,
      has_domain_spec: specs.includes(m),
      has_web: existsSync(join(MODULES_ROOT, m, "web")),
      has_api: existsSync(join(MODULES_ROOT, m, "api")),
      has_app: existsSync(join(MODULES_ROOT, m, "app")),
    }));

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ modules: moduleInfo, total: modules.length }, null, 2),
      }],
    };
  }
);

server.tool(
  "domain_get_api_contract",
  "Retrieve the API contract (OpenAPI/Swagger) or endpoint specifications for a module.",
  {
    module: z.string().describe("Module name"),
    endpoint: z.string().optional().describe("Specific endpoint path to look up"),
  },
  async ({ module, endpoint }) => {
    // Check for OpenAPI spec in module docs
    const docsPath = join(MODULES_ROOT, module, "docs");
    const apiContractPath = join(AGENTS_ROOT, "shared", "api-contract.md");

    let content = "";

    if (existsSync(docsPath)) {
      const files = readdirSync(docsPath).filter(f => f.endsWith(".yaml") || f.endsWith(".json") || f.endsWith(".md"));
      if (files.length > 0) {
        content += `## ${module} API docs:\n`;
        for (const file of files) {
          content += `### ${file}\n${safeReadFile(join(docsPath, file)) || "Unable to read"}\n\n`;
        }
      }
    }

    // Fallback to shared API contract
    const sharedContract = safeReadFile(apiContractPath);
    if (sharedContract) {
      content += `\n## Shared API Contract Standard:\n${sharedContract}`;
    }

    if (!content) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `No API contract found for module '${module}'. Consider creating API docs at modules/${module}/docs/.`,
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: endpoint ? content.split(endpoint).join(`>>> ${endpoint} <<<`) : content,
      }],
    };
  }
);

server.tool(
  "domain_get_design_tokens",
  "Retrieve the design token specifications for the UI design system.",
  {},
  async () => {
    const content = safeReadFile(join(AGENTS_ROOT, "shared", "design-tokens.md"));
    return {
      content: [{
        type: "text" as const,
        text: content || "Design tokens not found.",
      }],
    };
  }
);

server.tool(
  "domain_get_module_structure",
  "Get the file/directory structure of a specific module. Useful for understanding what already exists before making changes.",
  {
    module: z.string().describe("Module name (e.g., 'hr', 'crm')"),
    layer: z.enum(["web", "api", "app", "all"]).default("all").describe("Which layer to inspect"),
  },
  async ({ module, layer }) => {
    const modulePath = join(MODULES_ROOT, module);
    if (!existsSync(modulePath)) {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Module '${module}' not found at ${modulePath}. Available modules: ${listModules().join(", ")}`,
        }],
      };
    }

    const layers = layer === "all" ? ["web", "api", "app"] : [layer];
    const structure: Record<string, string[]> = {};

    for (const l of layers) {
      const layerPath = join(modulePath, l);
      if (existsSync(layerPath)) {
        structure[l] = listFilesRecursive(layerPath, layerPath, 3);
      } else {
        structure[l] = ["(not yet created)"];
      }
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ module, structure }, null, 2),
      }],
    };
  }
);

function listFilesRecursive(basePath: string, currentPath: string, maxDepth: number, depth = 0): string[] {
  if (depth >= maxDepth) return [`... (depth limit ${maxDepth})`];
  
  try {
    const entries = readdirSync(currentPath, { withFileTypes: true });
    const results: string[] = [];
    
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
      const relativePath = currentPath.replace(basePath, "").replace(/^[\\/]/, "");
      const fullRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        results.push(`${fullRelative}/`);
        results.push(...listFilesRecursive(basePath, join(currentPath, entry.name), maxDepth, depth + 1));
      } else {
        results.push(fullRelative);
      }
    }
    return results;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────
// MCP TOOLS — Scaffolding (Write, restricted agents)
// ─────────────────────────────────────────────────────────

server.tool(
  "domain_scaffold_endpoint",
  "Scaffold a new API endpoint for a module (handler + service + repository + model files). Restricted to BRIAN agent.",
  {
    module: z.string().describe("Module name"),
    entity: z.string().describe("Entity name (PascalCase, e.g., 'Employee', 'Department')"),
    operations: z.array(z.enum(["list", "get", "create", "update", "delete"])).describe("CRUD operations to scaffold"),
    requesting_agent: z.string().describe("Agent name requesting this scaffold"),
  },
  async ({ module, entity, operations, requesting_agent }) => {
    // Agent boundary enforcement
    if (requesting_agent !== "BRIAN") {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Access denied. Only BRIAN can scaffold API endpoints. Requesting agent: ${requesting_agent}. See sop/agent-boundaries.md.`,
        }],
      };
    }

    const apiPath = join(MODULES_ROOT, module, "api");
    const entityLower = entity.toLowerCase();
    const files: string[] = [];

    // Ensure directories exist
    const dirs = ["internal/model", "internal/repository", "internal/service", "internal/handler"];
    for (const dir of dirs) {
      const dirPath = join(apiPath, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    }

    // Scaffold model
    const modelPath = join(apiPath, "internal", "model", `${entityLower}.go`);
    if (!existsSync(modelPath)) {
      writeFileSync(modelPath, generateGoModel(entity, module));
      files.push(`internal/model/${entityLower}.go`);
    }

    // Scaffold repository
    const repoPath = join(apiPath, "internal", "repository", `${entityLower}_repo.go`);
    if (!existsSync(repoPath)) {
      writeFileSync(repoPath, generateGoRepository(entity, module));
      files.push(`internal/repository/${entityLower}_repo.go`);
    }

    // Scaffold service
    const svcPath = join(apiPath, "internal", "service", `${entityLower}_service.go`);
    if (!existsSync(svcPath)) {
      writeFileSync(svcPath, generateGoService(entity, module, operations));
      files.push(`internal/service/${entityLower}_service.go`);
    }

    // Scaffold handler
    const handlerPath = join(apiPath, "internal", "handler", `${entityLower}_handler.go`);
    if (!existsSync(handlerPath)) {
      writeFileSync(handlerPath, generateGoHandler(entity, module, operations));
      files.push(`internal/handler/${entityLower}_handler.go`);
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          module,
          entity,
          operations,
          files_created: files,
          next_steps: [
            "Fill in entity fields in the model file",
            "Implement repository methods with proper pgx queries",
            "Add business logic in service layer",
            "Register routes in cmd/main.go",
            "Run: go build ./... && go vet ./...",
          ],
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "domain_scaffold_migration",
  "Create a new database migration file for a module. Restricted to JENNY agent.",
  {
    module: z.string().describe("Module name"),
    name: z.string().describe("Migration name (snake_case, e.g., 'create_employees_table')"),
    sql_up: z.string().describe("SQL for the UP migration"),
    sql_down: z.string().describe("SQL for the DOWN migration"),
    requesting_agent: z.string().describe("Agent name requesting this scaffold"),
  },
  async ({ module, name, sql_up, sql_down, requesting_agent }) => {
    if (requesting_agent !== "JENNY") {
      return {
        isError: true,
        content: [{
          type: "text" as const,
          text: `Access denied. Only JENNY can create migrations. Requesting agent: ${requesting_agent}.`,
        }],
      };
    }

    const migrationDir = join(MODULES_ROOT, module, "api", "migrations");
    if (!existsSync(migrationDir)) {
      mkdirSync(migrationDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const filename = `${timestamp}_${name}.sql`;
    const filepath = join(migrationDir, filename);

    const content = `-- Migration: ${name}\n-- Created: ${new Date().toISOString()}\n-- Module: ${module}\n\n-- +migrate Up\n${sql_up}\n\n-- +migrate Down\n${sql_down}\n`;

    writeFileSync(filepath, content);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          file: `modules/${module}/api/migrations/${filename}`,
          next_steps: ["Review the SQL", "Run migration: go run cmd/migrate/main.go up"],
        }, null, 2),
      }],
    };
  }
);

// ─────────────────────────────────────────────────────────
// GO CODE GENERATORS (Scaffold Templates)
// ─────────────────────────────────────────────────────────

function generateGoModel(entity: string, module: string): string {
  return `package model

import (
\t"time"

\t"github.com/google/uuid"
)

// ${entity} represents the ${entity} domain entity in the ${module} module.
// TODO: Fill in entity fields based on domain spec.
type ${entity} struct {
\tID        uuid.UUID  \`json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"\`
\tCreatedAt time.Time  \`json:"created_at"\`
\tUpdatedAt time.Time  \`json:"updated_at"\`
\tDeletedAt *time.Time \`json:"deleted_at,omitempty" gorm:"index"\`
\t
\t// TODO: Add domain-specific fields from shared/domain/${module}.md
}

// TableName returns the database table name.
func (${entity}) TableName() string {
\treturn "${entity.toLowerCase()}s"
}
`;
}

function generateGoRepository(entity: string, module: string): string {
  const entityLower = entity.toLowerCase();
  return `package repository

import (
\t"context"

\t"github.com/google/uuid"
\t"${module}/internal/model"
)

// ${entity}Repository defines the data access interface for ${entity}.
type ${entity}Repository interface {
\tGetByID(ctx context.Context, id uuid.UUID) (*model.${entity}, error)
\tList(ctx context.Context, offset, limit int) ([]*model.${entity}, int64, error)
\tCreate(ctx context.Context, entity *model.${entity}) error
\tUpdate(ctx context.Context, entity *model.${entity}) error
\tSoftDelete(ctx context.Context, id uuid.UUID) error
}

// ${entityLower}Repository implements ${entity}Repository using GORM/pgx.
type ${entityLower}Repository struct {
\t// TODO: Add DB connection field
}

// New${entity}Repository creates a new ${entity}Repository.
func New${entity}Repository( /* db dependency */ ) ${entity}Repository {
\treturn &${entityLower}Repository{}
}

// TODO: Implement interface methods
`;
}

function generateGoService(entity: string, module: string, operations: string[]): string {
  const entityLower = entity.toLowerCase();
  const methods = operations.map(op => {
    switch (op) {
      case "list": return `\tList${entity}s(ctx context.Context, offset, limit int) ([]*model.${entity}, int64, error)`;
      case "get": return `\tGet${entity}(ctx context.Context, id uuid.UUID) (*model.${entity}, error)`;
      case "create": return `\tCreate${entity}(ctx context.Context, input *model.${entity}) (*model.${entity}, error)`;
      case "update": return `\tUpdate${entity}(ctx context.Context, id uuid.UUID, input *model.${entity}) (*model.${entity}, error)`;
      case "delete": return `\tDelete${entity}(ctx context.Context, id uuid.UUID) error`;
      default: return "";
    }
  }).filter(Boolean).join("\n");

  return `package service

import (
\t"context"

\t"github.com/google/uuid"
\t"${module}/internal/model"
\t"${module}/internal/repository"
)

// ${entity}Service defines the business logic interface for ${entity}.
type ${entity}Service interface {
${methods}
}

// ${entityLower}Service implements ${entity}Service.
type ${entityLower}Service struct {
\trepo repository.${entity}Repository
}

// New${entity}Service creates a new ${entity}Service.
func New${entity}Service(repo repository.${entity}Repository) ${entity}Service {
\treturn &${entityLower}Service{repo: repo}
}

// TODO: Implement business logic methods with proper validation and error handling
`;
}

function generateGoHandler(entity: string, module: string, operations: string[]): string {
  return `package handler

import (
\t"${module}/internal/service"
\t"github.com/gin-gonic/gin"
)

// ${entity}Handler handles HTTP requests for ${entity} endpoints.
type ${entity}Handler struct {
\tsvc service.${entity}Service
}

// New${entity}Handler creates a new ${entity}Handler.
func New${entity}Handler(svc service.${entity}Service) *${entity}Handler {
\treturn &${entity}Handler{svc: svc}
}

// RegisterRoutes registers ${entity} routes on the Gin router.
func (h *${entity}Handler) RegisterRoutes(r *gin.RouterGroup) {
\tgroup := r.Group("/${entity.toLowerCase()}s")
\t{
${operations.map(op => {
    switch (op) {
      case "list": return `\t\tgroup.GET("", h.List)`;
      case "get": return `\t\tgroup.GET("/:id", h.GetByID)`;
      case "create": return `\t\tgroup.POST("", h.Create)`;
      case "update": return `\t\tgroup.PUT("/:id", h.Update)`;
      case "delete": return `\t\tgroup.DELETE("/:id", h.Delete)`;
      default: return "";
    }
  }).filter(Boolean).join("\n")}
\t}
}

// TODO: Implement handler methods with proper request parsing, validation, and response formatting
// Response format: { "success": true, "data": {...}, "meta": {...} }
// Error format:    { "success": false, "error": { "code": "...", "message": "...", "trace_id": "..." } }
`;
}

// ─────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[ERP Domain MCP Server] Started on stdio transport");
}

main().catch((error) => {
  console.error("[ERP Domain MCP Server] Fatal error:", error);
  process.exit(1);
});
