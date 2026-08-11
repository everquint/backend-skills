# Observability

## Contents

- Mandatory standard
- Placement and dependency boundaries
- Signals and instrumentation
- Context propagation
- Data safety
- Reliability and cost
- OpenObserve
- Verification

## Mandatory standard

Use OpenTelemetry for every application-owned observability signal:

- traces;
- metrics;
- structured logs and log correlation;
- context propagation;
- telemetry export.

Prefer OpenObserve as the storage, query, dashboard, and alerting platform. Keep application instrumentation vendor-neutral so another OpenTelemetry-compatible backend can be selected without rewriting business code.

Do not add a vendor-specific tracing, metrics, or logging SDK when the vendor accepts OpenTelemetry. A vendor agent may be used only when it consumes or exports OpenTelemetry without becoming the application's instrumentation API.

## Placement and dependency boundaries

Put OpenTelemetry setup under `src/api/services/open-telemetry`:

```text
src/api/services/open-telemetry/
├── open-telemetry.ts
├── open-telemetry-config.ts
├── open-telemetry.test.ts
└── index.ts
```

Keep SDK initialization, resource attributes, exporters, processors, propagators, sampling, flush, and shutdown there. Keep `index` export-only; start telemetry from an explicitly named application bootstrap file before loading instrumented libraries.

Prefer an OpenTelemetry Collector between applications and OpenObserve. Configure collector pipelines outside business logic. Never import an OpenObserve client throughout REST, MCP, workflows, logic, ORM, or provider services.

Automatic instrumentation and shared middleware may wrap protocol handlers, ORM clients, and provider clients. This is a cross-cutting infrastructure concern, not permission for handlers to call general services or databases directly.

## Signals and instrumentation

Instrument every meaningful request or job across REST, MCP, Temporal workflows and activities, logic, ORM, and external services.

- Use standard semantic conventions supported by the pinned OpenTelemetry version.
- Add manual spans for meaningful business operations, not every private function.
- Record stable, bounded-cardinality metrics for latency, throughput, failures, retries, queue or workflow delay, saturation, and business-critical outcomes.
- Emit structured logs. Include severity, event name, service identity, environment, trace ID, and span ID through automatic correlation where supported.
- Record exceptions on the active span and preserve causal context without duplicating the same error at every layer.
- Define health, readiness, and dependency signals separately from business telemetry.
- Name spans, metrics, and events consistently across protocol consumers that invoke the same logic operation.

Do not make telemetry emission part of a business transaction or correctness path. An exporter outage must not cause an otherwise valid user operation to fail.

## Context propagation

- Use W3C Trace Context and Baggage through OpenTelemetry propagators unless an external protocol requires an additional format.
- Continue incoming trace context only after normal protocol validation.
- Propagate context through asynchronous jobs, Temporal workflows and activities, and supported messaging boundaries.
- Preserve workflow determinism: do not call telemetry exporters directly from deterministic workflow code. Use the workflow SDK's interceptors, sinks, or supported observability hooks.
- Do not trust baggage as identity, authorization, tenancy, or business input. It is untrusted telemetry metadata.

## Data safety

Treat observability data as a disclosure surface:

- Never record secrets, credentials, tokens, OTPs, session identifiers, raw authorization headers, request or response bodies, database statements containing values, or encryption material.
- Avoid personal data by default. Add only approved attributes required for operations, and prefer opaque internal identifiers.
- Apply allowlists and redaction before export, including on exception messages and provider errors.
- Never place unbounded or user-controlled values in metric labels.
- Configure OpenObserve retention, access control, tenant isolation, and audit logging according to the data classification.
- Recheck authorization before linking operators to sensitive source records from a dashboard or trace.

## Reliability and cost

- Use bounded queues and batch processors so telemetry cannot exhaust application memory.
- Define exporter timeouts, retry limits, backpressure behavior, and graceful flush on shutdown.
- Sample deliberately. Preserve errors and security-relevant events according to policy, and document any head- or tail-sampling decision that changes investigative visibility.
- Keep metric cardinality bounded and alert on collector drops, exporter failures, queue saturation, and ingestion rejection.
- Pin compatible SDK, instrumentation, Collector, OTLP, and OpenObserve versions; verify upgrades with a real export probe.

## OpenObserve

Prefer OTLP through the OpenTelemetry Collector when sending data to OpenObserve.

- Keep OpenObserve endpoint and organization or stream configuration outside code.
- Retrieve ingestion credentials from the approved secret manager; never store them in repository files or images.
- Build dashboards and alerts from stable OpenTelemetry attributes, not incidental log text.
- Define service-level indicators and objectives before creating alert thresholds.
- Route actionable alerts to an owned response path and link them to a runbook.
- Export or version important dashboards, alerts, and collector configuration when OpenObserve supports a maintainable configuration-as-code path.

## Verification

Verify observability with tests and an integration probe:

1. Assert the service name, version, environment, and instance resource attributes.
2. Send a request or job through each deployed protocol and confirm one correlated trace crosses its logic, ORM, and external-service boundaries.
3. Confirm structured logs carry the trace and span identifiers.
4. Confirm required metrics arrive with bounded labels.
5. Force an error and verify status, exception recording, and redaction.
6. Stop the collector or OpenObserve endpoint and verify business behavior continues while telemetry failure becomes visible locally.
7. Verify graceful shutdown flushes within a bounded timeout.
8. Confirm OpenObserve queries, dashboards, retention, access controls, and alerts work for the deployed environment.

Require 100% per-file coverage for authored observability setup, processors, redaction, attribute mapping, and wrappers. Exclude upstream auto-instrumentation and generated collector code, not project-owned configuration behavior.
