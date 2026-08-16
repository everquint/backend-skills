# Language Profiles

## Contents

- Shared rules
- JavaScript and TypeScript
- Go
- Python
- Rust
- Coverage honesty

## Shared rules

- Keep authored application code under root `src`, with `logic`, `orm`, `services`, `restapi`, `mcp`, and `workflows` as sibling modules when present. A Rust Cargo workspace is the exception: it has no root `src`; every member package owns `crates/<crate-name>/src`. Keep `debug`, `docs`, and opt-in `terraform` at the repository root.
- Pin the runtime, package manager, formatter, linter, static analyzer, test runner, and coverage tools through the language's normal reproducible mechanism.
- Run formatting, linting, static or type checks, tests, architecture checks, and coverage locally and in CI with warnings treated as failures.
- Use four spaces unless the language formatter requires otherwise; Go uses `gofmt` tabs.
- Preserve Ever Quint naming: classes or class-equivalent exported types in PascalCase and application identifiers in camelCase, except syntax or toolchain constraints stated below.
- Use commitlint for commits regardless of application language.
- Add no second tool that owns the same concern without a documented gap and ADR.

## JavaScript and TypeScript

Use this TypeScript project shape, adding only modules the project needs:

```text
project/
├── src/
│   ├── logic/
│   ├── orm/
│   ├── services/
│   ├── restapi/
│   ├── mcp/
│   ├── workflows/
│   └── dockerfiles/
├── dist/                   # generated JavaScript; never authored
│   ├── logic/
│   ├── orm/
│   ├── services/
│   ├── restapi/
│   ├── mcp/
│   └── workflows/
├── debug/
├── docs/
└── terraform/              # only when explicitly requested
```

Compile TypeScript from `src` into the corresponding path under `dist`: `src/logic` becomes `dist/logic`, `src/restapi` becomes `dist/restapi`, and so on. Never edit or commit generated `dist` output unless the repository's distribution model explicitly requires committed build artifacts.

Required profile:

- Oxlint for linting, with type-aware analysis enabled where supported and CI asserting it actually loaded.
- Oxfmt for formatting, configured for four-space indentation, single quotes, semicolons, and the repository's chosen line width; use two spaces for YAML.
- TypeScript strict checking for TypeScript code. Run the full project graph without trusting stale incremental output after configuration changes.
- Vitest for unit and integration tests unless the selected framework requires a compatible native runner.
- V8 coverage through Vitest with 100% per-file lines, branches, functions, and statements.
- Stryker for mutation testing of logic, security, money, state transitions, and other mission-critical code.

- Pin Node and the package manager and commit the lockfile.
- Use ESM unless the selected runtime or framework requires CommonJS.
- Keep all authored `.js`, `.mjs`, `.cjs`, `.ts`, and `.tsx` filenames in kebab-case.
- Keep `index` files export-only and exclude them from dedicated tests only when they contain no behavior.
- Treat a zero-rule, syntax-only, or non-type-aware Oxlint run as a failed gate when the configuration claims more.

## Go

Use the shared project shape directly. Go builds binaries rather than a mirrored JavaScript tree, so do not create `dist/logic`, `dist/restapi`, or `dist/mcp`. Put produced binaries in the repository's ignored build-output directory or release staging area.

Required profile:

- `gofmt` for formatting; accept its tab indentation.
- `go vet` plus a pinned golangci-lint configuration for lint and static analysis. Avoid enabling two linters that duplicate a finding without benefit.
- `go test ./...` for unit and integration tests, with real external dependencies supplied through production-compatible ephemeral instances where required.
- `go test -race ./...` for concurrency-sensitive packages and the full suite in CI when runtime cost remains acceptable.
- Built-in fuzzing for parsers, codecs, URLs, payload guards, and other untrusted boundaries.
- The approved vulnerability scanner for the resolved Go module graph.

- Commit `go.mod` and `go.sum`; pin the Go toolchain version.
- Use named receiver types to preserve the OOP logic model. Stateless collection types carry no fields; identity-bound singular types carry their identifier or context.
- Use a single lowercase word for package directories and lowercase snake_case for `.go` filenames because hyphens are invalid.
- Follow Go visibility casing where the language requires exported identifiers to begin uppercase; keep unexported identifiers camelCase.
- Keep generated mocks and code visibly generated and out of authored coverage, while testing the behavior that consumes them.

## Python

Use the shared project shape directly. Do not create a mirrored `dist` source tree. Treat wheels, source distributions, bytecode, and other package output as generated build artifacts.

Required profile:

