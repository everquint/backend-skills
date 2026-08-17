# Go Mechanical Checks

Use this reference only for Go enforcement work.

## Selection

- Prefer `testing`, `httptest`, gRPC `bufconn` where applicable, `go vet`, the confirmed golangci-lint configuration, and the selected OpenTelemetry SDK's test facilities.
- Before adding middleware, leak detection, rate-limit, architecture, or telemetry-test modules, show the user the exact maintained Go module, pinned version strategy, commands, and why the standard library or existing framework is insufficient. Wait for confirmation.
- If no user channel exists, use an already installed or standard-library mechanism. Otherwise record the missing gate as a blocker; never add a module silently or claim the check ran.

## Required checks

- Exercise the real HTTP router with `httptest` and the real gRPC service through an in-memory transport. Assert `X-Content-Type-Options: nosniff` and the documented cache policy, including `Cache-Control: no-store` for sensitive responses.
- Drive repeated invalid credentials through the real authentication and rate-limit middleware with an injectable clock and isolated store. Prove the failure path is limited without cross-tenant or cross-principal key collisions.
- Inject a handler panic and verify the top-level recovery boundary returns a safe error, records the panic once, and keeps unrelated requests serving. Do not recover a corrupted process invariant merely to remain alive.
- Block an in-flight operation, cancel through `context`, and assert readiness drops, listeners stop accepting work, goroutines finish, telemetry flushes, resources close, and shutdown respects its deadline.
- Use an OpenTelemetry span recorder and manual metric reader to prove trace propagation, required metrics, log correlation, and redaction across consumer, logic, ORM, and service boundaries.
- Run the race detector on concurrency-sensitive and lifecycle checks. Propose a maintained goroutine-leak detector to the user when repeated lifecycle tests cannot reliably prove termination with built-in observations.
