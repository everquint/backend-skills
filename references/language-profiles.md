# Language Profile Selection

Read this shared router when selecting or changing language-specific structure or tooling, then load only the matching profile below. For a polyglot change, load only the profiles for languages whose authored code or tooling will change.

## Shared rules

- Keep authored application code under root `src`, with `logic`, `orm`, `services`, `restapi`, `grpc`, `mcp`, and `workflows` as sibling modules when present. TypeScript pnpm workspaces and Rust Cargo workspaces are exceptions: they have no application code under root `src`; every member package owns its own `src`. Keep `tests`, `dockerfiles`, optional local-development `compose.yaml`, `debug`, `docs`, and required Terraform/OpenTofu configuration at the repository root.
- Pin the runtime, package manager, formatter, linter, static analyzer, test runner, coverage tools, and other required quality tools through the language's normal reproducible mechanism.
- Run formatting, linting, static or type checks, tests, architecture checks, and coverage locally and in CI with warnings treated as failures.
- Use four spaces unless the language formatter requires otherwise; Go uses `gofmt` tabs.
- Preserve Ever Quint naming where the selected language profile does not override it: classes or class-equivalent exported types in PascalCase and application identifiers in camelCase. Language-native rules take precedence.
- Keep hook management and commit validation separate. Before adding either, show the user the maintained language-native candidates, exact versions or pinning strategy, and commands, then wait for confirmation.
- Use the confirmed language-native Conventional Commits validator locally and in CI. Do not introduce another language runtime solely for hooks or commit linting.
- If no maintained native hook manager meets the requirement, disclose the search and offer plain versioned Git hooks or skipping the local hook. If no maintained native validator exists, offer explicitly skipping commit-message validation. Record an approved skip and do not claim the omitted gate as installed or enforced. Add a cross-language toolchain only with explicit user approval.
- Add no second tool that owns the same concern without a documented gap and ADR.
- Require at least 85% overall coverage for every metric the selected profile reliably measures, plus the 100% security and mission-critical gates from [testing.md](testing.md). Never relabel an unsupported metric as satisfied.

## Select exactly one profile

- JavaScript or TypeScript: [language-javascript-typescript.md](language-javascript-typescript.md)
- Go: [language-go.md](language-go.md)
- Python: [language-python.md](language-python.md)
- Rust: [language-rust.md](language-rust.md)

Do not read unselected language profiles for comparison or general background. When stronger mechanical enforcement is in scope, also load only that language's matching `mechanical-checks-*.md` reference routed from [SKILL.md](../SKILL.md).
