# JavaScript and TypeScript Mechanical Checks

Use this reference only for JavaScript or TypeScript enforcement work.

## Selection

- Prefer the repository's existing framework, Vitest, Oxlint, and OpenTelemetry test facilities.
- Before adding security-header, rate-limit, lifecycle, dependency-boundary, or OpenTelemetry test packages, show the user the exact maintained package, pinned version strategy, commands, and why built-in facilities are insufficient. Wait for confirmation.
- If no user channel exists, use an already installed or built-in mechanism. Otherwise record the missing gate as a blocker; never install a package silently or report an unimplemented check as passing.

## Required checks

- Start the real HTTP or gRPC adapter in a Vitest integration test. Assert `X-Content-Type-Options: nosniff` and the documented cache policy, including `Cache-Control: no-store` for sensitive responses.
- Drive repeated invalid authentication attempts through the real middleware with a controllable clock and isolated store. Prove throttling applies to the failure path and that tenant or principal keys cannot collide.
- Inject an unexpected handler exception. Assert the adapter returns the safe protocol error, records it once, keeps unrelated work serving, and does not swallow a process-integrity failure.
- Hold one operation open during shutdown. Use fake timers or a bounded real deadline to prove readiness drops, new work stops, in-flight work drains or cancels, telemetry flushes, resources close, and the process completes within the configured grace period.
- Use OpenTelemetry in-memory span export and metric reading to prove one request propagates trace context across the consumer, logic, ORM, and service boundaries, emits required metrics and correlated logs, and redacts prohibited data.
- Use Oxlint for supported deterministic rules. When Oxlint cannot express a mandatory architecture or size rule, propose one small repository-owned check and obtain user confirmation before adding it.
