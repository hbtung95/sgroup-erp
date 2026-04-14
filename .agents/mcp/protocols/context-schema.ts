/**
 * SGROUP ERP — MCP Context Schema (HERA V5)
 * 
 * Standardized TypeScript types for ALL inter-agent communication.
 * Every agent MUST use these types when sending/receiving context via MCP.
 * 
 * @module context-schema
 * @version 1.0.0
 * @since HERA V5 (2026-04-14)
 */

// ─────────────────────────────────────────────────────────
// ENUMS & CONSTANTS
// ─────────────────────────────────────────────────────────

export type Priority = "P0" | "P1" | "P2" | "P3";
export type Complexity = "XS" | "S" | "M" | "L" | "XL";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "BLOCKED";
export type OutcomeStatus = "SUCCESS" | "FAILURE" | "PARTIAL";
export type BuildStatus = "PASS" | "FAIL" | "SKIP";
export type CreditLevel = "PRIMARY" | "SUPPORTING" | "NEUTRAL" | "BLOCKING" | "CRITICAL_BLOCK";
export type FileOperation = "CREATE" | "MODIFY" | "DELETE";

export const AGENT_NAMES = [
  "JAVIS", "BELLA", "DIANA", "OSCAR", "MARCO",
  "FIONA", "BRIAN", "JENNY", "NOVA",
  "ATLAS", "QUINN", "SENTRY", "IRIS",
  "MUSE"
] as const;

export type AgentName = typeof AGENT_NAMES[number];

export const MODULES = [
  "hr", "crm", "sales", "project", "accounting",
  "commission", "legal", "agency", "marketing",
  "bdh-dashboard", "reports", "settings", "s-homes", "subscription"
] as const;

export type ModuleName = typeof MODULES[number];

export const TEAMS = {
  BA: ["BELLA", "DIANA", "OSCAR", "MARCO"] as const,
  CODE: ["FIONA", "BRIAN", "JENNY", "NOVA"] as const,
  SUPPORT: ["ATLAS", "QUINN", "SENTRY", "IRIS"] as const,
  EVAL: ["MUSE"] as const,
  ORCHESTRATOR: ["JAVIS"] as const,
};

// ─────────────────────────────────────────────────────────
// TASK CONTEXT (Input to agents)
// ─────────────────────────────────────────────────────────

/**
 * Standard context passed to every agent at dispatch time.
 * Replaces free-form markdown instructions with structured data.
 */
export interface TaskContext {
  /** UUID v7 identifier for this task */
  task_id: string;
  
  /** Human-readable task name/description */
  task_name: string;
  
  /** Who requested this task */
  requester: "CHAIRMAN" | "JAVIS" | AgentName;
  
  /** Task priority level */
  priority: Priority;
  
  /** Complexity T-shirt size (determines agent activation tier) */
  complexity: Complexity;
  
  /** Current task status */
  status: TaskStatus;
  
  /** ISO 8601 timestamp when task was created */
  created_at: string;
  
  // ── Domain Context ──
  
  /** Primary module this task affects */
  module: ModuleName;
  
  /** Additional modules impacted (cross-module tasks) */
  related_modules?: ModuleName[];
  
  /** Reference to domain spec (MCP resource URI) */
  domain_spec_ref: string;
  
  /** Reference to API contract (MCP resource URI) */
  api_contract_ref?: string;
  
  // ── DAG Position ──
  
  /** DAG template being used (e.g., "DAG-M-FEATURE") */
  dag_template: string;
  
  /** Step number in the DAG (1-indexed) */
  dag_step: number;
  
  /** Total steps in the DAG */
  dag_total_steps: number;
  
  /** Agents whose outputs are available as dependencies */
  dag_dependencies_met: DependencyRef[];
  
  /** Agents running concurrently with this agent */
  parallel_with: AgentName[];
  
  // ── Experience Hints ──
  
  /** Similar past trajectories found during Signal 3 lookup */
  similar_trajectories: TrajectoryRef[];
  
  /** Known pitfalls relevant to this task */
  known_pitfalls: string[];
  
  // ── Acceptance Criteria ──
  
  /** GIVEN-WHEN-THEN acceptance criteria for this sub-task */
  criteria: AcceptanceCriteria[];
}

/**
 * Reference to a dependency from a previous DAG step.
 */
export interface DependencyRef {
  /** Agent that produced this output */
  agent: AgentName;
  
  /** Task context reference */
  task_id: string;
  
  /** Key outputs from that agent */
  outputs: Record<string, unknown>;
  
  /** Files created/modified by that agent */
  files: FileChange[];
}

/**
 * Reference to a past trajectory for experience-driven development.
 */
export interface TrajectoryRef {
  /** Trajectory ID (e.g., "traj-2026-04-14-hr-api") */
  id: string;
  
  /** Brief description of the past task */
  summary: string;
  
  /** Outcome of the past task */
  outcome: OutcomeStatus;
  
  /** Relevance score (0-1) */
  relevance: number;
}

