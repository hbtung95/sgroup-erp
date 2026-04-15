const fs = require('fs');
const path = require('path');

const agentsDir = path.join(__dirname, '../agents');
const cardsDir = path.join(__dirname, '../mcp/registry/agent-cards');

if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
}

const agents = [
    {
        name: "BELLA",
        description: "Lead BA — Domain Architect, Entity design, and cross-module constraints",
        layer: 2, team: "BA", tier: "BY_TASK_TYPE",
        provided: ["bella_create_domain_spec", "bella_review_spec", "bella_update_domain_rules"],
        consumed: ["domain_list_modules", "domain_get_module_structure", "exp_search_trajectories", "exp_read_patterns"],
        input: ["text/markdown", "application/json"], output: ["text/markdown"],
        skills: ["Domain Driven Design", "Entity modeling", "State machine design (Mermaid)", "Cross-module constraint mapping"],
        access: [".agents/shared/domain/**", "docs/business-analysis/**"],
        denied: ["**/*.go", "**/*.tsx"]
    },
    {
        name: "DIANA",
        description: "Business Process Analyst — Workflow & User Journey Expert",
        layer: 2, team: "BA", tier: "BY_TASK_TYPE",
        provided: ["diana_create_process_flow", "diana_create_user_journey", "diana_define_sop"],
        consumed: ["domain_get_spec", "exp_search_trajectories", "auth_get_role_hierarchy"],
        input: ["text/markdown"], output: ["text/markdown"],
        skills: ["BPMN modeling", "User journey mapping", "SLA definition", "Mermaid process diagrams"],
        access: ["docs/business-analysis/processes/**", "docs/business-analysis/user-journeys/**", ".agents/shared/domain/**"],
        denied: ["**/*.go", "**/*.tsx"]
    },
    {
        name: "OSCAR",
        description: "Organization & Role Analyst — RBAC & KPI Expert",
        layer: 2, team: "BA", tier: "BY_TASK_TYPE",
        provided: ["oscar_define_org_structure", "oscar_define_rbac_matrix", "oscar_define_kpi"],
        consumed: ["exp_search_trajectories", "domain_get_spec"],
        input: ["text/markdown"], output: ["text/markdown"],
        skills: ["Organization structuring", "RBAC matrix design", "KPI framework modeling", "Approval hierarchies"],
        access: ["docs/business-analysis/organization/**", ".agents/shared/domain/**"],
        denied: ["**/*.go", "**/*.tsx"]
    },
    {
        name: "MARCO",
        description: "Industry & Compliance Expert — Real Estate Brokerage Specialist",
        layer: 2, team: "BA", tier: "BY_TASK_TYPE",
        provided: ["marco_define_compliance_rules", "marco_analyze_market", "marco_define_tax_rules"],
        consumed: ["exp_search_trajectories", "domain_get_spec"],
        input: ["text/markdown"], output: ["text/markdown"],
        skills: ["VN real estate law (2023)", "Tax compliance (VAT, PIT, CIT)", "E-Invoice regulations", "Regulatory risk mapping"],
        access: ["docs/business-analysis/industry/**", ".agents/shared/domain/**"],
        denied: ["**/*.go", "**/*.tsx"]
    },
    {
        name: "FIONA",
        description: "Frontend Engineer — React components and pages",
        layer: 2, team: "CODE", tier: "BY_TASK_TYPE",
        provided: ["fiona_create_component", "fiona_create_page", "fiona_integrate_api", "fiona_run_vite_build"],
        consumed: ["domain_get_spec", "build_turbo", "exp_search_trajectories", "domain_get_design_tokens"],
        input: ["text/markdown", "application/json"], output: ["text/typescript", "text/tsx"],
        skills: ["React 19 development", "TypeScript type-safety", "TanStack Query integration", "Neo-Corporate Premium styling (Tailwind)"],
        access: ["modules/*/web/src/**", "core/web-host/src/**"],
        denied: ["**/*.go", "modules/*/api/**"]
    },
    {
        name: "JENNY",
        description: "Database Engineer — PostgreSQL schema design and migrations",
        layer: 2, team: "CODE", tier: "BY_TASK_TYPE",
        provided: ["jenny_create_migration", "jenny_define_schema", "jenny_apply_migration"],
        consumed: ["domain_get_spec", "domain_scaffold_migration", "exp_search_trajectories"],
        input: ["text/markdown", "application/json"], output: ["application/sql"],
        skills: ["PostgreSQL 18 DDL", "UUID v7 key generation", "DECIMAL(18,4) financial precision", "Row Level Security (RLS)", "Soft delete implementation"],
        access: ["modules/*/api/migrations/**"],
        denied: ["**/*.go", "**/*.tsx"]
    },
    {
        name: "NOVA",
        description: "UI/Design System Engineer — Shared components and design tokens",
        layer: 2, team: "CODE", tier: "BY_TASK_TYPE",
        provided: ["nova_create_ui_component", "nova_define_design_token", "nova_update_theme"],
        consumed: ["domain_get_design_tokens", "exp_search_trajectories", "build_turbo"],
        input: ["text/markdown"], output: ["text/typescript", "text/css"],
        skills: ["Design system architecture", "CSS Variables & Theming", "Light-mode-first NeoGlassmorphism", "Accessible UI components"],
        access: ["packages/ui/**", "core/web-host/src/styles/**"],
        denied: ["**/*.go"]
    },
    {
        name: "ATLAS",
        description: "DevOps & Infrastructure Engineer — CI/CD, Docker, and deployments",
        layer: 2, team: "SUPPORT", tier: "BY_TASK_TYPE",
        provided: ["atlas_create_dockerfile", "atlas_create_workflow", "atlas_update_compose", "atlas_run_build"],
        consumed: ["build_turbo", "build_check_deps", "exp_search_trajectories"],
        input: ["text/markdown"], output: ["text/yaml", "text/x-dockerfile"],
        skills: ["Docker multi-stage builds", "GitHub Actions workflows", "Service health-check configuration", "Deployment topologies"],
        access: [".github/workflows/**", "docker-compose.yml", "turbo.json", "**/Dockerfile"],
        denied: ["**/*.go", "**/*.tsx", "**/*.sql"]
    },
    {
        name: "QUINN",
        description: "Testing Engineer — Frontend unit tests, E2E tests, domain edge cases",
        layer: 2, team: "SUPPORT", tier: "BY_TASK_TYPE",
        provided: ["quinn_create_unit_test", "quinn_create_e2e_test", "quinn_run_tests"],
        consumed: ["test_frontend_module", "lint_frontend", "exp_search_trajectories", "domain_get_spec"],
        input: ["text/markdown", "text/typescript"], output: ["text/typescript"],
        skills: ["Vitest unit testing", "React Testing Library", "Playwright E2E automation", "Financial edge case validation"],
        access: ["**/*.test.*", "**/*.spec.*", "e2e/**"],
        denied: ["**/api/**/*.go"]
    },
    {
        name: "SENTRY",
        description: "Security Engineer — Authentication, Authorization, and Security hardening",
        layer: 2, team: "SUPPORT", tier: "BY_TASK_TYPE",
        provided: ["sentry_create_auth_middleware", "sentry_create_rbac_guard", "sentry_audit_security"],
        consumed: ["auth_get_role_hierarchy", "auth_get_module_permissions", "domain_get_spec", "exp_search_trajectories"],
        input: ["text/markdown"], output: ["text/x-go", "text/typescript"],
        skills: ["JWT manipulation and validation", "RBAC policy enforcement", "Rate limiting middleware", "Security auditing"],
        access: ["packages/rbac/**", "core/api-gateway/middleware/**"],
        denied: ["**/*.sql"]
    },
    {
        name: "IRIS",
        description: "Integration Engineer — External API, webhooks, data sync services",
        layer: 2, team: "CODE", tier: "BY_TASK_TYPE",
        provided: ["iris_create_api_client", "iris_create_sync_service", "iris_create_webhook_handler"],
        consumed: ["domain_get_api_contract", "exp_search_trajectories", "build_go_module"],
        input: ["text/markdown", "application/json"], output: ["text/x-go"],
        skills: ["Go HTTP clients", "Exponential backoff retry mechanisms", "Circuit breaker patterns", "Webhook signature verification"],
        access: ["modules/*/api/integrations/**"],
        denied: ["**/*.tsx"]
    }
];

