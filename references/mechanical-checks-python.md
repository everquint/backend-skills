# Python Mechanical Checks

Use this reference only for Python enforcement work.

## Selection

- Prefer pytest, the selected framework's test client, Ruff, Pyright, and the OpenTelemetry SDK's in-memory test facilities.
- Before adding security-header, rate-limit, lifecycle, dependency-boundary, or telemetry-test packages, show the user the exact maintained package, locked version strategy, commands, and why the framework or existing dependencies are insufficient. Wait for confirmation.
- If no user channel exists, use an already installed or built-in mechanism. Otherwise record the missing gate as a blocker; never install a package silently or report an absent check as passing.

## Required checks

- Exercise the real ASGI, WSGI, or gRPC adapter through its supported test transport. Assert `X-Content-Type-Options: nosniff` and the documented cache policy, including `Cache-Control: no-store` for sensitive responses.
- Drive repeated invalid credentials through authentication and rate-limit middleware with a controllable clock and isolated store. Prove the failure path is throttled without tenant or principal key collisions.
- Inject an unexpected handler exception. Assert the framework boundary returns a safe error, records it once, keeps unrelated work serving, and does not hide a process-integrity failure.
- Hold an async task or request open during shutdown. Use a bounded timeout and task inspection to prove readiness drops, new work stops, tasks drain or cancel, telemetry flushes, resources close, and the process completes within its grace period.
- Use OpenTelemetry in-memory span export and metric reading to prove trace propagation, required metrics, log correlation, and redaction across consumer, logic, ORM, and service boundaries.
- Use Pyright and repository import checks for enforceable boundaries. Propose any additional architecture or leak-testing package to the user before installation.