/**
 * GIVEN-WHEN-THEN acceptance criteria.
 */
export interface AcceptanceCriteria {
  given: string;
  when: string;
  then: string;
}

// ─────────────────────────────────────────────────────────
// AGENT OUTPUT (Response from agents)
// ─────────────────────────────────────────────────────────

/**
 * Standard output every agent produces after completing their sub-task.
 * This is captured by MUSE for trajectory and sent to next agent in DAG.
 */
export interface AgentOutput {
  /** Agent that produced this output */
  agent_name: AgentName;
  
  /** Task this output belongs to */
  task_id: string;
  
  /** ISO 8601 timestamp of completion */
  completed_at: string;
  
  // ── Results ──
  
  /** Files created, modified, or deleted */
  files_modified: FileChange[];
  
  /** Build verification result */
  build_status: BuildStatus;
  
  /** Build output (errors, warnings) */
  build_output?: string;
  
  // ── Self-Assessment ──
  
  /** Agent's self-score */
  self_score: AgentScore;
  
  /** Blockers encountered during work */
  blockers: string[];
  
  // ── Handoff Data ──
  
  /** Structured data for the next agent in the DAG */
  handoff_context: Record<string, unknown>;
  
  /** Human-readable summary of work done */
  summary: string;
  
  /** New insights discovered during work (for Experience Library) */
  insights_discovered?: string[];
}

/**
 * File change record for tracking agent modifications.
 */
export interface FileChange {
  /** Absolute file path */
  path: string;
  
  /** Type of change */
  operation: FileOperation;
  
  /** Lines added (for MODIFY/CREATE) */
  lines_added?: number;
  
  /** Lines removed (for MODIFY/DELETE) */
  lines_removed?: number;
}

/**
 * Agent self-score using the HERA rubric.
 */
export interface AgentScore {
  /** 0-10: Does output match domain spec and acceptance criteria? */
  correctness: number;
  
  /** 0-10: Code quality, architecture patterns, standards compliance */
  quality: number;
  
  /** 0-10: Minimal steps, optimal path, no unnecessary work */
  efficiency: number;
  
  /** 0-10: Leveraged Experience Library, applied past lessons */
  learning: number;
  
  /** Weighted total: (C×4 + Q×3 + E×2 + L×1) / 10 */
  total: number;
}

// ─────────────────────────────────────────────────────────
// MUSE EVALUATION (Feedback from evaluator)
// ─────────────────────────────────────────────────────────

/**
 * MUSE's evaluation of an agent's task output.
 */
export interface MuseEvaluation {
  /** Task being evaluated */
  task_id: string;
  
  /** ISO 8601 timestamp of evaluation */
  evaluated_at: string;
  
  /** Per-agent evaluations */
  agent_evaluations: AgentEvaluation[];
  
  /** Overall task outcome */
  outcome: OutcomeStatus;
  
  /** Overall task quality score */
  overall_score: number;
  
  /** Insights extracted from this task */
  insights: string[];
  
  /** Whether any RoPE triggers were activated */
  rope_triggered: RoPETrigger[];
}

/**
 * MUSE's evaluation of a single agent's contribution.
 */
export interface AgentEvaluation {
  /** Agent being evaluated */
  agent_name: AgentName;
  
  /** Agent's self-reported score */
  self_score: AgentScore;
  
  /** MUSE's independent score */
  muse_score: AgentScore;
  
  /** Final blended score: (Self × 0.3) + (MUSE × 0.7) */
  final_score: number;
  
  /** Credit level for this task */
  credit: CreditLevel;
  
  /** Evidence supporting the credit assignment */
  credit_evidence: string;
  
  /** Specific feedback for agent improvement */
  feedback: string;
}

/**
 * RoPE (Role-Aware Prompt Evolution) trigger record.
 */
export interface RoPETrigger {
  /** Agent whose prompt needs evolution */
  agent_name: AgentName;
  
  /** Reason for triggering RoPE */
  reason: string;
  
  /** Proposed prompt changes */
  proposed_changes: PromptChange[];
  
  /** Evidence trajectory IDs */
  evidence_trajectories: string[];
}

/**
 * A specific proposed change to an agent's prompt.
 */
export interface PromptChange {
  /** Section of the AGENT.md to modify */
  section: string;
  
  /** Type of change */
  change_type: "ADD_RULE" | "REFINE_RULE" | "REMOVE_RULE" | "ADD_EXAMPLE" | "ADD_PATTERN";
  
  /** Current content (if modifying) */
  current?: string;
  
  /** Proposed new content */
  proposed: string;
  
  /** Rationale for the change */
  rationale: string;
}

// ─────────────────────────────────────────────────────────
// EXPERIENCE LIBRARY TYPES
// ─────────────────────────────────────────────────────────

/**
 * Full execution trajectory (stored in experience-library/trajectories/).
 */
export interface Trajectory {
  /** Unique trajectory ID (e.g., "traj-2026-04-14-hr-api") */
  id: string;
  
