# Documentation Standards

## Contents

- Documentation structure
- Documentation-as-code rules
- Architecture decision records
- API and feature documentation
- Changelog

## Documentation structure

Keep maintained documentation under `src/docs` and the changelog at the repository root:

```text
repository/
├── CHANGELOG.md
└── src/docs/
    ├── index.md
    ├── adr/
    ├── architecture/
    ├── api/
    ├── features/
    ├── data/
    ├── security/
    ├── operations/
    └── development/
```

- Use `index.md` as a short navigation page to canonical documents and the root changelog.
- Use `architecture` for the system overview, module boundaries, dependency flow, diagrams, and external integrations.
- Use `api` for REST/OpenAPI contracts, MCP tools and resources, workflow interfaces, authentication, and error conventions.
- Use `features` for user-visible behavior, business rules, permissions, and important workflows, organized by feature.
- Use `data` for data models, relationships, migrations, retention, and consistency rules.
- Use `security` for the threat model, authentication, authorization, RBAC, tenant isolation, secrets, and incident considerations.
- Use `operations` for deployment, configuration, OpenTelemetry collection and OpenObserve operation, service-level objectives, alerts, dashboards, backups, disaster recovery, and runbooks. Document Terraform there only when the user requested it and `src/terraform` exists.
- Use `development` for local setup, testing, the `src/debug` adapters, contribution workflow, and coding conventions.
- Create only documents that provide maintained value. Do not duplicate the same rule or contract in multiple files.

## Documentation-as-code rules

- Update documentation in the same change as the behavior it describes.
- Treat stale documentation as a defect.
- Prefer executable or generated contract sources such as OpenAPI when available; do not maintain a competing handwritten contract.
- Use Mermaid or repository-native diagrams when a visual materially clarifies relationships or flow.
- Keep links relative within the repository and validate them in CI.
- Never place secrets, live credentials, sensitive tokens, exploit details, or confidential production data in documentation or examples.
- Match the repository's kebab-case filename convention.

## Architecture decision records

Keep ADRs in `src/docs/adr`:

```text
src/docs/adr/
├── 0000-template.md
├── 0001-use-postgresql.md
└── index.md
```

Use sequential four-digit numbers and kebab-case decision titles. Record one significant decision per ADR.

Include:

```markdown
# ADR 0001: Decision title

- Status: Proposed | Accepted | Rejected | Deprecated | Superseded
- Date: YYYY-MM-DD
- Decision owners:
- Supersedes:
- Superseded by:

## Context

## Decision

## Considered options

## Consequences

### Positive

### Negative

## Verification
```

- Create an ADR for a decision with meaningful architectural, operational, security, data, cost, or compatibility consequences.
- Keep context, alternatives, rationale, and consequences concise and concrete.
- Do not rewrite an accepted ADR when the decision changes. Create a new ADR and mark the old one superseded.
- Permit typo and link corrections that do not alter the historical decision.
- Update the ADR index in the same change.

## API and feature documentation

- Document public inputs, outputs, errors, authentication, authorization, pagination, idempotency, rate limits, and compatibility expectations.
- Keep HTTP contracts in OpenAPI where applicable.
- Document MCP tools, resources, prompts, scopes, and error behavior without duplicating business rules.
- Document workflow triggers, signals, queries, activities, retry behavior, timeouts, and compensation at the contract level.
- Link feature documentation to relevant ADRs, API contracts, data models, runbooks, and changelog entries.

## Changelog

Maintain `CHANGELOG.md` at the repository root using Keep a Changelog structure:

```markdown
# Changelog

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
```

- Prefer a maintained release-notes mechanism that records one reviewable fragment per change and generates the versioned changelog during release. Use Changesets for JavaScript or TypeScript packages unless the repository already has an equivalent maintained mechanism.
- When the chosen ecosystem has no suitable fragment tool, update `Unreleased` in the same change that introduces a notable feature, fix, API or schema change, migration, deprecation, security change, or operational impact.
- Do not paste commit logs into the changelog.
- Write entries for package users and operators, including required migration actions and breaking changes.
- Generate or move unreleased entries into a versioned heading with an ISO `YYYY-MM-DD` date before tagging a release.
- Keep newest releases first and link version headings to comparisons when the hosting platform supports it.
- Do not disclose sensitive exploit details in `Security`; link to a controlled advisory when appropriate.
- Skip invisible formatting, test-only, and internal cleanup changes unless they affect users, integrations, or operations.
- Treat a generated changelog as release output. Never hand-edit generated release entries; change the source fragment and regenerate them.

## References

- Architectural Decision Records: https://adr.github.io/
- Keep a Changelog: https://keepachangelog.com/en/1.1.0/
- OpenAPI Specification: https://spec.openapis.org/oas/latest.html
- Diataxis documentation framework: https://diataxis.fr/
