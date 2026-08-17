# Rust Profile

## Package-layout decision

Before scaffolding a Rust backend, ask whether the currently planned backend has more than one independently deployable service, such as REST API, gRPC, MCP, or an independently deployed workflow worker.

- One deployable protocol service uses one Cargo package.
- Multiple independently deployable services use a Cargo workspace with one shared core crate and one crate per service.
- If the answer is unclear and a user channel exists, explain both layouts and wait for confirmation.
- If no user channel exists, prefer a Cargo workspace, record the assumption and reason in the implementation notes or ADR, and flag it for review.
- Do not create a workspace merely for tests, examples, debug runners, internal modules, or hypothetical services.

## Guidance prerequisites

Before non-trivial Rust implementation or review:

1. Resolve the pinned toolchain, edition, and declared minimum supported Rust version.
2. Consult only task-relevant chapters of the [stable Rust Book](https://doc.rust-lang.org/stable/book/index.html). Use the pinned compiler, Rust Reference, standard-library documentation, and official Rust documentation to settle language or toolchain questions.
3. When available, use [`rust-skills`](https://github.com/leonardomso/rust-skills): read its index, then load only relevant categories such as ownership, errors, memory, unsafe code, async, concurrency, performance, structure, linting, or testing.
4. Treat `rust-skills` as supplementary. Official documentation and the pinned toolchain win conflicts.
5. Do not install, clone, or update `rust-skills` without user confirmation. If unavailable, disclose that it was not applied and ask whether it should be installed or supplied.
6. Subject its recommendations to this skill's confirmation, architecture, security, and simplicity rules.

## Single-package layout

Use this for one deployable protocol service:

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
│   └── <consumer>/         # restapi, grpc, mcp, or workflows
├── tests/
├── examples/
├── dockerfiles/
├── debug/
├── docs/
├── terraform/              # only when infrastructure as code is required
└── target/                 # generated and ignored
```

## Cargo workspace layout

Use this for multiple independently deployable services:

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
│   ├── grpc/
│   │   └── src/main.rs
│   ├── mcp/
│   │   └── src/main.rs
│   └── workflows/
│       └── <workflow-name>/
│           └── src/main.rs
├── debug/
├── docs/
├── tests/                   # shared assets and cross-service E2E support
├── dockerfiles/
├── terraform/              # only when infrastructure as code is required
└── target/                 # generated and ignored
```

- A Cargo workspace has no root application `src`; each crate owns its Cargo-standard `src`.
- Consumer crates depend on `core`; `core` never depends on a protocol or workflow crate.
- Add only service crates required by the confirmed scope.
- Keep unit tests beside modules. Single-package integration tests live under root `tests`; workspace integration-test targets live in the owning crate's `tests`, while root `tests` holds shared assets and cross-service E2E support.
- Put executable debug examples under the owning crate's `examples`; root `debug` holds shared launch configuration and support.
- Treat `target` as generated build/cache output. Ignore it and copy only release binaries into packages or images.
- Release binaries may be under `target/release` or `target/<target-triple>/release`; account for the build target.

## Required tooling

- `cargo fmt --all -- --check` with rustfmt.
- `cargo clippy --workspace --all-targets --all-features -- -D warnings`.
- `cargo test --workspace --all-targets --all-features`, then `cargo test --workspace --doc --all-features` because `--all-targets` excludes documentation tests.
- `cargo-llvm-cov` with `cargo llvm-cov --workspace --all-features --all-targets --fail-under-lines 85 --fail-under-functions 85 --fail-under-regions 85`. Do not mandate unstable branch mode. Maintain `quality/rust-critical-coverage.toml` for authentication, authorization, RBAC, tenant isolation, secret handling, encryption, and explicitly mission-critical files. A deterministic repository-owned JSON-report checker fails when a manifest file is absent or below 100% lines, functions, or regions.
- `cargo-mutants` for changed or focused modules in pull requests and the full workspace on a schedule. Security and mission-critical code permit no surviving non-equivalent mutant.
- `cargo-deny` as the single owner for advisories, licenses, bans, duplicate versions, and sources. Add `cargo-audit` only for a documented gap.
- `proptest` for invariant-heavy serialization, pagination, identifiers, permission matrices, and state machines.
- `cargo-fuzz` for untrusted-input boundaries. Pin its nightly toolchain and use risk-appropriate bounded CI or scheduled jobs.
- Miri for applicable `unsafe`, FFI, custom allocation, raw pointers, interior-mutability invariants, or concurrency. Pin a compatible nightly and run focused `cargo miri test`; disclose unsupported paths.
- Cocogitto for Conventional Commits validation with `cog verify` and `cog check`.
- [`husky-rs`](https://docs.rs/husky-rs/latest/husky_rs/) as the Rust-native hook-manager candidate.

## Naming, modules, and coverage

- Pin Rust and commit `Cargo.lock` for deployable applications and workspaces.
- Follow Rust casing: `snake_case` modules, filenames, functions, methods, fields, locals, and macro names; `UpperCamelCase` structs, enums, variants, traits, and type parameters; `SCREAMING_SNAKE_CASE` constants and statics; short lowercase lifetimes.
- Do not use Ever Quint camelCase inside Rust. Map externally prescribed casing explicitly at serialization and protocol boundaries.
- Preserve the OOP domain model with structs, impl blocks, traits, and associated functions without imitating inheritance.
- Organize cohesive modules, not one struct per file. Keep a domain struct and its inherent `impl` blocks together by default. Related structs, enums, traits, request/response types, and private helpers may share a file. Place a trait `impl` with the type or adapter owning the integration; split only when cohesion or navigation improves.
- Gate workspace-aggregate line, function, and region coverage at 85%, and the versioned critical-file manifest at 100% for the same metrics. Branch coverage is not mandatory while the tool labels it unstable.
- Exclude tests, generated code, vendored code, and compiler-generated regions from authored production coverage, but never exclude authored production merely to pass.
- Require happy-path and meaningful failure-path tests for every feature and behavior-bearing public function, then use mutation testing to reveal weak assertions. Never claim an unsupported metric.

## Cargo references

- [Rust Book](https://doc.rust-lang.org/stable/book/index.html)
- [Cargo package layout](https://doc.rust-lang.org/cargo/guide/project-layout.html)
- [Cargo workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html)
- [Cargo build output and cache](https://doc.rust-lang.org/cargo/reference/build-cache.html)
