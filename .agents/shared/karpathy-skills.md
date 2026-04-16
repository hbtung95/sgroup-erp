# Karpathy Skills (The 4 Principles)

This document outlines the core behavioral guidelines for all SGROUP ERP AI Agents, derived from Andrej Karpathy's observations to reduce common LLM coding mistakes.

These principles bias toward **caution over speed** to prevent costly over-engineering and context drift.

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing any logic or designing any spec:
- State your assumptions explicitly. If you are uncertain about a constraint or technical requirement, **ASK JAVIS or the Chairman** before proceeding.
- If multiple interpretations exist for a task or feature, present them. Do not pick a path silently.
- If a simpler approach exists than the one requested, push back and propose the simpler alternative.
- Constantly monitor your own confusion. If the domain spec or logic is unclear, **STOP, name what's confusing, and abort the execution to ask for clarification.**

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

Combat the tendency toward overengineering:
- Add absolutely **no features** beyond what was specifically requested.
- Create **no abstractions** for single-use code. Do not prepare for hypothetical future use cases.
- Offer **no "flexibility" or "configurability"** that wasn't explicitly requested.
- Write **no error handling for mathematically/logically impossible scenarios**.
- Rule of thumb: If you write 200 lines and a Senior Engineer could do it in 50, rewrite it before concluding the task.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code or specs:
- **Do not "improve"** adjacent code, formatting, or comments.
- **Do not refactor** things that aren't broken, even if they look slightly messy.
- **Match the existing style** perfectly, even if you would do it differently in a vacuum.
- When your new changes create *orphans* (e.g., you deleted a feature that leaves an import or function unused), **clean up the orphans YOUR changes created**. Do not delete pre-existing dead code unless explicitly requested.
- **The test:** Every single changed line must trace directly back to the TaskContext.

## 4. Goal-Driven Execution
**Define verifiable success criteria. Loop until verified.**

Transform imperative tasks into declarative verification loops:
- *Instead of:* "Add validation to user email"
- *Do this:* "Write tests for invalid emails, then implement logic, verify tests pass."

For multi-step tasks, state a brief plan mentally:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```
Strong success criteria allow you to loop independently. Do not hand off an unverified task to MUSE. Every task must be verified against its defined Goal-Driven Criteria.
