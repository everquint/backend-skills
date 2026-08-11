# Runtime and Resilience

## Contents

- Configuration
- Dependency classification
- Runtime error and crash policy
- Timeouts and retries
- Isolation and backpressure
- Health and shutdown
- Verification

## Configuration

- Parse and validate all runtime configuration once during startup through a typed schema or language-equivalent validator.
- Fail startup on missing, malformed, contradictory, or insecure required configuration. Include the field name and remediation, never its secret value.
- Keep non-secret deployment configuration outside code. Retrieve secrets through the approved secret-manager service.
- Do not read environment variables throughout business code. Expose validated, immutable configuration through an explicit configuration object.
- State defaults in one place. Do not default security, tenancy, persistence, or destructive behavior silently.
- Record which settings are reloadable. Restart for every other change rather than partially applying it.

## Dependency classification

Classify every infrastructure dependency as `required` or `optional` before startup behavior is implemented.

- Database and Redis or Valkey are required by default under this standard.
- A secret manager, queue, workflow system, or provider is required when the deployed process cannot perform its declared purpose safely without it.
- An optional dependency must have an explicitly documented degraded behavior that preserves correctness and security.
- Never mark a dependency optional merely to keep readiness green.

At startup, connect to and verify every required dependency before reporting ready. Fail loudly with a non-zero exit when one cannot become usable within the bounded startup window. Let the supervisor restart the process; never remain alive while advertising readiness for work the process cannot perform.

## Runtime error and crash policy

Servers must not crash for ordinary runtime errors.

| Failure                                                                                                            | Required behavior                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Invalid input, missing resource, permission denial, business conflict                                              | Return the defined protocol error; keep serving                                                                       |
| One request, MCP call, message, job, activity, or provider operation fails                                         | Contain it at that boundary, record it once, return or retry safely, keep unrelated work serving                      |
| Optional dependency fails                                                                                          | Enter the documented degraded mode and expose the condition                                                           |
| Required database, Redis/Valkey, secret manager, queue, or other critical infrastructure is unavailable at startup | Log and trace the cause, remain unready, exit non-zero                                                                |
| Required infrastructure is lost at runtime                                                                         | Mark unready, stop accepting dependent work, attempt bounded recovery, then drain and exit non-zero if recovery fails |
| Corrupted process invariant, unsafe memory or state, or an unhandled fault whose effects are unknown               | Treat process integrity as mission-critical, capture diagnostics, drain if safe, and exit non-zero                    |

Install top-level request, message, activity, workflow-worker, and job error boundaries. A process-wide unhandled-error hook is a final diagnostic and shutdown mechanism, not a way to swallow unknown faults and continue.

Never call immediate process termination from domain logic. Route fatal decisions through one lifecycle owner so telemetry flush, connection closure, and in-flight draining get a bounded chance to complete.

## Timeouts and retries

- Set an explicit deadline on every network call, database operation, lock acquisition, and queue interaction.
- Propagate the caller's remaining deadline; inner operations must not outlive it.
- Retry only transient failures and only when the operation is idempotent or protected by an idempotency mechanism.
- Use bounded exponential backoff with jitter and a maximum attempt or elapsed-time budget.
- Honor provider retry guidance without allowing it to exceed the request or job deadline.
- Never retry validation, authorization, deterministic business conflicts, or permanent provider errors.
- Prevent retry multiplication across protocol, logic, service, SDK, proxy, and workflow layers. Assign one retry owner per failure boundary.
- Use a circuit breaker for a repeatedly failing remote dependency when fast rejection protects the application. Never use it to hide a required dependency from readiness.

## Isolation and backpressure

- Bound concurrency, queues, payload sizes, connection pools, and memory used per request or job.
- Isolate independent providers or workloads with separate pools or bulkheads when one can starve another.
- Reject overload explicitly with the protocol's retryable response instead of accepting unbounded work.
- Preserve fairness between tenants and prevent one tenant from exhausting shared resources.
- Make cache failure preserve correctness. Never rely on a cache as the only durable source unless it is explicitly the required data store.

## Health and shutdown

- Liveness answers whether the process can make progress; it must not fail for an ordinary downstream outage.
- Readiness answers whether this instance can safely accept its declared work; include every required dependency.
- Keep detailed dependency diagnostics authenticated or internal. Public health responses reveal no topology, credentials, or sensitive error details.
- On shutdown, stop accepting work, mark unready, drain in-flight work, stop workers and consumers, flush OpenTelemetry, and close services and ORM connections within a bounded grace period.
- Exit non-zero after a fatal dependency or invariant failure and zero after an intentional clean shutdown.

## Verification

Test configuration rejection, dependency classification, startup failure, degraded optional dependencies, boundary containment, retry budgets, circuit transitions, overload, readiness changes, graceful shutdown, and fatal exit behavior. Require 100% per-file coverage for authored lifecycle and resilience code.
