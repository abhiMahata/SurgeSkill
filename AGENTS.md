# SurgeSkill Agent Operating Policy (AGENTS.md)

## Purpose
Defines how AI coding agents must operate in the SurgeSkill repository. `CONTEXT_MAP.md` determines what context to read; this file determines how agents plan, edit, validate, use tools, recover from failures, and report work.

## Mandatory Workflow
```text
Receive Task
→ Classify Task
→ Read docs/ai/CONTEXT_MAP.md
→ Load Required Context
→ Inspect Current Code
→ Identify Conflicts and Risks
→ Plan Non-Trivial Work
→ Implement the Bounded Task
→ Validate
→ Review Diff
→ Synchronize Documentation
→ Report
```

Do not begin implementation before required context and relevant code have been inspected.

## Core Operating Principles
1. Evidence before assumptions.
2. Understand before editing.
3. Prefer bounded, architecture-compatible changes.
4. Preserve existing working systems unless replacement is justified.
5. Never weaken security to make client code work.
6. Treat user work and uncommitted changes as intentional.
7. Validate claims before reporting success.
8. Keep code and canonical documentation synchronized.
9. Tool capability does not imply permission.
10. Report failures and limitations truthfully.

## Evidence and Anti-Hallucination Policy
Never claim that a file, dependency, function, schema, API, environment variable, test, command result, application behavior, or infrastructure capability exists unless verified from repository evidence, tool output, or authoritative project documentation.

Distinguish:
- `KNOWN`: verified by evidence.
- `ASSUMED`: a stated, low-risk interpretation.
- `UNKNOWN`: not yet verified.

Inspect rather than invent. If uncertainty materially affects product behavior, security, data integrity, architecture, destructive operations, or scope, ask for clarification or approval.

## Context Protocol
For every task:
1. Classify the task using `docs/ai/CONTEXT_MAP.md`.
2. Read the required canonical documents.
3. Inspect relevant implementation files.
4. Inspect callers, dependencies, tests, persistence, and security implications where applicable.
5. Resolve or report material conflicts before sensitive changes.

Current code is evidence of implementation state, not necessarily product truth.

## Planning Protocol
For non-trivial tasks, produce a concise plan containing:
- task understanding;
- context documents read;
- files inspected;
- current behavior;
- target behavior;
- expected files to change;
- data-model impact;
- security impact;
- validation plan.

Then implement.

## Scope Control
Implementation scope is:

```text
Requested Task
+
Directly Necessary Changes
```

Do not fix unrelated bugs, redesign unrelated UI, refactor unrelated modules, or implement unrequested features. Record useful unrelated findings as follow-up observations.

## Brownfield Preservation
SurgeSkill is an existing application. Prefer the smallest architecture-compatible change over wholesale replacement.

Before replacing a working subsystem, establish:
- current implementation;
- why it cannot satisfy approved requirements;
- migration impact;
- replacement plan;
- validation plan.

Preserve the existing product appearance unless the task explicitly requires UI changes.

## Autonomy Model

### Autonomous Actions
Agents may:
- inspect and search repository files;
- read context documents;
- create bounded implementation plans;
- edit code within approved scope;
- create feature-specific components, hooks, utilities, and tests;
- run existing tests, linting, type checks, and builds;
- inspect Git status, diff, log, and branches;
- fix errors directly caused by the current implementation;
- update directly affected documentation.

### Proceed but Explicitly Report
Agents may perform these when directly necessary, but must report them:
- create new source files;
- move or rename non-critical files;
- change interfaces or types;
- alter query structures;
- add Firestore indexes;
- modify Firebase Storage paths;
- update environment-variable requirements;
- introduce significant abstractions;
- update architecture documentation due to discovered contradictions.

### Explicit Approval Required
Stop and request approval before:
- deleting substantial existing functionality;
- changing approved MVP scope;
- adding paid infrastructure;
- replacing Firebase or the primary database;
- installing a major runtime dependency;
- removing dependencies;
- changing authentication strategy;
- changing role semantics;
- weakening Firestore or Storage Security Rules;
- changing tenant-isolation policy;
- granting privileged roles new private-data access;
- executing destructive Git operations;
- force-pushing;
- resetting or discarding user changes;
- deleting databases or production data;
- deploying to production;
- making a major architecture replacement.

## Security Policy
Never weaken Firestore or Storage Security Rules merely to make client code succeed.

For permission failures:
```text
Inspect AUTH.md
→ Inspect RBAC.md
→ Inspect DATABASE.md
→ Inspect Relevant Domain Architecture
→ Inspect Client Query/Mutation
→ Inspect Rules
→ Identify the Incorrect Layer
→ Fix the Root Cause
```

Never use broad temporary production rules such as unauthenticated access or unconditional allow rules.

## Database Change Protocol
Before changing schema:
1. inspect `DATABASE.md`;
2. inspect relevant domain architecture;
3. identify query impact;
4. identify index impact;
5. identify Security Rules impact;
6. identify migration/backward-compatibility impact;
7. implement the bounded change;
8. update canonical documentation;
9. validate.

