# Testing and Coverage

## Contents

- Required test layers
- Shared feature contracts
- Shared containerized infrastructure
- Coverage gates
- Layer-specific expectations
- Verification workflow

## Required test layers

Require tests for every behavior-bearing production module.

- Test the happy path and at least one meaningful failure path for every delivered feature and behavior-bearing public function. Add validation, authorization, boundary, and regression cases when the behavior contains those decisions.
- Use unit tests for classes, methods, handlers, activities, workflows, ORM behavior, and services.
- Put the deepest behavioral coverage around `logic`, the canonical owner of business behavior.
- Add integration tests for ORM mappings, queries, transactions, relationships, constraints, and migrations against the real database engine or a production-compatible ephemeral instance.
- Add feature-level end-to-end tests for every delivered feature and supported consumer path.
- Add repeated lifecycle or soak verification for code that owns long-lived resources or can retain data after a request, job, workflow, connection, subscription, or shutdown. Follow [memory-safety.md](memory-safety.md).
- Exempt export-only index files from dedicated unit tests because they contain no behavior.
- Do not count generated or vendored code as authored coverage.

## Shared feature contracts

Centralize reusable test behavior under root `tests`:

```text
tests/
├── shared/
│   ├── fixtures/
│   ├── factories/
│   ├── assertions/
│   └── feature-contracts/
├── unit/
└── e2e/
```

- Reuse fixtures, factories, assertions, and feature contracts instead of copying scenarios.
- Keep language-native colocated unit tests and package-specific integration tests where their toolchain requires them; root `tests` owns shared support and cross-service E2E behavior.
- Express each business rule once in logic tests.
- Reuse a feature contract across REST, gRPC, MCP, and workflows when those consumers expose equivalent behavior.
- Keep consumer-specific protocol assertions in the consumer suite.
- Allow test infrastructure to seed or inspect the database through dedicated fixtures; never use that as precedent for production consumer code.

## Shared containerized infrastructure

When integration or E2E tests require real infrastructure, start exactly one shared container for each dependency type required by the complete concurrent test run. This applies to PostgreSQL, Redis or Valkey, Temporal, and equivalent containerized services.

- Never start a separate dependency container per test, suite, test worker, feature, package, worktree, or agent.
- Use either Redis or Valkey according to the application architecture. Do not start both as interchangeable duplicate caches unless the product genuinely integrates with both.
- Provision shared containers once in test bootstrap, wait for health once, run migrations or namespace setup through one owner, and tear them down once after the complete run.
- Configure automatic container libraries in explicit singleton or reuse mode. Do not use a library whose lifecycle can silently create one container per test process or worker.
- Let parallel agents and worktrees connect to the same shared endpoints. Appoint one infrastructure owner; other agents must not run their own Compose stack or container startup.
- Keep tests independent through logical isolation inside the shared service: unique PostgreSQL databases or schemas, unique Redis/Valkey key prefixes, and unique Temporal namespaces where supported, task queues, and workflow IDs. Clean up owned state deterministically.
- An in-process fake or SDK test harness is not another service container. Use it for unit tests when it proves the intended behavior; retain the shared real-service integration path where compatibility matters.

