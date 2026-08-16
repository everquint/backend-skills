# Data Integrity

## Contents

- Ownership and transactions
- Concurrency
- Schema and migrations
- Query performance
- Retention and deletion
- Backups and restoration
- Verification

## Ownership and transactions

- Keep schema definitions, queries, mappings, repositories, transactions, and migration mechanics in `src/orm`.
- Initiate business operations through `logic`. A logic method defines the business unit of work and asks ORM infrastructure to execute its persistence steps transactionally.
- Keep business decisions out of ORM hooks, triggers, and migrations. Use database constraints for invariants the database can enforce reliably.
- Make transaction scope explicit and as short as correctness allows. Never hold a transaction open across an avoidable remote service call.
- When a business operation combines database state with an external side effect, use an outbox, workflow, or compensating design; a database transaction cannot make a remote API atomic.
- Choose and document isolation based on the anomaly the operation must prevent. Do not assume the ORM default is sufficient.

## Concurrency

- Design every mutation for concurrent callers, retries, and duplicate delivery.
- Prefer optimistic concurrency with a version or compare-and-set condition when conflicts are uncommon.
- Use row, advisory, or distributed locks only for a named invariant; bound acquisition and hold time and define recovery after holder failure.
- Never use an in-process mutex to protect data shared across replicas.
- Make uniqueness and referential integrity database constraints, not check-then-insert logic alone.
- Convert constraint and concurrency failures into stable logic-layer errors.

## Schema and migrations

- Keep table and collection names plural and stored identifiers snake_case.
- Give every migration an immutable identifier and apply each migration exactly once through the approved migration tool.
- Prefer forward recovery. Provide rollback only when it is safe and genuinely supported; never claim a destructive migration is reversible.
- Use expand-and-contract for zero-downtime changes: add the compatible shape, deploy readers, migrate or dual-write data when required, switch writers, verify usage, then remove the old shape in a later release.
- Never combine a destructive schema removal with the first deployment that stops using it.
- Make backfills resumable, idempotent, observable, bounded in batches, and safe under concurrent writes.
- Create large indexes and constraints using the database's online or non-blocking mechanism where available.
- Review data loss, lock duration, table rewrites, replica lag, storage growth, and application-version compatibility before production execution.

## Query performance

- Select only required fields and bound every list query.
- Prevent N+1 access through explicit batching, joins, or preloading appropriate to the ORM.
- Add an index for a measured query pattern, not by guessing; record the query plan for mission-critical or high-volume paths.
- Bound connection pools against database capacity across all replicas, workers, jobs, migrations, and debug processes.
- Set query and lock timeouts and expose slow-query telemetry without recording secret or personal values.
- Treat cache keys, invalidation, TTL, and stampede protection as correctness decisions owned by `logic`; keep Redis mechanics in services.

## Retention and deletion

- Classify stored data and record its owner, purpose, tenant boundary, retention period, and deletion behavior.
- Collect and retain only what the feature needs.
- Make tenant and authorization filters mandatory on every relevant query; test cross-tenant isolation at the ORM and logic boundaries.
- Define whether deletion is immediate, soft, delayed, anonymized, or legally retained. Ensure derived records, search indexes, caches, blobs, analytics, logs, and backups follow the approved policy.
- Protect security audit records from ordinary application mutation while limiting access and retention.

## Backups and restoration

- Define recovery point and recovery time objectives for every durable store.
- Encrypt backups, restrict access, verify integrity, monitor failures, and separate backup credentials from application credentials.
- Test restoration into an isolated environment on a schedule. A successful backup job without a proven restore is not evidence of recoverability.
- Document point-in-time recovery, regional failure, key loss, and schema-version compatibility procedures.
- Never restore production personal or secret data into an uncontrolled development environment.

## Verification

Test constraints, transaction rollback, concurrency conflicts, duplicate requests, migration compatibility, resumable backfills, query bounds, tenant isolation, retention, deletion propagation, and restore procedures. Use the real database engine for integration tests. Include authored ORM and migration code in the 85% overall coverage gate, retain stricter coverage for security or mission-critical controls, and separately verify generated migrations apply successfully.
