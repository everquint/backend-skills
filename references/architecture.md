# Backend Architecture

## Contents

- Canonical repository shape
- Dependency rules
- Logic modules
- Relationships and navigation
- ORM and stored naming
- Services
- REST, gRPC, MCP, and workflows
- Dockerfiles
- Naming and formatting

## Canonical repository shape

Use `src` as the application source root. Keep business logic, persistence, integrations, and protocol consumers as siblings:

```text
repository/
├── CHANGELOG.md
├── src/
│   ├── logic/
│   ├── orm/
│   ├── services/
│   ├── restapi/
│   ├── grpc/
│   ├── mcp/
│   └── workflows/
├── tests/
├── dockerfiles/
├── compose.yaml            # only when local external dependencies are required
├── debug/
├── docs/
└── terraform/              # only when infrastructure as code is required
```

Add only directories required by the project. Keep shared tests and cross-service E2E support under root `tests`, and keep image definitions under root `dockerfiles`; neither belongs under application `src`. Add root `terraform` only when the user explicitly requests Terraform; never scaffold it from a general backend or deployment request. Use root `debug` only for the development adapters defined in [debugging.md](debugging.md): REST Swagger, MCP Inspector, and direct Temporal workflow execution without a Temporal server. Keep every `index.js`, `index.ts`, `__init__.py`, or language-equivalent package entrypoint limited to exports where the language uses such files. Put startup, registration, wiring, and side effects in explicitly named files. Do not invent an `index` file for Go.

For TypeScript, ask whether more than one independently deployable service is planned. A backend with one deployable protocol service uses the single-package tree above. A multi-service backend uses the pnpm workspace in [language-profiles.md](language-profiles.md), with no root application `src` or generated root `dist`; each workspace package owns those directories.

For Rust, preserve these ownership boundaries through Cargo packages rather than forcing the generic tree. Ask whether the planned backend has more than one independently deployable service, then follow the single-package or workspace layout in [language-profiles.md](language-profiles.md). A Rust workspace has no root `src`; each member crate has its own `crates/<crate-name>/src`.

## Dependency rules

Resolve `<core-source-root>` as `src` for a single package, `packages/core/src` for a TypeScript pnpm workspace, or `crates/core/src` for a Rust Cargo workspace. Paths below describe ownership relative to that root.

Enforce this direction:

```text
restapi ────┐
grpc ───────┤
mcp ────────┼──> logic ──┬──> orm
workflows ──┘            └──> services
```

- Put all application and business behavior in `logic`.
- Allow only `logic` to query or mutate `orm`.
- Allow only `logic` to call external integrations in `services`.
- Forbid REST, gRPC, MCP, workflows, activities, scheduled jobs, webhooks, and CLI consumers from accessing ORM models, database clients, provider SDKs, or services directly.
- Add or reuse a logic method whenever a consumer needs data or an external action. Do not create convenience bypasses.
- Keep ORM and services unaware of REST, gRPC, MCP, and workflows.
- Enforce boundaries with language-appropriate import rules or architecture tests.

## Logic modules

Make the entire public logic layer object-oriented. Do not export standalone business functions.

Use plural class or type names for collection-level operations and singular class or type names for one-record behavior. Map the same domain structure to the selected language instead of treating the TypeScript filenames as universal:

| Domain role             | TypeScript                              | Python                                  | Go                                                                  |
| ----------------------- | --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| Collection              | `src/logic/projects/projects.ts`        | `src/logic/projects/projects.py`        | `src/logic/projects/projects.go`                                    |
| Entity                  | `src/logic/projects/project/project.ts` | `src/logic/projects/project/project.py` | `src/logic/projects/project.go` or a justified `project` subpackage |
| Relationship collection | `project-members/project-members.ts`    | `project_members/project_members.py`    | `project_members.go` or a justified `projectmembers` subpackage     |
| Package exports         | export-only `index.ts`                  | export-only `__init__.py`               | package exports; no index file                                      |

Apply these rules:

- Use static class methods for stateless behavior: `Projects.list()` and `Projects.add(input)`.
- Never keep mutable state on a static class.
- Instantiate identity- or context-bound behavior: `new Project(projectId).edit(input)`.
- Instantiate parent-bound relationships: `project.members.list()`.
- Treat stored actor, tenant, transaction, configuration, or identity context as state.
- Pass request-specific context explicitly when a stateless method needs it.
- Allow an instantiated collection class only when persistent injected dependencies or state genuinely require it.
- Keep one class per file.
- Promote a complex class into a nested submodule when it needs cohesive supporting files. Do not split solely to satisfy an arbitrary aesthetic.

In a language without classes or static methods, preserve the same domain model with its closest native construct. For Go, use named receiver types: a stateless collection type carries no fields, while an identity-bound singular type stores its identifier or context. Keep callers interacting with domain methods rather than exported standalone business functions. Do not imitate inheritance or force Java-style patterns into the language.

## Relationships and navigation

Place a relationship module under the aggregate that owns its lifecycle. For example, keep `ProjectMembers` under `Project`, not under `Users`, even though membership references a user.

Allow reverse navigation only for a real use case:

```typescript
const user = new User('user-id');
const projects = await user.projects.list();
```

