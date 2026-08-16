# Delivery Workflow

## Contents

- Branch model
- Worktrees and scope
- Commits
- Pull requests and review
- Merge and rollback
- Release preparation

## Branch model

Use trunk-based development:

- Keep one long-lived protected default branch.
- Create every change from the current default branch on a short-lived branch.
- Name branches `<type>/<ticket>-<kebab-case-slug>` when a ticket exists and `<type>/<kebab-case-slug>` otherwise.
- Use conventional types such as `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `build`, `ci`, and `revert`.
- Merge through a pull request after required gates; never push work directly to the default branch.
- Delete a short-lived branch after merge.
- Create `release/<major>.x` only when a supported older major genuinely needs fixes after the default branch has moved forward. Accept cherry-picked fixes, not new features.

## Worktrees and scope

- Use one Git worktree per simultaneous agent or developer session. Shared working directories make branch state mutable underneath another session.
- Verify the branch and working tree before every commit.
- Keep one ticket or coherent outcome per branch and pull request.
- Never use a stash as routine workflow. Preserve work explicitly in its owning worktree or commit.
- Keep every changed line traceable to the task. Split unrelated cleanup and migrations into separate work.

## Commits

- Keep commits small. Each commit must contain one coherent change that a reviewer can understand, verify, and revert independently.
- Do not mix behavior, refactoring, formatting, dependency updates, generated output, migrations, or unrelated cleanup when they can be reviewed as separate commits.
- Include the tests and documentation required to keep that individual commit truthful and verifiable.
- Do not use an arbitrary changed-line limit as a substitute for coherence. Split when the commit has more than one reason to change or needs more than one independent explanation.
- Follow the [Conventional Commits 1.0.0 specification](https://www.conventionalcommits.org/en/v1.0.0/) with a lowercase imperative subject: `<type>(<optional-scope>)<optional-!>: <description>`.
- Use `!` before `:` and a `BREAKING CHANGE:` footer for breaking API or behavior changes, including the required migration.
- Use the body for material context and the footer for issue references, breaking-change details, and other trailers.
- Preserve the repository's configured human authorship. Never add AI or assistant attribution, assistant `Co-authored-by` trailers, generated-by markers, or assistant signatures to commits, tags, changelog entries, pull requests, or release notes.
- Use commitlint with `@commitlint/config-conventional` as the mandatory commit-message linter in every repository, including non-JavaScript backends. Treat it as repository tooling rather than application runtime code.
- Run commitlint from the `commit-msg` hook against the message file so an invalid commit is rejected before it enters local history.
- Run commitlint again in CI over every commit introduced by the pull request, using the actual merge base and head. Fetch enough Git history for that range; a shallow checkout that silently validates only one commit is a failed gate.
- Make commitlint a required blocking check and protect its configuration and hook from unreviewed bypasses.
- Require automation, dependency bots, release jobs, merge commits, and reverts to produce valid Conventional Commit messages. Configure the producer; do not exempt the author class from linting.
- Never use `--no-verify`, disable the hook, or rewrite the CI command merely to pass an invalid message. Correct the commit message.
- Make each commit buildable and reviewable. If an unavoidable intermediate migration cannot be deployed alone, state the dependency explicitly and keep the sequence adjacent.
- Separate large mechanical formatting or generated changes from behavioral changes and record blame-ignore revisions where the platform supports them.
- Never bypass hooks or required checks to create a commit.
- Add a reviewable release-note fragment for every user-, operator-, API-, schema-, security-, or compatibility-visible change.
- Do not hand-edit generated changelog entries or version declarations outside the release process.

## Pull requests and review

- Open a draft pull request after the first meaningful commit when early visibility or CI feedback helps.
- State the problem, approach, tests, migrations, compatibility, security impact, operational impact, observability, rollout, and rollback.
- Link the ticket, ADRs, feature documentation, contracts, and release-note fragment.
- Review independently on at least two axes: conformance to the requested behavior and correctness/security of the implementation.
- Require all lint, formatting, type or static checks, unit, integration, E2E, overall coverage, stricter control-specific coverage, architecture, documentation, migration, secret, dependency, and supply-chain gates that apply.
- Never merge a red, skipped, or false-green required gate.
- Resolve review findings in code or explain concretely why no change is warranted; do not dismiss them with preference alone.

## Merge and rollback

- Prefer a merge commit when preserving the reviewed commit sequence helps auditability. Do not squash away deliberately separated migrations, generated changes, and behavior without a repository decision.
- Rebase or update the branch before merge when required, then rerun affected gates.
- Roll back with a new reviewed revert or forward fix. Never move a published tag or rewrite shared default-branch history.
- Make database rollback follow [data-integrity.md](data-integrity.md); application rollback is unsafe when the old version cannot read the current schema.
- Keep a known-good immutable package or image digest available for operational rollback.

## Release preparation

1. Confirm every included change has its release-note source.
2. Generate the version and changelog change for review.
3. Run the full clean-checkout gate and build every configured artifact.
4. Merge the approved release change to the default branch.
5. Create the immutable semantic Git tag from that exact commit.
6. Let the tag-triggered workflow verify and publish packages and every configured image.
7. Confirm registry versions, image tags, digests, signatures, provenance, and release notes after publication.

Follow [release.md](release.md) for version and image rules and [supply-chain.md](supply-chain.md) for artifact trust.
