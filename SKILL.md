---
name: everquint-backend-skill
description: Apply Ever Quint's language-neutral backend engineering standards when creating, changing, fixing, testing, debugging, documenting, releasing, observing, deploying, or reviewing backend repositories and features. Use for backend architecture, object-oriented logic, ORM and data integrity, REST/MCP/events, production Temporal workflows and payload limits, runtime resilience, infrastructure dependencies, application security, trusted proxies and client IPs, secrets, OpenTelemetry/OpenObserve, debug tooling, Terraform, feature flags, effective tests and coverage, JavaScript/TypeScript, Go, Python, Rust and Cargo workspaces, delivery workflow, documentation, supply-chain security, Docker images, package publishing, or backend code quality.
---

# Ever Quint Backend Standards

Build backend changes around a single object-oriented business-logic core. Treat REST, MCP, and workflows as consumers; isolate persistence and external providers behind ORM and service boundaries.

## Load the standards

- Read [architecture.md](references/architecture.md) before designing or changing repository structure, modules, dependencies, ORM access, services, REST, MCP, or workflows.
- Read [engineering.md](references/engineering.md) before writing or reviewing code.
- Read [adoption.md](references/adoption.md) when initializing a repository, applying these standards to an existing repository, selecting language tooling, or building enforcement gates.
- Read [testing.md](references/testing.md) for every behavior-bearing change.
- Read [security.md](references/security.md) when work touches authentication, authorization, RBAC, secrets, user or tenant isolation, MCP authorization, or other sensitive behavior.
- Read [observability.md](references/observability.md) when instrumenting logs, metrics, traces, errors, health signals, correlation, telemetry export, alerts, dashboards, or OpenObserve.
- Read [debugging.md](references/debugging.md) when creating or changing root `debug`, a REST Swagger server, MCP Inspector integration, or direct Temporal workflow execution without a Temporal server.
- Read [runtime-and-resilience.md](references/runtime-and-resilience.md) when changing configuration, startup, dependency health, error containment, timeouts, retries, circuit breakers, health checks, shutdown, or crash behavior.
- Read [api-and-events.md](references/api-and-events.md) when changing REST or MCP contracts, validation, errors, pagination, idempotency, versioning, rate limits, webhooks, queues, events, scheduled jobs, or CLI consumers.
- Read [data-integrity.md](references/data-integrity.md) when changing transactions, concurrency, migrations, indexes, query performance, retention, deletion, backups, or restoration.
- Read [supply-chain.md](references/supply-chain.md) when changing dependencies, CI, build inputs, artifact provenance, SBOMs, signing, vulnerability scanning, images, or deployment verification.
- Read [delivery.md](references/delivery.md) when starting work, creating branches or worktrees, committing, opening or reviewing pull requests, merging, rolling back, or preparing a release tag.
- Read [feature-flags.md](references/feature-flags.md) when adding or changing feature flags, staged rollouts, kill switches, experiments, provider integrations, or flag cleanup.
- Read [application-security.md](references/application-security.md) when handling untrusted input, browser requests, proxy headers, client IPs, outbound URLs, uploads, serialization, security headers, CORS, CSRF, injection, or abuse prevention.
- Read [deployment.md](references/deployment.md) only when the user explicitly asks for Terraform or the task changes an existing root `terraform` tree. Do not infer or scaffold Terraform from a general backend or deployment request.
- Read [test-effectiveness.md](references/test-effectiveness.md) for every behavior-bearing change and when reviewing whether tests genuinely detect defects beyond achieving coverage.
- Read [temporal.md](references/temporal.md) when creating or changing production Temporal workflows, activities, workers, payloads, histories, retries, signals, updates, versioning, or deployments.
- Read [language-profiles.md](references/language-profiles.md) when initializing or changing JavaScript/TypeScript, Go, Python, or Rust tooling, project layout, formatting, linting, static analysis, testing, coverage, or filenames.
- Read [documentation.md](references/documentation.md) when creating or changing documentation, architecture decisions, public contracts, or notable behavior.
- Read [release.md](references/release.md) when initializing versions, tagging releases, publishing packages, or building and publishing Docker images.

## Execute the work

1. Inspect repository instructions, architecture, conventions, dependencies, tests, and the working-tree state.
2. Separate repository facts from Ever Quint standards. Measure the former; enforce the latter. Never weaken a standard merely because existing code violates it.
3. Resolve dependency behavior from the installed version or primary documentation, and probe uncertain runtime behavior before designing around it.
4. State material assumptions. Surface competing interpretations and tradeoffs instead of choosing silently. Ask only when ambiguity could materially change the result or risk.
5. Define observable success criteria. For multi-step work, give each step a verification check.
6. Write or update tests first when fixing a bug or adding behavior. Reproduce defects before changing implementation.
7. Make the smallest change that satisfies the request. Avoid speculative features, abstractions, configuration, and adjacent cleanup.
8. Keep every changed line traceable to the requested outcome. Remove only artifacts made obsolete by the current change.
9. Run focused tests while iterating, then the relevant full suite, coverage gates, linter, formatter, type checker, build, and architecture checks.
10. Review the final diff for scope, readability, boundary violations, secret exposure, accidental formatting churn, and documentation or changelog drift.

For a trivial, low-risk task, compress the ceremony while preserving correctness and verification.

## Preserve the core boundaries

- Put all business rules in `src/logic`.
- Let only `src/logic` access `src/orm` and `src/services`.
- Never let REST, MCP, Temporal workflows, Temporal activities, or other consumers access the database, ORM, or external services directly.
- Keep package entrypoints such as `index.js`, `index.ts`, and `__init__.py` export-only and side-effect-free; do not invent index files in languages such as Go that do not use them.
- Keep logic public APIs object-oriented using the selected language's native constructs: use static class methods for stateless behavior where supported, and identity- or context-bound instances or receiver types for stateful behavior.
- Use OpenTelemetry for all application telemetry and prefer OpenObserve as the observability backend.
- Contain ordinary runtime errors at their request, message, activity, or job boundary. Crash loudly only when required infrastructure or an unrecoverable process invariant makes safe operation impossible.
- Require 100% per-file coverage for all authored backend code across lines, branches, functions, and statements.
- Never weaken authentication, authorization, tenant isolation, secret handling, tests, lint, or coverage to make an implementation easier.

## Handle conflicts

Honor explicit user requirements first unless they create a security or correctness problem. Surface such problems with concrete evidence and propose the smallest safe alternative.

For an existing repository whose formatting or structure conflicts with these standards, do not create a broad migration inside an unrelated change. Explain the conflict and request direction before causing a noisy diff. Match existing public contracts unless the task explicitly changes them.
