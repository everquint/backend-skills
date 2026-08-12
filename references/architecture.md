# Backend Architecture

## Contents

- Canonical repository shape
- Dependency rules
- Logic modules
- Relationships and navigation
- ORM and stored naming
- Services
- REST, MCP, and workflows
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
│   ├── mcp/
│   ├── workflows/
│   ├── tests/
│   └── dockerfiles/
├── debug/
├── docs/
└── terraform/              # only when explicitly requested
```

Add only directories required by the project. Add root `terraform` only when the user explicitly requests Terraform; never scaffold it from a general backend or deployment request. Use root `debug` only for the development adapters defined in [debugging.md](debugging.md): REST Swagger, MCP Inspector, and direct Temporal workflow execution without a Temporal server. Keep every `index.js`, `index.ts`, `__init__.py`, or language-equivalent package entrypoint limited to exports where the language uses such files. Put startup, registration, wiring, and side effects in explicitly named files. Do not invent an `index` file for Go.

## Dependency rules

Enforce this direction:

```text
restapi ────┐
mcp ────────┼──> logic ──┬──> orm
workflows ──┘            └──> services
```

- Put all application and business behavior in `logic`.
- Allow only `logic` to query or mutate `orm`.
- Allow only `logic` to call external integrations in `services`.
- Forbid REST, MCP, workflows, activities, scheduled jobs, webhooks, and CLI consumers from accessing ORM models, database clients, provider SDKs, or services directly.
- Add or reuse a logic method whenever a consumer needs data or an external action. Do not create convenience bypasses.
- Keep ORM and services unaware of REST, MCP, and workflows.
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
- Use camelCase ORM-facing identifiers in application code: `projectId`, `createdAt`.
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
- Treat automatic protocol, ORM, and provider instrumentation as cross-cutting infrastructure, not a consumer bypass. REST, MCP, and workflows may be wrapped by shared instrumentation but must not call provider exporters or observability backends directly.

## REST, MCP, and workflows

Treat REST and MCP as protocol adapters:

- Parse and validate protocol shape.
- Authenticate the caller at the boundary.
- Call a logic method.
- Translate logic results and errors into the protocol response.
- Never duplicate business validation or query ORM/services directly.

Place Temporal workflows under `src/workflows`, grouped by feature. Keep supporting activities beside the workflow unless genuinely shared.

Group the workflow definition, its activities, and its optional package entrypoint under `src/workflows/<feature>/<workflow-name>`. Use the selected language's filenames and package conventions.

- Put durable sequencing, timers, signals, retries, and compensation in workflows.
- Put side effects in activities, but require activities to call `logic`; activities must not access ORM or services directly.
- Keep domain validation and business decisions in `logic`.

## Dockerfiles

Keep deployable image definitions under `src/dockerfiles`:

```text
src/dockerfiles/
├── rest.Dockerfile
├── mcp.Dockerfile
└── workflows/
    └── <workflow-name>.Dockerfile
```

- Create `rest.Dockerfile` when the project exposes REST.
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
- Name classes in PascalCase.
- Name methods, functions, properties, variables, and parameters in camelCase.
- Use camelCase for new application-facing payload fields unless an external protocol mandates another casing.
- Preserve protocol-defined names such as OAuth fields exactly.
- Use four spaces per indentation level and no tabs by default.
- For Go, follow `gofmt`, including tab indentation.
- Let generated and vendored files follow their generating tool.
- Configure formatters and editors to enforce the applicable rule.
