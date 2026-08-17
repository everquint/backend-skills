# Memory Safety and Leak Prevention

## Contents

- Release requirement
- Ownership and cleanup
- Bounded retention
- Concurrency and asynchronous work
- Verification
- Language-specific risks
- Production detection

## Release requirement

Treat every known retained-memory or resource leak as a release-blocking defect. This includes managed heap, native allocations, goroutines, tasks, threads, listeners, timers, file descriptors, sockets, streams, database rows or cursors, connection-pool leases, subscriptions, queues, buffers, and caches whose lifetime grows beyond their intended owner.

Do not claim that code has no memory leak from review or coverage alone. Require evidence proportionate to the lifetime and load of the changed component. If the necessary profiling or soak environment is unavailable, state that leak verification was not run and do not report the property as proven.

## Ownership and cleanup

- Give every acquired resource one explicit lifecycle owner.
- Acquire as late as practical and release on success, failure, cancellation, timeout, and shutdown.
- Use the language's deterministic cleanup construct where available. Keep cleanup adjacent to acquisition when that improves auditability.
- Make close, stop, cancel, unsubscribe, and dispose operations idempotent when multiple termination paths can meet.
- Propagate cancellation and deadlines so child work cannot outlive its request, job, activity, or process owner.
- Stop accepting new work before shutdown, then cancel or drain owned work and close pools, clients, listeners, streams, and telemetry within the bounded grace period.
- Never rely on process exit or garbage collection as the normal cleanup mechanism for external resources.

## Bounded retention

- Put an explicit maximum size, lifetime, eviction rule, and overload behavior on every cache, map, registry, queue, buffer, batch, replay store, deduplication set, and in-memory history that can grow from runtime input.
- Do not retain request bodies, responses, ORM records, tenant contexts, secrets, errors, stack traces, or closures after their owning operation completes.
- Avoid global or process-lifetime collections unless their key space is provably finite and documented.
- Make tenant and user input unable to create unbounded cardinality in memory.
- Treat intentional caching as retained memory that must reach a documented steady-state bound. Test eviction and cleanup.

## Concurrency and asynchronous work

- Give every spawned task, goroutine, thread, timer, listener, subscription, and background loop a cancellation or completion path and an owner that observes its termination.
- Never create detached work that captures a request, response, tenant, transaction, connection, or large payload beyond that object's lifetime.
- Bound worker counts and pending work. Apply backpressure instead of allowing queues or promises to grow indefinitely.
- Close or drain channels, queues, streams, and subscriptions according to their ownership contract without leaving blocked producers or consumers.
- Verify repeated reconnect, retry, reload, redeploy, and hot-path error behavior; leaks commonly occur only on recovery paths.

## Verification

For every leak-prone change:

1. identify owned resources and their expected terminal state;
2. warm the runtime so initialization and just-in-time behavior are not mistaken for a leak;
3. repeatedly execute create, use, failure, cancellation, and cleanup cycles under representative concurrency;
4. compare retained heap or live allocations and active resource counts across stable checkpoints;
5. verify state reaches the documented bound or returns to baseline within a bounded settling period; and
6. inspect a heap or allocation profile when retained state grows with completed work.

Use a repeated-lifecycle regression test for deterministic ownership defects. Use a bounded soak or stress test for growth that appears only under concurrency, retries, or realistic duration. Check managed heap and process resident memory because native libraries, buffers, and runtime internals may grow outside the managed heap. Account for allocator and garbage-collector behavior; one high snapshot is not proof of a leak, while growth proportional to completed work after settling is a failure.

Store only non-sensitive summaries from profiles. Heap snapshots and dumps may contain secrets or personal data; restrict access, retention, and publication.

## Language-specific risks

### JavaScript and TypeScript

- Clear timers and intervals; remove event listeners and subscriptions; abort or await asynchronous work; and close streams, sockets, servers, database clients, and provider clients.
- Avoid unbounded module-level maps, closures that retain request graphs, and unresolved promises that retain callbacks or payloads.
- Compare V8 heap profiles or snapshots and active handle counts across repeated lifecycle checkpoints. Generate dumps only in an isolated environment because snapshot creation adds memory pressure and the artifact may contain sensitive data.

### Go

- Cancel derived contexts, stop timers and tickers, close response bodies, files, rows, streams, and clients, and ensure every goroutine has a bounded exit path.
- Avoid goroutines blocked forever on channels, locks, sends, receives, or retries; bound slices, maps, queues, and pools.
- Compare heap and goroutine profiles across repeated workload checkpoints and run the race detector for concurrency-sensitive changes.

### Python

- Use synchronous and asynchronous context managers; close clients, sessions, files, generators, cursors, and pools; cancel and await tasks; and remove callbacks and listeners.
- Avoid unbounded module globals, caches without eviction, reference cycles with finalization surprises, and background tasks retained by registries.
- Compare `tracemalloc` snapshots and active task, thread, descriptor, and connection counts across repeated lifecycle checkpoints. Include a process-level measurement for native extensions not tracked by `tracemalloc`.

### Rust

- Use ownership and RAII for deterministic cleanup, but do not assume Rust makes logical leaks impossible.
- Prevent strong `Arc` or `Rc` reference cycles by using `Weak` for non-owning back-references. Audit `mem::forget`, `Box::leak`, raw pointers, FFI ownership transfer, and process-lifetime registries.
- Abort or join spawned tasks, close channels and streams, and bound caches and queues. Verify destructors and shutdown paths execute under success, error, cancellation, and panic boundaries.
- Profile representative repeated workloads and native allocations when retained memory grows; require explicit user confirmation before adding any new profiling dependency.

## Production detection

- Export memory and active-resource signals through OpenTelemetry without sensitive labels or unbounded cardinality.
- Establish a normal post-warm-up baseline and service-specific memory budget. Alert on sustained retained growth, exhaustion risk, abnormal garbage-collection pressure, and active-resource counts that grow with completed work.
- Correlate memory trends with request rate, queue depth, deployments, retries, tenant load, and restarts without exposing tenant data.
- Capture diagnostic profiles through an authenticated, access-controlled operational path. Never expose a public heap-profile or debug endpoint.
- Treat restart as containment, not a fix. Preserve enough safe evidence to diagnose the leak, then correct and regression-test ownership.
