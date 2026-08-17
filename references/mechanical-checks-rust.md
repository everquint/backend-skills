# Rust Mechanical Checks

Use this reference only for Rust enforcement work.

## Selection

- Prefer Cargo tests, the selected web or gRPC framework's in-process test facilities, compiler visibility, Clippy, `cargo-llvm-cov`, and the OpenTelemetry SDK's test facilities.
- Before adding framework middleware, `tower-http`, `trybuild`, telemetry-test helpers, rate-limit crates, or another enforcement dependency, show the user the exact maintained crate, pinned version strategy, commands, and why existing facilities are insufficient. Wait for confirmation.
- The mandatory Rust profile tools already selected in [language-profiles.md](language-profiles.md) do not require another tool-choice discussion, but their versions and installation method must remain reproducibly pinned.
- If no user channel exists, use an already installed, standard-library, or framework-native mechanism. Otherwise record the missing gate as a blocker; never add a crate silently or claim the check ran.

## Required checks

- Exercise the real HTTP router and gRPC service through the framework's in-process transport. Assert `X-Content-Type-Options: nosn` and the documented cache policy, including `Cache-Control: no-store` for sensitive responses.
- Drive repeated invalid credentials through the real authentication and rate-limit layers with a controllable clock and isolated store. Prove the failure path is limited without tenant or principal key collisions.
- Inject a handler panic. Use the framework's maintained panic boundary where unwinding is supported and safe; assert a safe protocol error, one diagnostic record, and continued unrelated service. Abort or exit when the panic can leave process invariants unknown.
- Hold a task open during shutdown and use paused Tokio time or a bounded real deadline to prove readiness drops, new work stops, tasks drain or cancel, telemetry flushes, resources close, and the process completes within its grace period.
- Use an OpenTelemetry in-memory exporter or manual reader to prove trace propagation, required metrics, log correlation, and redaction across consumer, logic, ORM, and service boundaries.
- Deliberately remove coverage from one ordinary Rust line and one manifest-listed critical line. Prove the 85% aggregate gate and the separate 100% critical-file checker fail for the intended reasons before accepting either gate.
- Enforce consumer-to-core visibility with crate boundaries. For forbidden-import checks or the one-struct-per-file rule that the compiler and Clippy cannot express, present a pinned Rust-native AST or compile-fail check to the user before adding it; never substitute a fragile text search without disclosure.
- Run Miri on supported unsafe or invariant-sensitive tests and `cargo test` on panic, cancellation, and shutdown paths. Treat an unsupported Miri path as disclosed unverified scope, not a passing result.
