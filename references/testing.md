# Testing and Coverage

## Contents

- Required test layers
- Shared feature contracts
- Coverage gates
- Layer-specific expectations
- Verification workflow

## Required test layers

Require tests for every behavior-bearing production module.

- Use unit tests for classes, methods, handlers, activities, workflows, ORM behavior, and services.
- Put the deepest behavioral coverage around `logic`, the canonical owner of business behavior.
- Add integration tests for ORM mappings, queries, transactions, relationships, constraints, and migrations against the real database engine or a production-compatible ephemeral instance.
- Add feature-level end-to-end tests for every delivered feature and supported consumer path.
- Exempt export-only index files from dedicated unit tests because they contain no behavior.
- Do not count generated or vendored code as authored coverage.

## Shared feature contracts

Centralize reusable test behavior under `src/tests`:

```text
src/tests/
├── shared/
│   ├── fixtures/
│   ├── factories/
│   ├── assertions/
│   └── feature-contracts/
├── unit/
└── e2e/
```

- Reuse fixtures, factories, assertions, and feature contracts instead of copying scenarios.
- Express each business rule once in logic tests.
- Reuse a feature contract across REST, MCP, and workflows when those consumers expose equivalent behavior.
- Keep consumer-specific protocol assertions in the consumer suite.
- Allow test infrastructure to seed or inspect the database through dedicated fixtures; never use that as precedent for production consumer code.

## Coverage gates

Require 100% coverage per authored file, not only as a repository aggregate, for:

- Lines
- Branches
- Functions and methods
- Statements

Apply the gate to all authored backend layers, including:

- `src/logic`
- `src/orm`
- `src/services`
- `src/restapi`
- `src/mcp`
- `src/workflows`
- `debug`
- Security, authorization, RBAC, and mission-critical code

- Block CI and merges when any per-file threshold fails.
- Do not exclude authored code merely to make the number pass.
- Permit exclusions only for generated or vendored code, with explicit configuration.
- Treat 100% coverage as a floor for execution, not proof of correct assertions.

## Layer-specific expectations

### Logics

- Test success, validation, permissions, state transitions, invariants, failures, and boundary conditions.
- Test every public method and every decision branch.
- Prefer real domain values and focused fakes for ORM or service boundaries.

### REST, MCP, and workflows

- Test input mapping, authentication handoff, logic invocation, output mapping, and error translation.
- Verify that consumers never query ORM or services directly.
- For workflows, test sequencing, retries, timers, signals, compensation, and activity failures with the workflow test environment.

### ORM and migrations

- Test authored queries, transformations, hooks, transaction behavior, and error paths.
- Test schemas for field mapping, defaults, relationships, uniqueness, foreign keys, and relevant constraints.
- Test migrations forward against the actual database engine. Test rollback when the migration strategy supports rollback.
- Include handwritten migrations in the 100% requirement.
- Exclude generated clients or generated migrations from percentage calculations, but still verify that they apply successfully.

### Services

- Test request construction, serialization, retries, timeouts, provider errors, and redaction.
- Use provider emulators or contract tests where mocks cannot prove compatibility.
- Never put real credentials or secrets in fixtures, snapshots, logs, or coverage output.

### Observability

- Test authored span, metric, and structured-log attributes without requiring a live OpenObserve instance.
- Verify trace-context propagation across REST, MCP, workflows, activities, logic, ORM, and service boundaries where applicable.
- Test redaction and confirm errors, events, logs, spans, baggage, and metric labels contain no secrets or prohibited personal data.
- Test exporter failure and shutdown behavior without making business operations depend on telemetry availability.

### Debug adapters

- Test Swagger server startup, OpenAPI loading, request execution, and failure reporting without duplicating REST business assertions.
- Test MCP Inspector launcher configuration and transport wiring without requiring the interactive Inspector UI in unit tests.
- Test direct workflow runners with deterministic local activities or fakes and verify their results match the workflow's supported happy and failure paths.
- Keep Temporal test-environment and end-to-end worker tests; direct execution without Temporal is a debugging tool, not proof of Temporal replay, retry, timer, signal, cancellation, or determinism behavior.

## Verification workflow

1. Run a focused test that reproduces the defect or specifies the feature.
2. Confirm the test fails for the expected reason before a bug fix when practical.
3. Implement the smallest change and rerun the focused suite.
4. Run unit, integration, and feature E2E suites relevant to the change.
5. Run per-file coverage, linter, formatter, type checker, build, and architecture checks.
6. Inspect reports and the final diff; do not rely only on an exit code.
