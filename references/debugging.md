# Debugging Adapters

## Contents

- Purpose and structure
- REST Swagger server
- MCP Inspector
- Temporal workflow direct runner
- Boundaries and safety
- Tests and documentation

## Purpose and structure

Use root `debug` for development-only entrypoints that make each protocol surface easy to exercise locally. The TypeScript example below uses `.ts`; follow the selected language profile for filenames and package entrypoints:

```text
debug/
├── rest/
│   ├── swagger-server.ts
│   └── index.ts
├── mcp/
│   ├── mcp-inspector.ts
│   └── index.ts
├── workflows/
│   ├── <workflow-name>/
│   │   ├── <workflow-name>-runner.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

Create only the adapters required by the repository. Keep every `index` export-only. Put startup and command-line behavior in explicitly named files. Follow the language's file-extension and naming constraints while preserving the same structure.

Debug adapters are consumers. They may invoke REST, MCP, workflows, activities, or `logic` through supported public entrypoints. They must never access ORM, database clients, provider services, or vendor SDKs directly.

## REST Swagger server

Provide a development-only Swagger server for every REST application.

- Serve Swagger UI from the canonical OpenAPI document.
- Never maintain a second debug-only API description.
- Allow requests to be executed against the local REST server through the UI.
- Use the same validation, authentication, authorization, handler, and logic paths as normal REST calls.
- Make the target server URL explicit and default it to loopback.
- Display documented inputs, outputs, authentication requirements, errors, and examples without embedding real credentials or production data.
- Fail startup when the OpenAPI document is missing or invalid; never show an empty UI as a successful debug server.

The Swagger server may host documentation and proxy or send HTTP requests. It must not invoke ORM or logic as a private shortcut around the REST handler.

## MCP Inspector

Provide a development launcher or configuration for the official MCP Inspector whenever the repository exposes MCP.

- Start or connect the actual MCP server using its supported local transport.
- Expose tools, resources, prompts, schemas, notifications, and errors through the Inspector.
- Exercise the same MCP handlers and logic calls used in deployment.
- Keep Inspector-specific configuration under `debug/mcp` and out of production startup.
- Default to local, non-production endpoints and synthetic credentials.
- Never place access tokens, API keys, client secrets, or user secrets in Inspector command arguments, committed configuration, screenshots, or recorded sessions.

Do not build a custom MCP inspection UI when the official Inspector satisfies the requirement.

## Temporal workflow direct runner

Provide one direct runner per Temporal workflow so a developer can invoke and step through its application behavior without starting Temporal Server, a task queue, or a worker.

The direct runner must:

- accept explicit, validated workflow input;
- invoke the workflow's debug-compatible orchestration entrypoint or a thin direct-execution adapter;
- replace Temporal activity proxies with local activity implementations or controlled fakes;
- route all real side effects through activities and `logic`, never through debug-only ORM or service access;
- print or return the workflow result and a readable event or step summary;
- support controlled activity success and failure scenarios;
- use synthetic data by default;
- remain excluded from production entrypoints and images.

Design workflow orchestration so the debug runner can exercise the meaningful sequence without copying it. Keep one canonical set of business rules in `logic` and one canonical workflow definition. A thin adapter may supply local activity implementations and substitutes for Temporal time, signals, or cancellation, but it must not become a second workflow implementation.

Direct execution is a developer feedback tool, not a Temporal emulator. It does not prove workflow determinism, replay compatibility, durable timers, retries, signals, queries, cancellation, heartbeats, task-queue behavior, or worker deployment. Verify those separately with the Temporal test environment and feature-level end-to-end tests.

## Boundaries and safety

- Mark every debug entrypoint as development-only and fail closed outside an explicitly allowed local or development environment.
- Bind debug servers to loopback by default. Require an explicit, reviewed configuration to expose them on another interface.
- Never deploy root `debug` in REST, MCP, or workflow production images.
- Never disable or bypass authentication or authorization against shared or production data.
- If a local authentication shortcut is required, restrict it to synthetic local identities and make production activation impossible by construction.
- Apply OpenTelemetry instrumentation and secret redaction to debug executions using the same shared facilities as production.
- Do not persist debug request bodies, workflow inputs, MCP arguments, or outputs unless explicitly requested and safely redacted.

## Tests and documentation

Include authored root `debug` code in the 85% overall coverage gate and test each adapter's happy and failure paths.

- Unit-test configuration, input validation, launch commands, local activity substitution, failures, and environment guards.
- Add smoke tests that start the Swagger server and MCP server on ephemeral local ports.
- Compare direct workflow-runner outcomes with Temporal test-environment outcomes for representative feature contracts.
- Keep feature-level E2E tests for REST, MCP, and Temporal separately; debug adapters do not replace deployed-path tests.
- Document one command for starting each adapter, its required local dependencies, safe example inputs, and the limitations of direct Temporal execution under `docs/development`.