  /** Task name */
  task_name: string;
  
  /** ISO 8601 date */
  date: string;
  
  /** Complexity T-shirt size */
  complexity: Complexity;
  
  /** Modules affected */
  modules: ModuleName[];
  
  /** Who requested the task */
  requester: string;
  
  /** DAG template used */
  dag_template: string;
  
  /** Execution DAG (ordered list of agents) */
  dag_execution: DAGNode[];
  
  /** Per-agent contributions */
  agent_contributions: AgentEvaluation[];
  
  /** Overall outcome */
  outcome: OutcomeStatus;
  
  /** Build result */
  build_status: BuildStatus;
  
  /** Overall quality score */
  quality_score: number;
  
  /** Key insights */
  insights: {
    what_worked: string[];
    what_failed: string[];
    new_patterns: string[];
  };
}

/**
 * A node in the execution DAG.
 */
export interface DAGNode {
  /** Step number */
  step: number;
  
  /** Agent assigned to this step */
  agent: AgentName;
  
  /** Whether this step ran in parallel with others */
  parallel_group?: number;
  
  /** Status of this step */
  status: TaskStatus;
  
  /** Duration in seconds */
  duration_seconds?: number;
}

// ─────────────────────────────────────────────────────────
// A2A AGENT CARD TYPES
// ─────────────────────────────────────────────────────────

/**
 * A2A Agent Card — describes an agent's capabilities for discovery.
 */
export interface AgentCard {
  /** Agent name */
  name: AgentName;
  
  /** Human-readable description */
  description: string;
  
  /** Card version */
  version: string;
  
  /** Agent URI for routing */
  url: string;
  
  /** Capabilities declaration */
  capabilities: AgentCapabilities;
  
  /** Skills list (human-readable) */
  skills: string[];
  
  /** Constraint boundaries */
  constraints: AgentConstraints;
  
  /** Scoring configuration */
  scoring: {
    rubric: string;
    baseline: number;
    rope_trigger: number;
  };
}

/**
 * Agent capabilities — tools provided and consumed.
 */
export interface AgentCapabilities {
  /** MCP tools this agent provides to others */
  tools_provided: string[];
  
  /** MCP tools this agent consumes from servers */
  tools_consumed: string[];
  
  /** Input content types accepted */
  input_modes: string[];
  
  /** Output content types produced */
  output_modes: string[];
}

/**
 * Agent constraints — file access boundaries and rules.
 */
export interface AgentConstraints {
  /** Glob patterns for permitted file access */
  file_access: string[];
  
  /** Glob patterns for denied file access */
  file_denied: string[];
  
  /** Prerequisites before agent can start work */
  dependencies: string[];
  
  /** Domain-specific rules */
  domain_rules?: string[];
  
  /** Financial rules (for agents handling money) */
  financial_rules?: string[];
}

// ─────────────────────────────────────────────────────────
// MCP DISPATCH TYPES (JAVIS → Agent)
// ─────────────────────────────────────────────────────────

/**
 * JAVIS dispatch command to activate an agent via MCP.
 */
export interface DispatchCommand {
  /** Target agent */
  agent: AgentName;
  
  /** Full task context */
  context: TaskContext;
  
  /** Specific sub-task instructions */
  instructions: string;
  
  /** Expected output type */
  expected_output: string;
  
  /** Timeout in seconds */
  timeout_seconds?: number;
}

/**
 * Registry query for discovering agents by capability.
 */
export interface DiscoverAgentsQuery {
  /** Required capabilities */
  required_capabilities?: string[];
  
  /** Required skills */
  required_skills?: string[];
  
  /** Module context */
  module?: ModuleName;
  
  /** Minimum agent score baseline */
  min_score?: number;
}

/**
 * Registry query result.
 */
export interface DiscoverAgentsResult {
  /** Matched agents with relevance scores */
  agents: Array<{
    card: AgentCard;
    relevance: number;
    recent_score: number;
  }>;
}

// ─────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────

/**
 * Calculate weighted agent score from component scores.
 */
export function calculateScore(score: Omit<AgentScore, 'total'>): number {
  return (score.correctness * 4 + score.quality * 3 + score.efficiency * 2 + score.learning * 1) / 10;
}

/**
 * Calculate blended score: (Self × 0.3) + (MUSE × 0.7)
 */
export function blendScore(selfTotal: number, museTotal: number): number {
  return Math.round((selfTotal * 0.3 + museTotal * 0.7) * 100) / 100;
}

/**
 * Generate a trajectory ID from date and task slug.
 */
export function trajectoryId(date: string, slug: string): string {
  return `traj-${date}-${slug}`;
}

/**
 * Check if an agent belongs to a specific team.
 */
export function getTeam(agent: AgentName): keyof typeof TEAMS {
  for (const [team, members] of Object.entries(TEAMS)) {
    if ((members as readonly string[]).includes(agent)) {
      return team as keyof typeof TEAMS;
    }
  }
  throw new Error(`Unknown agent: ${agent}`);
}
