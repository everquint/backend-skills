# Repository Adoption

## Contents

- Greenfield repositories
- Existing repositories
- Language tooling
- Mechanical enforcement
- Adoption verification

## Greenfield repositories

Make the first commit a coherent project initialization. Do not create an empty repository commit or placeholder-only commit. Include the initial version, selected package or build files, applicable quality configuration, and the smallest real project structure required by the confirmed scope; apply normal branch and pull-request rules after this bootstrap commit.

Apply the standard from that project-initialization commit:

1. Initialize every project and package at `0.0.0`.
2. Create only the required application modules under the selected language's source root. Keep shared tests under root `tests` and image definitions under root `dockerfiles`. For TypeScript and Rust, use the router in [language-profiles.md](language-profiles.md) to load only the selected profile, then run its single-package versus workspace decision. Create root `debug` and `docs` only as needed. Create root `terraform` only when infrastructure as code is actually required, using Terraform or OpenTofu as defined in [deployment.md](deployment.md).
3. Establish the dependency direction from [architecture.md](architecture.md) before implementing the first feature.
4. Configure the formatter, linter, type or static checker, tests, overall coverage, architecture checks, and secret scanning before authored production code grows around missing gates.
5. Add documentation navigation, an ADR directory, and the changelog mechanism described in [documentation.md](documentation.md).
6. Add tag-triggered package and image publication only for artifacts the repository actually publishes.

Do not prebuild empty provider abstractions, repositories, services, protocols, workflows, or factories. Add a boundary when the first real dependency needs it.

When local development needs PostgreSQL, Redis or Valkey, Temporal, an OpenTelemetry Collector, or another external dependency, maintain one root `compose.yaml` using Docker Compose. Start one shared container per required service for the repository and let test processes and worktrees use logical isolation inside it; never create a Compose project or dependency stack per test, worker, feature, worktree, or agent. Add only services the application actually needs, pin reviewed images, use health checks, keep data and credentials development-only, and document the startup, migration, reset, and shutdown commands under `docs/development`.

## Existing repositories

Profile before editing:

- Read repository instructions and active configuration.
- Identify the language, runtime, framework, package manager, database, ORM, services, protocols, workflow engine, deployable images, and test tools from files rather than assumptions.
- Run existing gates and record their actual exit status.
- Measure architecture violations, coverage, formatting churn, and test health separately.
- Distinguish a missing gate from a passing gate and a silently skipped gate.

The existing repository supplies facts, not policy. A missing test, direct database call from a handler, or lower coverage threshold remains a standards gap even when it is locally conventional.

Do not mix a repository-wide standards migration into an unrelated feature or fix. Keep the requested change surgical, prevent new violations in changed code, and propose a separately reviewable migration for existing debt. Migrate by coherent boundary or feature, with tests before and after each step.

Never create a blanket suppression baseline that lets new violations enter. When a language tool supports ratcheting, record existing debt and reject growth. When it does not, fix a reviewable slice or retain the existing tool until a safe migration mechanism exists.

## Language tooling

Use the language ecosystem's maintained, widely adopted tools unless an explicit project constraint requires another choice:

- JavaScript and TypeScript: Oxlint is mandatory for linting. Use a compatible formatter and type checker appropriate to the runtime.
- Go: use `gofmt` and `go vet`; add a maintained aggregate linter only for rules not covered reliably by the standard toolchain.
- Rust: use Cargo-native project structure and the required [Rust profile](language-rust.md).
- Python, Java, Kotlin, C#, and other languages: select the established formatter, static analyzer, test runner, and coverage reporter for the actual build system and pinned language version.

Verify capabilities against the pinned version. Tool names alone do not prove that type-aware analysis, branch coverage, architecture rules, or generated-code exclusions are active.

Use one owner per concern. Do not make two formatters own the same files or two linters report the same rule unless the overlap is unavoidable and documented.

## Mechanical enforcement

Automate every deterministic rule that the selected toolchain can express:

- dependency direction between consumers, logic, ORM, and services;
- kebab-case filenames where the language permits it;
- export-only index files;
- one class or exported function per file;
- 200-line function ceiling and 600-line absolute maximum;
- formatting and static-analysis errors;
- at least 85% overall coverage for every reliably measured metric, with stricter security and mission-critical thresholds;
- documentation links and generated-contract drift;
- version, changelog, Git tag, package, and image consistency.

Keep judgment with reviewers when static enforcement would produce false confidence. Naming quality, whether a class has one responsibility, whether a long function's exception is justified, and whether an abstraction is speculative require review.

When a tool can silently skip work, assert that the expected configuration, rule count, test count, coverage files, or artifacts were actually observed. A green command that checked nothing is a failed gate.

## Adoption verification

An adoption is complete only when:

1. The intended source files were discovered by every gate.
2. A deliberate failing probe makes each critical gate fail.
3. The same probe passes after the defect is corrected.
4. Production consumers cannot import ORM or services directly.
5. Coverage is enforced at 85% or higher overall for each supported metric, with the required stricter controls configured separately.
6. Documentation, changelog, versions, and release workflows agree.
7. The full clean-checkout pipeline passes without local-only state or secrets.

Record meaningful tool and architecture choices as ADRs. Keep the rule in this skill or repository configuration and the decision rationale in the ADR; do not duplicate both in every document.
