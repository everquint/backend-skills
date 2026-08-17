# Agent Orchestration

## Contents

- Orchestrator ownership
- Plan from dependencies
- Parallel worktrees
- Coordination log
- Model selection
- Agent briefs
- Integration and verification
- Example: projects and tasks

## Orchestrator ownership

Use one primary orchestrator for the complete outcome. The orchestrator must:

- understand the request and repository before delegating;
- turn the outcome into a dependency graph and verifiable tasks;
- make or obtain the architectural decisions that unblock implementation;
- author every delegated task with explicit scope and success criteria;
- assign models according to task risk and capability;
- own the shared coordination log and resolve blockers;
- inspect every returned commit and diff instead of trusting an agent summary;
- integrate in dependency order; and
- run final correctness, security, architecture, and repository-wide verification.

Delegation never transfers accountability. Subagent reports are evidence for the orchestrator to verify, not proof of completion.

Do not introduce parallel agents for a task whose coordination cost exceeds its independent work. Documentation-only edits, one-file fixes, and tightly coupled changes normally remain sequential.

## Plan from dependencies

Create the dependency graph before creating worktrees. Separate work into:

1. foundations required by later tasks;
2. independent feature slices that can run concurrently; and
3. shared integration work that must run after those slices.

Complete and verify foundations before fan-out. Typical foundations include repository bootstrap, runtime configuration, authentication, tenant context, database connection when needed, shared user or identity models, stable domain contracts, migrations required by every slice, and common test infrastructure.

Parallelize only tasks that:

- have no unfinished dependency on each other;
- own disjoint implementation files or have an explicit shared-file owner;
- use stable contracts established before fan-out;
- can be tested independently; and
- can be integrated without choosing between conflicting business decisions.

Keep central registries, package exports, migration ordering, generated manifests, lockfiles, and shared configuration under one owner. Prefer a serial integration step when multiple slices must update them.

## Parallel worktrees

Use one Git worktree and one short-lived branch per concurrent implementation agent. Never run simultaneous coding agents in the same working directory.

Before fan-out:

1. make the accepted foundation available from a stable commit;
2. create every feature branch from that commit;
3. create a separate worktree for every feature branch;
4. record each worktree, branch, task, owner, and base commit in the coordination log; and
5. give each agent an explicit file-ownership boundary.

An agent may commit only its coherent task to its own branch. It must not stash, rewrite another branch, alter another worktree, or repair unrelated changes. Remove worktrees only after their commits are integrated or deliberately rejected and their state is accounted for.

If two tasks begin touching the same behavioral files, stop parallel execution for those tasks. Let the orchestrator redefine ownership, sequence the work, or consolidate it under one agent.

## Coordination log

Create one task-specific shared coordination directory outside every repository worktree. Give every agent its absolute path, restrict it to the current user, and remove it after the task is integrated unless retention is required. Do not commit it unless the user explicitly requests an audit artifact.

Use this shape:

```text
<coordination-root>/<run-id>/
├── plan.md                    # orchestrator-owned dependency graph and decisions
└── agents/
    ├── foundation.md          # owned by the foundation agent
    ├── projects.md            # owned by the projects agent
    └── tasks.md               # owned by the tasks agent
```

Each agent appends only to its own log. This avoids concurrent writes to one file. Record concise timestamped entries containing:

- current state: `planned`, `working`, `blocked`, `ready`, `integrated`, or `rejected`;
- base commit and latest task commit;
- files or modules owned;
- checks run and their actual result;
- blockers, decisions needed, and contract changes; and
- the next intended action.

Use the platform's direct agent messaging for urgent questions and notifications, then record the durable result in the log. The orchestrator reads agent logs at milestones, records accepted decisions in `plan.md`, and communicates changes to every affected agent. Never put credentials, tokens, user secrets, or sensitive payloads in coordination logs.

## Model selection

Discover the models and reasoning controls currently available before assigning work. Select by capability and task risk rather than permanently binding the skill to product names.

Use this role hierarchy:

| Role                 | Model requirement                                                   | Responsibilities                                                                                                   |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Orchestrator         | Strongest available model at the highest practical reasoning effort | Understand the goal, author task briefs, plan dependencies, integrate, review, and verify                          |
| Decision specialist  | Strong reasoning model with high reasoning effort                   | Analyze bounded architecture, security, data, concurrency, or migration decisions and report options and tradeoffs |
| Implementation agent | Strong coding model sized for the slice                             | Implement an already-decided feature, add tests, and run scoped checks                                             |
| Mechanical agent     | Fast reliable coding model                                          | Perform bounded renames, scaffolding, repetitive test cases, formatting, or other low-judgment work                |

For example, when those models are available, OpenAI assignments may use `gpt-5.6-sol` with `xhigh` reasoning for orchestration and final verification, `gpt-5.6-sol` with `high` reasoning for bounded decisions, and `gpt-5.6-terra` for implementation and mechanical work. An analogous lineup may use Fable 5, Opus 5, and Sonnet 5 respectively. These are examples, not permanent requirements: re-evaluate the current model inventory and choose the strongest suitable model for each role.

Do not ask an implementation agent to settle an unresolved high-impact design decision while coding. Send the decision to the decision specialist or retain it with the orchestrator, record the accepted outcome, and then resume implementation. The orchestrator remains the final decision-maker.

## Agent briefs

The strongest available orchestrator authors each task. Make every brief self-contained and include:

- the concrete outcome and why it is needed;
- the accepted architecture and decisions that constrain it;
- the exact worktree, branch, and base commit;
- owned files or modules and forbidden shared files;
- interfaces supplied by prerequisite work;
- applicable skill references and repository instructions;
- required happy-path and failure-path tests;
- commands and gates to run;
- the coordination-log path and update expectations;
- the required commit boundary and Conventional Commit form; and
- the evidence required in the final handoff.

Tell agents to stop and log a blocker when the brief conflicts with repository reality, a required contract is missing, or implementation would cross the ownership boundary. They must not silently redesign the system or broaden scope.

## Integration and verification

The orchestrator reviews each branch before integration:

1. read the agent log and commit list;
2. inspect the actual diff and verify scope ownership;
3. run the slice's focused tests and static checks;
4. verify architecture, authentication, authorization, tenant isolation, data integrity, and error behavior where applicable;
5. integrate only commits that are independently coherent; and
6. update the coordination state.

After integrating all slices, run repository-wide type or static checks, linting, tests, coverage, architecture checks, security checks, builds, and E2E tests that apply. Review interactions between slices; passing isolated tests does not prove the combined system is correct.

The orchestrator writes the final task report. State what was integrated, which checks actually ran, any remaining risk, and what is ready for the user to test.

## Example: projects and tasks

For a todo backend with users, projects, and tasks, do not immediately start three coding agents.

First complete a foundation slice:

- runtime and package setup;
- database connection only if persistence is required;
- user or identity model;
- authentication and verified tenant context;
- agreed `projects`, `tasks`, and relationship contracts;
- baseline migration strategy; and
- shared test and authorization fixtures.

After the foundation is committed and verified, Projects and Tasks may run in parallel only when their contracts and file ownership are independent. If `tasks` carries a project foreign key, settle that schema contract first. Assign migration ordering, shared exports, route registration, OpenAPI aggregation, and lockfile updates to one integration owner rather than letting both agents edit the same files.

Each feature agent implements its logic, ORM portion, protocol handlers, happy and failure tests, authentication behavior, and tenant-isolation cases within its worktree. The orchestrator then integrates both branches, wires shared registries serially, and runs combined E2E verification.
