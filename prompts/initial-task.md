# Initial task

Source: human message in this chat, 2026-11-11 17:32 UTC+8. The body below is that message, unchanged.

---

You are the Lead Engineering Orchestrator for a one-day proof-of-concept assessment.

PROJECT:
Cybergirls Agentic Job Match POC

CONTEXT:
We are rebuilding a small, isolated feature from an existing AI HR assistant application.

The purpose is NOT to demonstrate how much code AI can generate. The purpose is to demonstrate a disciplined multi-agent software development process.

The assessment requires:
1. An orchestrator delegating to specialist agents.
2. Written artifacts for all agent handoffs.
3. Parallel execution of independent tasks.
4. Independent verification of changes.
5. Human approval gates.
6. Failure recovery, bounded retries, and context management.
7. Traceable execution logs, decisions, time, and cost.
8. Version-controlled agent definitions and reusable skills.

TECHNOLOGY:
- Next.js with TypeScript
- Next.js API routes
- Local JSON seed data
- Vitest for unit tests
- Playwright for browser smoke testing
- Cursor custom subagents
- Git for change tracking

APPLICATION SCOPE:
- Three fictional candidate profiles.
- Three fictional job descriptions.
- A deterministic matching algorithm.
- A matching results interface.
- No production services or credentials.
- No external LLM API dependency.

PROPOSED SCORING:
- Required skills: 70%
- Experience: 30%
- Document the exact scoring formula, normalization and edge cases before implementation.

AGENT ROSTER:
1. Orchestrator — planning, delegation, monitoring and recovery.
2. Requirements Architect — requirements and acceptance criteria.
3. Backend Engineer — API and matching engine.
4. Frontend Engineer — application interface.
5. QA Engineer — independent acceptance verification.
6. Security Reviewer — code quality, security and risk review.

You may recommend changes to the roster, but explain the trade-offs.

FIRST TASK — PLANNING ONLY:

Create the following repository artifacts:

1. AGENTS.md
   Global orchestration rules, quality gates, artifact requirements, human approval boundaries, and retry limits.

2. docs/scope.md
   MVP boundaries, exclusions, assumptions and acceptance criteria.

3. docs/architecture.md
   Proposed application architecture, data model, API contract and trade-offs.

4. docs/workflow-design.md
   Agent responsibilities, execution order, parallelization, written handoffs, review gates, failure handling, context limits and logging strategy.

5. docs/decisions.md
   An architecture decision log explaining significant decisions and rejected alternatives.

6. .cursor/agents/
   Create actual Cursor-compatible specialist agent definitions, with valid YAML frontmatter, narrow responsibilities, tool constraints and required deliverables.

7. .cursor/skills/
   Create reusable skills for:
   - contract-first development
   - acceptance verification
   - failure recovery

Each skill must use a valid SKILL.md structure.

IMPORTANT RULES:
- Do not implement application code yet.
- Do not install packages yet.
- Do not deploy anything.
- Do not use real user data or production credentials.
- Do not invent execution history or test results.
- Record the actual planning actions and decisions.
- Differentiate instructions from permissions enforced by the environment.
- Identify any constraints that Cursor cannot enforce automatically.
- Keep the design achievable within one working day.

Create the documentation and agent definitions first.

Then summarize:
1. The proposed architecture.
2. The agent roster and permissions.
3. The execution plan.
4. Potential risks.
5. What requires my approval.

STOP after planning and wait for my explicit approval before implementation.
