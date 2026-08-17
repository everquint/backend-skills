# Temporal Production Standards

## Contents

- Workflow and activity boundaries
- Determinism
- IDs, timeouts, retries, and cancellation
- Payload-size budgets
- History growth
- Signals, queries, and updates
- Versioning and worker deployment
- Security, observability, and operations
- Verification

## Workflow and activity boundaries

- Keep durable orchestration, timers, signals, updates, queries, retries, and compensation in workflows.
- Put every side effect in an activity. Activities call `logic`; they never access ORM or services directly.
- Keep business rules and authorization in `logic`. A workflow coordinates those rules without becoming a second domain implementation.
- Make activities idempotent or protect them with an idempotency key derived from stable workflow operation identity.
- Group workflows by feature under `src/workflows` and keep workers and registration in explicitly named bootstrap files.

## Determinism

- Use only the Temporal SDK's workflow-safe time, randomness, UUID, timer, concurrency, and side-effect mechanisms inside workflow code.
- Never perform network, database, filesystem, environment, process, thread, system-clock, global mutable-state, or non-deterministic library access from a workflow.
- Do not depend on unordered map iteration, locale, host configuration, or library behavior that can differ during replay.
- Keep workflow logging and telemetry on SDK-supported replay-aware paths so replay does not duplicate side effects.
- Replay representative production histories in CI before deploying a workflow-code change.

## IDs, timeouts, retries, and cancellation

- Define a stable Workflow ID derived from the business operation whose uniqueness matters. Document duplicate-start, conflict, and reuse behavior.
- Set Workflow Execution, Workflow Run, Workflow Task, Activity Start-to-Close or Schedule-to-Close, and heartbeat timeouts intentionally; do not inherit defaults without review.
- Put infrastructure-transient retries on activities with bounded backoff, jitter where supported, maximum interval, attempts or elapsed time, and explicit non-retryable errors.
- Retry a whole workflow only when repeating the full business operation is correct.
- Heartbeat long-running activities with bounded progress details and respond promptly to cancellation.
- Define compensation for completed non-transactional effects and make compensation itself idempotent.

## Payload-size budgets

Temporal limits vary by service, deployment configuration, namespace, SDK, data converter, codec, and intermediary. Never hardcode a remembered platform default as the application contract.

1. Resolve the effective payload, request or transaction, memo, search-attribute, and history limits for the deployed Temporal environment.
2. Choose an application budget below the smallest effective limit, leaving headroom for metadata, headers, failure details, codec expansion, and platform changes.
3. Measure encoded bytes after the actual data converter and payload codec, including compression or encryption overhead—not the in-memory object or source JSON length.
4. Enforce the budget before workflow start, signal, update, activity scheduling, heartbeat details, child workflow calls, and workflow or activity result emission.
5. Test values at the accepted boundary and one byte or representative item beyond it.

- Pass stable identifiers and minimal immutable facts, not whole database records, files, documents, model objects, or growing arrays.
- Store large content in the approved durable object store or database and pass an authorized opaque reference plus integrity metadata.
- Never put secrets into workflow payloads or history. Payload encryption does not remove size limits or access-control requirements.
- Bound failure messages and stack details; repeated large failures also grow history.
- Emit metrics for encoded payload size, rejected oversize operations, and headroom by payload kind without recording payload contents.

## History growth

- Bound loops, signals, updates, children, retries, activity events, and accumulated state.
- Monitor history event count and encoded history size against the actual environment limits.
- Use `continue-as-new` before warning or hard limits, carrying only the minimal state needed for the next run.
- Check the SDK's continue-as-new recommendation where available, while retaining an application threshold with operational headroom.
- Never use workflow history as bulk storage or an unbounded audit log.

## Signals, queries, and updates

- Validate signal and update inputs before mutation and make duplicate delivery safe.
- Use updates when the caller needs an accepted or completed result; use signals for asynchronous notification; use queries for read-only workflow state.
- Keep query handlers deterministic, read-only, fast, and free of side effects.
- Define behavior for signals arriving before initialization, during cancellation, and after the relevant state transition.
- Bound buffered messages and reject or compact unbounded accumulation.

## Versioning and worker deployment

- Use the SDK-supported workflow versioning or patching mechanism for code paths that would replay differently.
- Never delete an old deterministic branch while open executions can still replay through it.
- Use worker build or deployment versioning and compatible task-queue routing where supported. Roll out new workers gradually and keep a rollback-compatible worker available.
- Deploy readers and activity implementations before workflows schedule new payload or activity shapes.
- Record deployed worker build identity in OpenTelemetry and operational dashboards.

## Security, observability, and operations

- Propagate verified identity and tenant context as minimal immutable data; reauthorize in `logic` before sensitive activities.
- Restrict namespace, task-queue, worker, visibility, and payload-codec credentials by least privilege.
- Instrument workflows and activities through OpenTelemetry using replay-safe SDK integrations.
- Monitor task backlog, schedule-to-start latency, failures, retries, timeouts, heartbeat loss, stuck executions, payload headroom, history growth, and worker availability.
- Shut workers down gracefully: stop polling, drain or safely abandon activities according to SDK semantics, flush telemetry, then exit within the configured grace period.

## Verification

Test workflows with the Temporal test environment and real data converter or codec. When integration or E2E verification requires containerized Temporal, reuse the single shared Temporal container defined by [testing.md](testing.md); never start one per test, worker, suite, worktree, or agent. Cover replay, timers, retries, non-retryable failures, heartbeats, cancellation, signals, queries, updates, child workflows, compensation, duplicate starts, payload boundaries, continue-as-new, worker-version compatibility, and graceful shutdown. Direct debug runners from [debugging.md](debugging.md) remain supplementary and do not satisfy these production tests.
