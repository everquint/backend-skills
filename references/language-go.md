# Go Profile

Use the shared project shape from [language-profiles.md](language-profiles.md). Go builds binaries rather than a mirrored JavaScript tree, so do not create `dist/logic`, `dist/restapi`, `dist/grpc`, or `dist/mcp`. Put produced binaries in the repository's ignored build-output directory or release staging area.

## Required tooling

- `gofmt` for formatting; accept its tab indentation.
- `go vet` plus a pinned golangci-lint configuration for lint and static analysis. Avoid enabling two linters that duplicate a finding without benefit.
- `go test ./...` for unit and integration tests, with real external dependencies supplied through production-compatible ephemeral instances where required.
- `go test -race ./...` for concurrency-sensitive packages and the full suite in CI when runtime cost remains acceptable.
- Built-in fuzzing for parsers, codecs, URLs, payload guards, and other untrusted boundaries.
- The approved vulnerability scanner for the resolved Go module graph.
- The Go `github.com/conventionalcommit/commitlint` tool for commit-message validation.
- [Lefthook](https://lefthook.dev/) installed through Go tooling as the Go-native Git-hook manager candidate.

## Naming and coverage

- Commit `go.mod` and `go.sum`; pin the Go toolchain version.
- Use named receiver types to preserve the OOP logic model. Stateless collection types carry no fields; identity-bound singular types carry their identifier or context.
- Use a single lowercase word for package directories and lowercase snake_case for `.go` filenames because hyphens are invalid.
- Follow Go visibility casing where the language requires exported identifiers to begin uppercase; keep unexported identifiers camelCase.
- Keep generated mocks and code visibly generated and out of authored coverage, while testing the behavior that consumes them.
- Gate at least 85% overall statement coverage. Require happy-path and meaningful failure-path tests for every feature and behavior-bearing public function, and use mutation testing plus review to expose weak assertions. Never claim unsupported line, branch, or function metrics.
