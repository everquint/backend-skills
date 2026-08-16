# Ever Quint Backend Skill

Reusable, language-neutral backend engineering standards for Codex and other agents that support the Agent Skills format. The skill covers architecture, object-oriented business logic, ORM and service boundaries, REST, MCP, Temporal, testing, security, observability, debugging, delivery, and releases.

## Install

Install directly from GitHub:

```sh
npx skills add everquint/backend-skills
```

Invoke the skill explicitly as `$everquint-backend-skill`, or let the agent select it for backend engineering work that matches its description.

## Core standards

- Business behavior belongs in `src/logic` and follows object-oriented design.
- REST, MCP, and Temporal workflows are protocol consumers. They never access the ORM, database, or external providers directly.
- External connections other than the ORM live under `src/services`.
- Keep protocol consumers beside the core under `src/restapi`, `src/mcp`, and `src/workflows`; keep `debug`, `docs`, and opt-in `terraform` at the repository root.
- TypeScript compiles `src` into a generated mirror under `dist`; Python and Go do not create that JavaScript output tree. Rust uses Cargo's generated `target` directory and chooses a single package or workspace based on the confirmed number of independently deployable services.
- All authored backend code requires 100% per-file coverage across lines, branches, functions, and statements, with tests judged for defect-detection effectiveness.
- OpenTelemetry is mandatory for telemetry; OpenObserve is preferred as the backend.
- Ordinary runtime errors are contained at their boundary. The process exits loudly when required infrastructure or a process invariant makes safe operation impossible.
- Secrets, authentication, authorization, supply-chain security, data integrity, and production Temporal behavior are treated as first-class engineering concerns.

See [SKILL.md](SKILL.md) for routing and the focused documents in [references](references).

## Repository layout

```text
backend-skills/
├── agents/openai.yaml
├── references/
├── SKILL.md
├── CHANGELOG.md
├── README.md
└── package.json
```

`package.json` contains repository tooling only. The package is private and is not published to npm.

## Contributing

Install the pinned tooling and validate the repository:

```sh
npm ci
npm run validate
```

Use small, coherent commits that follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). The commit hook and CI both run commitlint. Do not add AI or assistant attribution, `Co-authored-by` trailers for an assistant, generated-by markers, or assistant signatures; commits retain the repository's configured human authorship.

Add a Changeset for every release-visible change:

```sh
npm run changeset
```

## Releasing

New projects begin at `0.0.0`, which is an unpublished development sentinel. Never create or publish `v0.0.0`.

1. Run `npm run version` to update the version and `CHANGELOG.md` from reviewed Changesets.
2. Review, validate, and commit the release change with a Conventional Commit.
3. Create an immutable annotated or signed tag matching the package version, such as `v0.1.0`.
4. Push the tag. The tag-triggered workflow validates the exact version and changelog entry, then creates the GitHub release.

The release workflow never runs from an ordinary branch push.

## License

MIT. See [LICENSE](LICENSE).
