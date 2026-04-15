# MCP Orchestration Protocol — HERA V5

How JAVIS orchestrates via MCP. ALL agents must understand input/output contracts.

## Dispatch Flow
```
Chairman → JAVIS 4-Signal Classify → DAG Construction → MCP Dispatch
  → Agent Execution (TaskContext → work → AgentOutput)
    → MUSE Evaluation (Score → Credit → Trajectory → Scorecard → RoPE)
```

## Signal 4: Capability Discovery
```
1. Parse task → capability tags + skills + module
2. registry_discover_agents({capabilities, skills, module})
3. Ranked results: [{card: BRIAN, relevance: 8}, ...]
4. Cross-ref Signal 1: S4 confirms/overrides S1
5. Conflicts: S4>S1 | Higher relevance wins | Higher scorecard breaks ties
```

## Dispatch Schema (TaskContext)
```json
{
  "task_id": "01926a7b-...",
  "task_name": "Create HR Payroll API endpoints",
  "priority": "P2", "complexity": "M", "module": "hr",
  "domain_spec_ref": "domain://specs/hr",
  "dag_template": "DAG-M-FEATURE", "dag_step": 2, "dag_total_steps": 5,
  "dag_dependencies_met": [{"agent":"BELLA","outputs":{"spec_approved":true,"entities":["Payroll"]}}],
  "parallel_with": ["SENTRY"],
  "similar_trajectories": [{"id":"traj-...","outcome":"SUCCESS","relevance":0.85}],
  "criteria": [{"given":"...","when":"...","then":"..."}]
}
```

## Output Schema (AgentOutput)
```json
{
  "agent_name": "BRIAN", "task_id": "01926a7b-...",
  "files_modified": [{"path":"modules/hr/api/internal/model/payroll.go","operation":"CREATE"}],
  "build_status": "PASS",
  "self_score": {"correctness":8,"quality":8,"efficiency":7,"learning":8,"total":7.9},
  "handoff_context": {"endpoints_created":["/api/v1/hr/payroll"],"models_updated":["Payroll"]},
  "summary": "Created payroll API. Decimal money. Tests passing."
}
```

## MCP Tools Per Phase
| Phase | Server | Tools |
|-------|--------|-------|
| Classify | Experience | exp_search_trajectories |
| DAG Build | Domain | domain_get_spec, domain_list_modules |
| Dispatch | Domain + Experience | domain_scaffold_*, exp_read_patterns |
| Verify | Build | build_turbo, build_go_module |
| Evaluate | Experience | exp_capture_trajectory, exp_update_scorecard |

## Error Handling
| Error | Action |
|-------|--------|
| Build fail | Retry 1× with error context → still fails → MUSE captures failure |
| Stuck 3× | STOP → MUSE failure trajectory → Post-Mortem |
| MCP down | Fallback V4 markdown dispatch |
| Schema invalid | Log → JAVIS rebuilds context |
| Boundary violation | Reject → log security event |
| Unclear task | Escalate Chairman — do NOT guess |

## Backward Compatibility
MCP is additive. AGENT.md valid. ROUTING.md works. Free-form markdown accepted.
Migration: structured context preferred → markdown supplementary.

*V5.0 | 2026-04-14 | Owner: JAVIS*
