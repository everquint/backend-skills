# JavaScript and TypeScript Profile

## Contents

- Package-layout decision
- Single-package layout
- pnpm workspace layout
- Required tooling
- Naming and coverage

## Package-layout decision

Before scaffolding a TypeScript backend, ask the user:

> Will the currently planned backend have more than one independently deployable service, such as REST API, gRPC server, MCP server, or independently deployed workflow worker?

- If the answer is no and the backend has one deployable protocol service, use one package.
- If the answer is yes, use a pnpm workspace with one shared core package and one app package per independently deployable service.
- If the answer is unclear, explain the two layouts and wait for confirmation. Do not choose silently.
- Do not create a monorepo merely for tests, debug adapters, internal modules, or hypothetical future services.

## Single-package layout

Use this shape for a backend with one deployable protocol service, adding only modules the project needs:

```text
project/
├── src/
│   ├── logic/
│   ├── orm/
│   ├── services/
│   ├── restapi/
│   ├── grpc/
│   ├── mcp/
│   └── workflows/
├── dist/                   # generated JavaScript; never authored
│   ├── logic/
│   ├── orm/
│   ├── services/
│   ├── restapi/
│   ├── grpc/
│   ├── mcp/
│   └── workflows/
├── debug/
├── docs/
├── tests/
├── dockerfiles/
└── terraform/              # only when infrastructure as code is required
```

Compile TypeScript from `src` into the corresponding path under `dist`: `src/logic` becomes `dist/logic`, `src/restapi` becomes `dist/restapi`, and so on. Never edit or commit generated `dist` output unless the repository's distribution model explicitly requires committed build artifacts.

## pnpm workspace layout

Use this shape when multiple independently deployable services are planned:

```text
project/
├── package.json                 # private orchestration package
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── packages/
│   └── core/
│       ├── package.json
│       ├── src/
│       │   ├── logic/
│       │   ├── orm/
│       │   └── services/
│       └── dist/                # generated
├── apps/
│   ├── restapi/
│   │   ├── package.json
│   │   ├── src/
│   │   └── dist/                # generated
│   ├── grpc/
│   │   ├── package.json
│   │   ├── src/
│   │   └── dist/                # generated
│   ├── mcp/
│   │   ├── package.json
│   │   ├── src/
│   │   └── dist/                # generated
│   └── workflows/
│       └── <workflow-name>/
│           ├── package.json
│           ├── src/
│           └── dist/            # generated
├── debug/
├── docs/
├── tests/
├── dockerfiles/
└── terraform/                   # only when infrastructure as code is required
```

- Do not put application code in root `src` or generated application output in root `dist` for a pnpm workspace. Each package owns its `src`, package-specific tests, build configuration, and generated `dist`; root `tests` owns shared support and cross-service E2E behavior.
- Make every app depend on the shared core package through the pnpm `workspace:` protocol. Never let core depend on an app package.
- Keep logic, ORM, and non-database provider services in core. Keep REST, gRPC, MCP, and workflow protocol handling in their owning apps.
- Create one workflow app package per independently deployable workflow worker. Do not create app packages for workflows that always deploy as one worker.
- Add only the app packages required by the confirmed scope.
- Keep the root package private and limited to workspace orchestration, shared tooling, and repository-wide commands.
- Pin pnpm through the root `packageManager` field and commit the single root `pnpm-lock.yaml`.
- Start every package at `0.0.0` and use reviewed Changesets for workspace versioning.
- Reject cyclic workspace dependencies and require recursive commands to fail when their intended package filter matches nothing.

pnpm reference: https://pnpm.io/workspaces

## Required tooling

- Oxlint for linting, with type-aware analysis enabled where supported and CI asserting it actually loaded.
- Oxfmt for formatting, configured for four-space indentation, single quotes, semicolons, and the repository's chosen line width; use two spaces for YAML.
- TypeScript strict checking for TypeScript code. Run the full project graph without trusting stale incremental output after configuration changes.
- Vitest for unit and integration tests unless the selected framework requires a compatible native runner.
- V8 coverage through Vitest with at least 85% overall lines, branches, functions, and statements, plus the stricter security thresholds from [testing.md](testing.md).
- Stryker for mutation testing of logic, security, money, state transitions, and other mission-critical code.
- `@commitlint/cli` with `@commitlint/config-conventional` for commit-message validation.
- [Husky](https://typicode.github.io/husky/) as the JavaScript/TypeScript-native Git-hook manager candidate.

## Naming and coverage

- Pin Node and the package manager and commit the lockfile.
- Use ESM unless the selected runtime or framework requires CommonJS.
- Keep all authored `.js`, `.mjs`, `.cjs`, `.ts`, and `.tsx` filenames in kebab-case.
- Keep `index` files export-only and exclude them from dedicated tests only when they contain no behavior.
- Treat a zero-rule, syntax-only, or non-type-aware Oxlint run as a failed gate when the configuration claims more.
- Mechanically gate at least 85% overall lines, branches, functions, and statements, and apply the control-specific 100% thresholds from [testing.md](testing.md).