// Helper to format string map
function getScoreRubric() {
    return "(CORRECTNESS×4 + QUALITY×3 + EFFICIENCY×2 + LEARNING×1) / 10";
}

agents.forEach(agent => {
    const cardName = agent.name.toLowerCase() + '.json';
    const agentDir = path.join(agentsDir, agent.name.toLowerCase());
    
    // 1. Create JSON Card
    const cardData = {
        name: agent.name,
        description: agent.description,
        version: "5.0",
        url: `agent://sgroup-erp/${agent.name.toLowerCase()}`,
        capabilities: {
            tools_provided: agent.provided,
            tools_consumed: agent.consumed,
            input_modes: agent.input,
            output_modes: agent.output
        },
        skills: agent.skills,
        constraints: {
            file_access: agent.access,
            file_denied: agent.denied,
            dependencies: ["domain-spec-must-exist"]
        },
        scoring: {
            rubric: getScoreRubric(),
            baseline: 7.0,
            rope_trigger: 4.0,
            dimensions: {
                correctness: `Does the output match the domain spec and requirements?`,
                quality: `Is the implementation clean, standard-compliant, and error-free?`,
                efficiency: `Is the solution optimal and avoiding unnecessary complexity?`,
                learning: `Were past patterns from the Experience Library correctly applied?`
            }
        },
        team: agent.team,
        layer: agent.layer,
        activation_tier: agent.tier
    };
    
    fs.writeFileSync(path.join(cardsDir, cardName), JSON.stringify(cardData, null, 2));
    console.log(`Created card: ${cardName}`);

    // 2. Append MCP section to AGENT.md if it exists and doesn't have it
    const mdPath = path.join(agentDir, 'AGENT.md');
    if (fs.existsSync(mdPath)) {
        let content = fs.readFileSync(mdPath, 'utf8');
        if (!content.includes('## MCP (HERA V5)')) {
            const mcpSect = `

## MCP (HERA V5)
  Provides: ${agent.provided.join(', ')}
  Consumes: ${agent.consumed.join(', ')}
  Accepts: TaskContext + DomainSpec
  Produces: AgentOutput + HandoffContext
`;
            // Insert before VERSIONS: line if it exists
            const vIndex = content.lastIndexOf('VERSIONS:');
            if (vIndex !== -1) {
                content = content.substring(0, vIndex) + mcpSect.trimStart() + '\n' + content.substring(vIndex);
            } else {
                content += mcpSect;
            }
            fs.writeFileSync(mdPath, content);
            console.log(`Updated AGENT.md for ${agent.name}`);
        } else {
            console.log(`AGENT.md for ${agent.name} already has MCP section`);
        }
    } else {
        console.warn(`Missing AGENT.md for ${agent.name}`);
    }
});