- Ruff for linting and formatting, configured for four-space indentation and the repository's chosen quote and line-width policy.
- Pyright in strict mode for static type checking. Permit a different checker only through an explicit repository decision with equivalent strictness.
- pytest for unit and integration tests.
- coverage.py through pytest-cov with branch measurement and 100% per-file coverage.
- Hypothesis for property-based tests of parsers, serialization, pagination, idempotency, permission matrices, and other invariant-heavy logic.
- The approved vulnerability scanner for the locked Python dependency graph.

- Pin the Python version and use a locked, hash-verifiable dependency resolution appropriate to the selected package manager.
- Use lowercase snake_case for importable `.py` module filenames because hyphens are invalid identifiers.
- Retain Ever Quint camelCase for application functions, methods, variables, and parameters even though PEP 8 defaults to snake_case; configure naming lint rules to recognize this deliberate organizational decision.
- Use PascalCase for classes and exception types.
- Keep `__init__.py` export-only. Treat it as the language-equivalent index exception to filename casing and dedicated tests.

## Rust

Before scaffolding a Rust backend, ask the user:

> Will the currently planned backend have more than one independently deployable service, such as REST API, MCP server, or independently deployed workflow worker?

- If the answer is no and the backend is REST-only, use one Cargo package.
- If the answer is yes, use a Cargo workspace with one shared core crate and one crate per independently deployable service.
- If the answer is unclear, explain the two layouts and wait for confirmation. Do not choose silently.
- Do not create a workspace merely for tests, examples, debug runners, internal modules, or hypothetical future services.

Use this single-package layout for a REST-only backend:

```text
project/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── lib.rs
│   ├── main.rs
│   ├── logic/
│   ├── orm/
│   ├── services/
│   └── restapi/
├── tests/
├── examples/
├── debug/
├── docs/
├── terraform/              # only when explicitly requested
└── target/                 # generated and ignored
```

Use this workspace layout when multiple independently deployable services are planned:

```text
project/
├── Cargo.toml              # workspace manifest
├── Cargo.lock
├── crates/
│   ├── core/
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── logic/
│   │       ├── orm/
│   │       └── services/
│   ├── restapi/
│   │   └── src/main.rs
│   ├── mcp/
│   │   └── src/main.rs
│   └── workflows/
│       └── <workflow-name>/
│           └── src/main.rs
├── debug/
├── docs/
├── terraform/              # only when explicitly requested
└── target/                 # generated and ignored
```

Do not create `project/src` for a Cargo workspace. The workspace root is not an application package; each member under `crates` keeps its own Cargo-standard `src` directory.

- Make consumer crates depend on `core`; never let `core` depend on REST, MCP, or workflow crates.
- Add only the service crates the confirmed scope requires.
- Keep unit tests beside their modules. In a single package, put Cargo integration tests under root `tests`; in a virtual workspace, put them under the owning crate's `tests` directory because a workspace-only root is not a package test target.
- Put executable debug examples under the owning crate's `examples` directory. Use root `debug` for shared launch configuration and supporting material.
- Treat `target` as Cargo-generated build and cache output, not as a clean distributable tree. Ignore it in Git and copy only the required release binaries into packages or container images.
- Expect release binaries under `target/release` or `target/<target-triple>/release` when cross-compiling; do not hard-code one path without accounting for the build target.

Required profile:

- `cargo fmt --check` with rustfmt for formatting.
- `cargo clippy --all-targets --all-features -- -D warnings` for linting.
- `cargo test --all-targets --all-features` for the relevant package or the full workspace.
- Pin the Rust toolchain and commit `Cargo.lock` for deployable applications and workspaces.
- Use lowercase snake_case Rust module filenames and PascalCase exported structs, enums, and traits.
- Use structs, impl blocks, traits, and associated functions to preserve the OOP domain model without imitating class inheritance.
- Use a maintained Rust coverage tool and enforce every metric it actually supports; apply the coverage-honesty rules below.

Cargo references:

- Package layout: https://doc.rust-lang.org/cargo/guide/project-layout.html
- Workspaces: https://doc.rust-lang.org/cargo/reference/workspaces.html
- Build output and cache: https://doc.rust-lang.org/cargo/reference/build-cache.html

## Coverage honesty

The semantic requirement is 100% execution of authored lines, statements, functions or methods, and decisions or branches. Do not claim a metric the selected language tool does not measure.

- JavaScript/TypeScript and Python must mechanically gate all four dimensions per file.
- Go's standard coverage is statement-oriented. Gate 100% statement coverage per package and function report, require explicit tests for every decision outcome, and use mutation testing plus review to expose missed branches. If a maintained compatible branch-coverage tool is adopted, gate it at 100% per authored file.
- Rust coverage capabilities vary by toolchain and coverage tool. Gate every supported authored-file metric at 100%, explicitly test each decision outcome, and use mutation testing plus review rather than relabeling unsupported branch or function metrics.
- Report tool limitations openly. A repository aggregate or a renamed metric never satisfies a per-file requirement.
