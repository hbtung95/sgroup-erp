/**
 * SGROUP ERP — A2A Agent Registry Service (HERA V5)
 * 
 * Provides agent discovery capabilities by scanning Agent Cards.
 * JAVIS uses this during Signal 4 (Capability Discovery) to find
 * the best agents for a task based on capabilities, skills, and constraints.
 * 
 * @module registry
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type { AgentCard, AgentName, ModuleName } from "../protocols/context-schema.js";

const CARDS_DIR = resolve(join(__dirname, "agent-cards"));

// ─────────────────────────────────────────────────────────
// REGISTRY CORE
// ─────────────────────────────────────────────────────────

/**
 * Load all agent cards from the registry directory.
 */
export function loadAllCards(): AgentCard[] {
  if (!existsSync(CARDS_DIR)) return [];

  return readdirSync(CARDS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      try {
        const content = readFileSync(join(CARDS_DIR, f), "utf-8");
        return JSON.parse(content) as AgentCard;
      } catch {
        console.error(`[Registry] Failed to parse agent card: ${f}`);
        return null;
      }
    })
    .filter((card): card is AgentCard => card !== null);
}

/**
 * Get a specific agent's card by name.
 */
export function getAgentCard(name: AgentName): AgentCard | null {
  const cardPath = join(CARDS_DIR, `${name.toLowerCase()}.json`);
  if (!existsSync(cardPath)) return null;

  try {
    return JSON.parse(readFileSync(cardPath, "utf-8")) as AgentCard;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// DISCOVERY QUERIES
// ─────────────────────────────────────────────────────────

export interface DiscoverQuery {
  /** Required tool capabilities */
  required_capabilities?: string[];
  /** Required skills (fuzzy match) */
  required_skills?: string[];
  /** Module context for filtering */
  module?: ModuleName;
  /** Team filter */
  team?: string;
  /** Minimum activation tier */
  min_tier?: string;
}

export interface DiscoverResult {
  card: AgentCard;
  relevance: number;
  match_reasons: string[];
}

/**
 * Discover agents matching the query criteria.
 * Returns agents sorted by relevance score (highest first).
 */
export function discoverAgents(query: DiscoverQuery): DiscoverResult[] {
  const allCards = loadAllCards();
  const results: DiscoverResult[] = [];

  for (const card of allCards) {
    let relevance = 0;
    const reasons: string[] = [];

    // Match by required capabilities
    if (query.required_capabilities) {
      const provided = new Set(card.capabilities.tools_provided);
      const consumed = new Set(card.capabilities.tools_consumed);
      const all = new Set([...provided, ...consumed]);

      for (const cap of query.required_capabilities) {
        // Exact match
        if (all.has(cap)) {
          relevance += 3;
          reasons.push(`Exact capability match: ${cap}`);
        }
        // Partial match (prefix)
        else if ([...all].some(t => t.includes(cap) || cap.includes(t))) {
          relevance += 1;
          reasons.push(`Partial capability match: ${cap}`);
        }
      }
    }

    // Match by required skills (fuzzy)
    if (query.required_skills) {
      for (const skill of query.required_skills) {
        const skillLower = skill.toLowerCase();
        const matched = card.skills.some(s => s.toLowerCase().includes(skillLower));
        if (matched) {
          relevance += 2;
          reasons.push(`Skill match: ${skill}`);
        }
      }
    }

    // Match by module (check file access patterns)
    if (query.module) {
      const modulePattern = `modules/${query.module}`;
      const hasAccess = card.constraints.file_access.some(p => p.includes(modulePattern) || p.includes("modules/*"));
      if (hasAccess) {
        relevance += 1;
        reasons.push(`Module access: ${query.module}`);
      }
    }

    // Match by team
    if (query.team) {
      const cardTeam = (card as AgentCard & { team?: string }).team;
      if (cardTeam && cardTeam === query.team) {
        relevance += 1;
        reasons.push(`Team match: ${query.team}`);
      }
    }

    if (relevance > 0) {
      results.push({ card, relevance, match_reasons: reasons });
    }
  }

  // Sort by relevance (descending)
  results.sort((a, b) => b.relevance - a.relevance);
  return results;
}

/**
 * Get all agents that can work on a specific module.
 */
export function getAgentsForModule(module: ModuleName): AgentCard[] {
  const allCards = loadAllCards();
  return allCards.filter(card =>
    card.constraints.file_access.some(p => p.includes(`modules/${module}`) || p.includes("modules/*"))
  );
}

/**
 * Get agents by team.
 */
export function getAgentsByTeam(team: string): AgentCard[] {
  const allCards = loadAllCards();
  return allCards.filter(card => (card as AgentCard & { team?: string }).team === team);
}

/**
 * Check if an agent can provide a specific tool.
 */
export function canAgentProvide(agentName: AgentName, toolName: string): boolean {
  const card = getAgentCard(agentName);
  if (!card) return false;
  return card.capabilities.tools_provided.includes(toolName);
}

/**
 * Get the full capability matrix — which tools are provided by which agents.
 */
export function getCapabilityMatrix(): Record<string, AgentName[]> {
  const allCards = loadAllCards();
  const matrix: Record<string, AgentName[]> = {};

  for (const card of allCards) {
    for (const tool of card.capabilities.tools_provided) {
      if (!matrix[tool]) matrix[tool] = [];
      matrix[tool].push(card.name);
    }
  }

  return matrix;
}