Make `user.projects` a thin facade that delegates to the canonical project-membership logic. Never duplicate queries, permissions, validation, or business rules in reverse-navigation modules.

## ORM and stored naming

Put Drizzle, Mongoose, or the selected language's equivalent persistence definitions and mechanics under `src/orm`.

- Use plural snake_case table and collection names: `projects`, `users`, `project_members`.
- Use snake_case stored fields and columns: `project_id`, `created_at`.
- Use the selected language's native application identifier casing for ORM-facing names: `projectId` and `createdAt` in JavaScript or TypeScript, and `project_id` and `created_at` in Rust.
- Explicitly configure collection names instead of relying on ODM auto-pluralization.
- Keep business rules out of schemas, models, hooks, repositories, and migrations.
- Keep transactions and persistence mechanics in ORM, but initiate business operations through logic methods.

## Services

Put every non-database external connection under a provider-specific `src/services/<service-name>` directory:

```text
src/services/
├── redis/
├── valkey/
├── ses/
├── s3/
├── aws-secrets-manager/
├── openbao/
└── open-telemetry/
```

Apply the selected language's directory and package naming rules. TypeScript may add an export-only `index.ts`; Python may add an export-only `__init__.py`; Go uses package exports without an index file.

- Keep SDK clients, connection lifecycle, provider authentication, serialization, retries, and provider-specific error translation inside the service directory.
- Forbid direct vendor SDK imports outside the owning service directory.
- Keep business policy in `logic`; services implement integration capabilities only.
- Add only providers the feature actually needs. Do not introduce speculative abstractions for hypothetical providers.
- Keep OpenTelemetry SDK initialization, exporters, resource attributes, propagation, and shutdown under `services/open-telemetry`. Prefer exporting through an OpenTelemetry Collector to OpenObserve instead of importing an OpenObserve-specific SDK throughout the application.
- Treat automatic protocol, ORM, and provider instrumentation as cross-cutting infrastructure, not a consumer bypass. REST, gRPC, MCP, and workflows may be wrapped by shared instrumentation but must not call provider exporters or observability backends directly.

## REST, gRPC, MCP, and workflows

Treat REST, gRPC, and MCP as protocol adapters:

- Parse and validate protocol shape.
- Authenticate the caller at the boundary unless the route is explicitly allowlisted and documented as public.
- Call a logic method.
- Translate logic results and errors into the protocol response.
- Never duplicate business validation or query ORM/services directly.

Place Temporal workflows under `src/workflows`, grouped by feature. Keep supporting activities beside the workflow unless genuinely shared.

Group the workflow definition, its activities, and its optional package entrypoint under `src/workflows/<feature>/<workflow-name>`. Use the selected language's filenames and package conventions.

- Put durable sequencing, timers, signals, retries, and compensation in workflows.
- Put side effects in activities, but require activities to call `logic`; activities must not access ORM or services directly.
- Keep domain validation and business decisions in `logic`.

## Dockerfiles

Keep deployable image definitions under root `dockerfiles`:

```text
dockerfiles/
├── rest.Dockerfile
├── grpc.Dockerfile
├── mcp.Dockerfile
└── workflows/
    └── <workflow-name>.Dockerfile
```

- Create `rest.Dockerfile` when the project exposes REST.
- Create `grpc.Dockerfile` when the project exposes a separately deployable gRPC server.
- Create `mcp.Dockerfile` when the project exposes a separately deployable MCP server.
- Create one workflow Dockerfile per independently deployable Temporal worker. Use the workflow's kebab-case name as the filename.
- Keep the repository root as the default build context unless the project has a demonstrated reason for a narrower context.
- Use `.dockerignore` to exclude Git data, local dependencies, build output, test artifacts, documentation not needed at runtime, and secrets.
- Never bake credentials or secret values into image layers, arguments, labels, or build output.
- Use multi-stage builds and a minimal non-root runtime image where the language and runtime support them.
- Follow [release.md](release.md) for image repository names and tag behavior.

## Naming and formatting

- Name all files and directories in kebab-case where the language and toolchain permit it.
- Use lowercase snake_case for Go source filenames because hyphens are not valid in Go package filenames; keep Go directories in kebab-case only when the Go toolchain accepts the import path, otherwise use a single lowercase word.
- Use lowercase snake_case for importable Python module filenames because hyphens are not valid Python identifiers; keep non-module files and directories in kebab-case where the toolchain permits it.
- Use Rust-native casing for all authored Rust: `snake_case` for modules, source filenames, functions, methods, fields, and variables; `UpperCamelCase` for types, traits, and enum variants; and `SCREAMING_SNAKE_CASE` for constants and statics.
- Name classes in PascalCase.
- Name methods, functions, properties, variables, and parameters in camelCase.
- Use camelCase for new application-facing payload fields unless an external protocol mandates another casing.
- Treat the preceding class, identifier, and payload defaults as non-Rust rules. In Rust, preserve required wire casing through explicit serialization mappings while keeping Rust identifiers idiomatic.
- Preserve protocol-defined names such as OAuth fields exactly.
- Use four spaces per indentation level and no tabs by default.
- For Go, follow `gofmt`, including tab indentation.
- Let generated and vendored files follow their generating tool.
- Configure formatters and editors to enforce the applicable rule.
