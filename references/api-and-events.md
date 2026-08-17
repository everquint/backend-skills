# API and Event Contracts

## Contents

- Consumer boundaries
- Validation and errors
- REST conventions
- gRPC conventions
- MCP conventions
- Events, queues, webhooks, jobs, and CLI
- Compatibility
- Verification

## Consumer boundaries

Treat REST, gRPC, MCP, webhooks, queue consumers, event subscribers, scheduled jobs, and CLI commands as thin consumers of `logic`.

Do not introduce GraphQL. If an existing contract or explicit requirement makes GraphQL unavoidable, explain the query-cost, performance, caching, authorization, and operational tradeoffs and require user confirmation before implementing or extending it.

- Authenticate and parse the protocol at the boundary. Anonymous access is allowed only for an explicitly documented public operation.
- Validate the complete external shape before constructing domain input.
- Call one or more public logic methods without reimplementing business rules.
- Translate logic results and errors into the protocol contract.
- Never import ORM, database clients, provider SDKs, or services.

Add `src/events`, `src/webhooks`, `src/jobs`, or `src/cli` only when the project actually exposes that consumer. Group each by feature, follow the selected language's filename rules, and keep package entrypoints export-only where the language uses them.

## Validation and errors

- Parse external data through a schema or typed decoder. Never cast untrusted data into an internal type.
- Reject unknown fields when accepting them could hide client mistakes or security-sensitive intent; document any compatibility reason to ignore them.
- Keep one logic-layer error taxonomy for expected business failures.
- Give each public error a stable machine-readable code, safe message, correlation identifier, and protocol-appropriate status.
- Never expose stack traces, SQL, provider payloads, internal identifiers, secrets, or authorization reasoning.
- Map unexpected errors to one safe internal error while recording the original through OpenTelemetry.

## REST conventions

- Keep OpenAPI as the canonical REST contract and validate implementation drift in CI.
- Apply authentication by default through shared middleware. Explicitly mark each intentionally public operation in OpenAPI and test that every other route rejects unauthenticated requests.
- Use cursor pagination for mutable or large collections. Define stable ordering and opaque cursors; never expose raw database offsets or internal query state without a deliberate contract.
- Require an idempotency key for externally retried create, payment, provisioning, or other non-repeatable mutation operations.
- Bind the key to the authenticated principal, operation, and normalized request; return the original outcome for a replay and reject a conflicting reuse.
- Define request, response, upload, header, and pagination limits.
- Apply rate limits by verified principal and tenant, with stricter controls for authentication, secret reveal, and expensive operations.
- Return retry guidance only when retrying is safe.
- Version only when compatibility cannot be preserved. Prefer additive changes and explicit deprecation with a published removal date.

## gRPC conventions

- Treat gRPC services as thin protocol adapters with the same authentication, authorization handoff, validation, logic invocation, error translation, limits, observability, and no-direct-ORM-or-services rules as REST.
- Keep Protocol Buffers as the canonical gRPC contract and verify generated-code and implementation drift in CI.
- Preserve field numbers forever after publication. Reserve removed field numbers and names; never reuse them for a different meaning.
- Map logic errors to stable gRPC status codes and safe structured details without exposing internal causes or authorization reasoning.
- Define deadlines, message-size limits, streaming backpressure, cancellation, retry safety, and compatibility expectations explicitly.
- Apply authentication by default through shared interceptors and test every intentionally public RPC as an explicit exception.

## MCP conventions

- Treat MCP tool and resource schemas as contracts, not as substitutes for logic validation.
- Keep tool names and response structures stable and document scopes, errors, pagination, side effects, and idempotency.
- Require explicit confirmation or an approval flow for destructive or high-impact tools when the client interaction model supports it.
- Follow [security.md](security.md) for OAuth 2.1, DCR, API keys, authorization, and tenant isolation.
- Use MCP notifications and progress only for protocol state; business state remains owned by `logic`.

## Events, queues, webhooks, jobs, and CLI

- Give every message an event name, schema version, stable event identifier, occurrence time, producer, tenant context where applicable, and trace context.
- Assume at-least-once delivery unless the infrastructure proves otherwise. Make consumers idempotent and record processed event identifiers where duplication has side effects.
- Define ordering requirements explicitly and partition only by the key whose order matters.
- Bound retries and route exhausted messages to an owned dead-letter path with alerting, inspection, replay, and retention procedures.
- Use an outbox when a database mutation and event publication must succeed atomically. Use an inbox or deduplication record when consumer effects must not repeat.
- Sign incoming webhooks, verify freshness, prevent replay, limit body size, and acknowledge only after durable acceptance.
- Let scheduled jobs use distributed exclusion or idempotency when overlapping runs can corrupt outcomes.
- Keep CLI commands subject to the same authentication, authorization, validation, audit, and logic rules as network consumers.

## Compatibility

- Evolve schemas additively before removing fields or meanings.
- Make consumers tolerate additive fields while producers avoid repurposing existing fields.
- Use expand-and-contract across producers and consumers; deploy readers before writers and remove old forms only after usage proves they are gone.
- Document breaking changes, migration steps, deprecation dates, and compatibility windows in the contract and changelog.

## Verification

Use shared feature contracts to prove equivalent behavior across REST, gRPC, MCP, events, webhooks, jobs, and CLI. Test each consumer's happy path and meaningful failures, including malformed data, stable errors, authorization, limits, idempotent replay, duplicate and out-of-order delivery, retry exhaustion, dead-letter replay, webhook forgery, and compatibility. Include every authored consumer in the 85% overall coverage gate and retain stricter coverage for security or mission-critical controls.
