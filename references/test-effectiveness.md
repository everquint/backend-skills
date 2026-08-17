# Test Effectiveness

## Contents

- What a test must prove
- Test-driven changes
- Assertions and boundaries
- Mutation testing
- Property, fuzz, and concurrency testing
- Contracts and failure injection
- Flaky tests and isolation
- Review gate

## What a test must prove

Coverage proves that code executed; it does not prove that a test would detect wrong behavior. A test is effective only when a relevant implementation defect makes it fail for a useful reason.

- Assert observable outcomes, state transitions, emitted events, persisted data, protocol responses, or collaborator contracts.
- Avoid assertions on private methods, incidental call order, internal collections, or formatting that the public contract does not promise.
- Give every test a precise behavior name and one primary reason to fail.
- Include a meaningful assertion. A test that only calls code, takes a snapshot without reviewable intent, or checks that nothing threw does not earn coverage credit for correctness.
- Test decisions and invariants, not just methods. One method with five decisions needs cases for the decisions and their interactions.

## Test-driven changes

- For a defect, write the smallest test that reproduces it and confirm it fails for the expected reason before changing implementation.
- For new behavior, get the smallest vertical slice working first, then add success and meaningful failure tests during the compliance pass. Do not let the later test phase change the intended contract silently.
- Run the focused test while iterating, then the relevant unit, integration, feature E2E, coverage, mutation, and static gates.
- Never weaken, delete, skip, or over-mock a valid test merely to make a change pass.
- When a test must change because the contract changed, make the contract change explicit in documentation and review.

## Assertions and boundaries

- Prefer one strong assertion over many incidental assertions, while checking every externally meaningful effect.
- Assert negative behavior: forbidden data is not returned, unauthorized state is not mutated, secrets are not logged, and duplicate work is not performed.
- Keep logic tests exhaustive around business decisions. Keep REST, MCP, workflow, event, ORM, service, and debug tests focused on their boundary responsibilities.
- Use the real database engine, Temporal test environment, provider emulator, or protocol transport when an in-memory mock cannot prove compatibility.
- Mock at stable owned boundaries, not inside the unit being tested. A mock that repeats the implementation's assumptions can make the same mistake pass twice.

## Mutation testing

Use mutation testing on `logic`, authorization, tenant isolation, money, state transitions, parsers, security controls, and other mission-critical branching code.

- Run changed-code or incremental mutation tests on pull requests when the toolchain supports them.
- Run a broader mutation suite on a schedule.
- Read surviving mutants individually. Add the missing assertion, remove a vacuous test, or document why the mutant is behaviorally equivalent.
- Permit no surviving non-equivalent mutant in security, authorization, RBAC, secret handling, money movement, or mission-critical logic.
- Do not chase an arbitrary global mutation score. The actionable artifact is the surviving mutation and the behavior no test noticed.

## Property, fuzz, and concurrency testing

- Use property-based tests when behavior is defined by invariants across a large input space: serialization round trips, ordering, pagination, money arithmetic, idempotency, parsers, and permission matrices.
- Use fuzzing for untrusted parsers, decoders, file handling, URL processing, protocol boundaries, and payload-size guards.
- Preserve minimized failing examples as deterministic regression tests.
- Test concurrent mutations, retries, duplicate delivery, lock contention, cancellation, and race conditions with controlled scheduling where possible.
- Run language race detectors and thread-safety analyzers when available.

## Contracts and failure injection

- Use consumer/provider contract tests for external services and independently deployed consumers when a shared integration test cannot protect compatibility.
- Test timeouts, transient and permanent provider failures, malformed responses, partial writes, lost connections, retry exhaustion, circuit transitions, required-infrastructure loss, and shutdown during in-flight work.
- Verify telemetry and audit output for failures without leaking secrets.
- Keep chaos or failure injection bounded to isolated test environments. Never experiment against production without a separately approved resilience program.

## Flaky tests and isolation

- Make tests deterministic, independent, repeatable, self-validating, and fast at their intended layer.
- Give each test logically isolated data and unique identifiers inside the shared test services. Do not create another container to obtain isolation, and do not depend on execution order or residue from another test.
- Replace fixed sleeps with an observable condition and a bounded deadline.
- Do not hide flakes behind unlimited retries. Quarantine only with an owner, linked defect, date, and expiry while the test continues running in a visible non-blocking job.
- Delete an expired, unowned quarantine rather than preserving a permanently ignored signal.

## Review gate

Before accepting tests, deliberately alter or remove the important behavior and confirm the relevant test fails when practical. Review the assertions, not only the coverage report. Require at least 85% overall coverage as defined in [testing.md](testing.md), retain its stricter security thresholds, and reject vacuous tests even when they satisfy every percentage.