In GitHub Actions, use [`jobs.<job_id>.services`](https://docs.github.com/en/actions/tutorials/use-containerized-services) on a Linux runner:

- Declare one service entry for each required dependency in one integration/E2E job.
- Run every service-dependent suite in that job. Do not use a job matrix or multiple jobs that each recreate the same PostgreSQL, Redis/Valkey, or Temporal service.
- Keep lint, formatting, static checks, and unit-only tests in separate jobs without service containers when useful.
- Pin reviewed service image versions or digests and configure bounded health checks before running migrations or tests.
- When the job itself runs in a container, connect using the service label as the hostname. When it runs directly on the runner, publish the required ports and connect through `localhost` or the assigned service-port context.
- Never place production credentials or user secrets in service-container configuration. Use isolated test-only values.

## Coverage gates

Require at least 85% overall coverage across authored backend code for every metric the selected tool reliably measures:

- Lines
- Branches
- Functions and methods
- Statements

Apply the gate to all authored backend layers, including:

- `src/logic`
- `src/orm`
- `src/services`
- `src/restapi`
- `src/grpc`
- `src/mcp`
- `src/workflows`
- `debug`
- Security, authorization, RBAC, and mission-critical code

- Block CI and merges when any required overall threshold fails.
- Do not exclude authored code merely to make the number pass.
- Permit exclusions only for generated or vendored code, with explicit configuration.
- Retain 100% coverage across every reliably measured metric for authentication, authorization, RBAC, tenant isolation, secret handling, encryption, API-key validation, and explicitly mission-critical controls.
- Treat 85% coverage as a minimum aggregate signal, not proof that any feature or failure behavior was tested.
- Never use aggregate coverage to waive the happy-path and failure-path test requirement for each feature and behavior-bearing public function.
- Do not block the functional milestone on the completed coverage or compliance suite. Require every applicable gate before final delivery, merge, release, or deployment.

## Layer-specific expectations

### Logics

- Test success, validation, permissions, state transitions, invariants, failures, and boundary conditions.
- Test every public method and every decision branch.
- Prefer real domain values and focused fakes for ORM or service boundaries.

### REST, gRPC, MCP, and workflows

- Test input mapping, authentication handoff, logic invocation, output mapping, and error translation.
- Test that every non-public operation rejects unauthenticated access and every explicitly public operation exposes only its documented anonymous behavior.
- For multi-tenant behavior, test same-tenant success and cross-tenant denial for every supported consumer path.
- Verify that consumers never query ORM or services directly.
- For workflows, test sequencing, retries, timers, signals, compensation, and activity failures with the workflow test environment.

### ORM and migrations

- Test authored queries, transformations, hooks, transaction behavior, and error paths.
- Test schemas for field mapping, defaults, relationships, uniqueness, foreign keys, and relevant constraints.
- Test migrations forward against the actual database engine. Test rollback when the migration strategy supports rollback.
- Include handwritten migrations in authored coverage and test their successful and failure behavior where applicable.
- Exclude generated clients or generated migrations from percentage calculations, but still verify that they apply successfully.

### Services

- Test request construction, serialization, retries, timeouts, provider errors, and redaction.
- Use provider emulators or contract tests where mocks cannot prove compatibility.
- Never put real credentials or secrets in fixtures, snapshots, logs, or coverage output.

### Observability

- Test authored span, metric, and structured-log attributes without requiring a live OpenObserve instance.
- Verify trace-context propagation across REST, gRPC, MCP, workflows, activities, logic, ORM, and service boundaries where applicable.
- Test redaction and confirm errors, events, logs, spans, baggage, and metric labels contain no secrets or prohibited personal data.
- Test exporter failure and shutdown behavior without making business operations depend on telemetry availability.

### Debug adapters

- Test Swagger server startup, OpenAPI loading, request execution, and failure reporting without duplicating REST business assertions.
- Test MCP Inspector launcher configuration and transport wiring without requiring the interactive Inspector UI in unit tests.
- Test direct workflow runners with deterministic local activities or fakes and verify their results match the workflow's supported happy and failure paths.
- Keep Temporal test-environment and end-to-end worker tests; direct execution without Temporal is a debugging tool, not proof of Temporal replay, retry, timer, signal, cancellation, or determinism behavior.

## Verification workflow

1. By default, implement the smallest working vertical slice and verify the primary behavior directly. If the user explicitly requests TDD or repository instructions mandate it, begin with the smallest failing test and use red-green-refactor. For a defect, reproduce the failure first when practical under either sequence.
2. Tell the user the functionality is ready for their testing and that the compliance pass is continuing while they review.
3. Add or complete happy-path and meaningful failure-path tests for every changed feature and behavior-bearing public function.
4. Run unit, integration, and feature E2E suites relevant to the change.
5. Run overall coverage, linter, formatter, type checker, build, architecture, and security checks.
6. Inspect reports and the final diff; do not rely only on an exit code.