Do not silently introduce collections, fields, relationships, or storage paths.

## Dependency Policy
Before adding a dependency, determine whether:
- an existing dependency already solves the problem;
- the platform provides the capability;
- a small local utility is sufficient.

Major runtime dependencies require approval. Any proposed dependency must be justified by need, alternatives, maintenance, security, bundle/runtime cost, license, and compatibility.

Never copy external repository code blindly. Evaluate license, maintenance, security, dependency cost, compatibility, quality, and actual need.

## Git Safety
Agents may use read-only and inspection commands such as:
- `git status`
- `git diff`
- `git log`
- `git branch`

Do not autonomously run destructive commands including:
- `git reset --hard`
- `git clean -fd`
- `git checkout -- .`
- `git restore .`
- force push operations

Never overwrite or discard uncommitted user changes. User work is presumed intentional unless explicitly stated otherwise.

## Tool and MCP Policy
Tool access does not grant unrestricted operational permission.

Regardless of MCP server, API, CLI, or integration:
- follow this file's autonomy boundaries;
- inspect before mutating;
- use least privilege;
- avoid destructive actions without approval;
- do not deploy merely because a deployment tool is available;
- do not merge or force-push merely because a GitHub tool permits it;
- do not delete Firebase data merely because an administrative tool permits it;
- report significant tool-driven changes.

## Firebase-Specific Policy
- Keep Firebase configuration and rules version-controlled.
- Never store Base64 media in Firestore.
- Use Firebase Storage for approved attachments.
- Keep queries aligned with Security Rules.
- Remember that Security Rules are not filters.
- Preserve tenant isolation.
- Preserve protected and immutable fields.
- Use bounded queries and cursor pagination where required.
- Clean up Firestore listeners.
- Do not introduce presence, typing indicators, push notifications, or other deferred systems unless scope is explicitly changed.

## Failure Recovery
When validation fails:
```text
Read Error
→ Determine Whether Current Changes Caused It
→ Identify Root Cause
→ Fix Within Scope
→ Rerun Validation
→ If Blocked, Report Exact Failure
```

Do not:
- hide failures;
- disable checks to obtain a passing result;
- delete failing functionality without justification;
- change unrelated systems;
- claim completion when required validation failed.

## Validation Protocol
Apply relevant validation in this order:

### Static Validation
- type checking;
- linting.

### Functional Validation
- relevant unit/integration tests;
- feature-specific behavior.

### Security Validation
- Firestore/Storage Rules tests;
- authorization and tenant-isolation cases.

### Integration Validation
- production build;
- affected feature interactions.

### Diff Review
Check:
- task scope;
- accidental changes;
- debug code;
- secrets;
- unrelated formatting churn;
- documentation consistency.

Not every task requires every step. Use `CONTEXT_MAP.md` and `TESTING_STRATEGY.md` once available.

## Documentation Synchronization
When implementation changes an approved architectural fact:
1. identify the canonical document;
2. verify compatibility with `MVP_SCOPE.md`;
3. update the affected document or report the conflict;
4. keep code, rules, tests, and documentation consistent.

Do not update documentation to conceal an implementation deviation.

## Reporting Protocol
After implementation, report:
- summary;
- files changed;
- behavior implemented;
- validation commands run;
- validation results;
- security impact;
- database impact;
- documentation updated;
- known limitations;
- follow-up observations.

Never report “everything works” without evidence.

## Clarification Policy
Ask questions only when uncertainty materially affects:
- product behavior;
- security;
- data integrity;
- architecture;
- destructive operations;
- irreversible decisions;
- significant scope.

For minor implementation uncertainty, choose the safest architecture-compatible interpretation, state the assumption, and proceed.

## Multi-Agent Policy
Every specialized agent should receive:
- role;
- bounded task;
- minimum sufficient context package;
- allowed actions;
- prohibited actions;
- required output;
- validation responsibility.

Agents should hand off durable artifacts through code, tests, documentation, plans, and review findings—not hidden conversation history.

Specialized review agents should not modify production code unless their assigned role explicitly permits implementation.

## Definition of Done
A task is not complete until:
- required context was read;
- relevant code was inspected;
- implementation matches approved scope;
- no known security control was bypassed;
- relevant validation was run;
- validation results were reported truthfully;
- the diff was reviewed;
- affected canonical documentation was updated where necessary;
- a final implementation report was produced.

## Relationship to Project Documentation
- `CONTEXT_MAP.md` determines what agents read.
- `AGENTS.md` determines how agents operate.
- `MVP_SCOPE.md` defines current delivery boundaries.
- Domain architecture documents define implementation constraints.
- `IMPLEMENTATION_PLAN.md` will define execution order.
- `TESTING_STRATEGY.md` will define proof of correctness.

## Acceptance Criteria
This policy is effective when agents inspect before editing, remain within bounded scope, preserve brownfield systems, avoid hallucinated repository facts, respect security and Git boundaries, validate changes, synchronize documentation, report evidence, and remain suitable for future multi-agent orchestration.
