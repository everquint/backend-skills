# Language Profiles

## Contents

- Shared rules
- JavaScript and TypeScript
- Go
- Python
- Coverage honesty

## Shared rules

- Pin the runtime, package manager, formatter, linter, static analyzer, test runner, and coverage tools through the language's normal reproducible mechanism.
- Run formatting, linting, static or type checks, tests, architecture checks, and coverage locally and in CI with warnings treated as failures.
- Use four spaces unless the language formatter requires otherwise; Go uses `gofmt` tabs.
- Preserve Ever Quint naming: classes or class-equivalent exported types in PascalCase and application identifiers in camelCase, except syntax or toolchain constraints stated below.
- Use commitlint for commits regardless of application language.
- Add no second tool that owns the same concern without a documented gap and ADR.

## JavaScript and TypeScript

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

## Coverage honesty

The semantic requirement is 100% execution of authored lines, statements, functions or methods, and decisions or branches. Do not claim a metric the selected language tool does not measure.

- JavaScript/TypeScript and Python must mechanically gate all four dimensions per file.
- Go's standard coverage is statement-oriented. Gate 100% statement coverage per package and function report, require explicit tests for every decision outcome, and use mutation testing plus review to expose missed branches. If a maintained compatible branch-coverage tool is adopted, gate it at 100% per authored file.
- Report tool limitations openly. A repository aggregate or a renamed metric never satisfies a per-file requirement.
