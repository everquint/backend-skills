# Versioning, Publishing, and Images

## Contents

- Version initialization
- Git tags
- Package publishing
- Docker image names
- Docker image versions
- Release verification

## Version initialization

- Initialize every new project and package at version `0.0.0`.
- Treat `0.0.0` as an unpublished development sentinel.
- Before the first publication, select the intended semantic version and update every authoritative version declaration.
- Never publish or tag `v0.0.0`.
- Use Semantic Versioning for published packages and public contracts.
- Keep version declarations synchronized by release tooling. Do not maintain independent hand-edited copies when one can be generated from the authoritative version.

## Git tags

Treat the Git tag as the authoritative release identifier.

- Use immutable semantic-version tags such as `v0.1.0` and `v1.2.3`.
- Require the tag to match package manifests, version files, generated metadata, and the changelog release heading.
- Create release tags only from an approved commit on the protected default branch.
- Restrict tag creation with repository rulesets when supported.
- Never move, overwrite, or reuse a published tag.
- Update `CHANGELOG.md` before creating the tag.

## Package publishing

Publish packages only from a GitHub Actions workflow triggered by a semantic-version tag push:

```yaml
name: Publish

on:
    push:
        tags:
            - 'v*.*.*'

permissions:
    contents: read
    id-token: write

concurrency:
    group: publish-${{ github.ref }}
    cancel-in-progress: false
```

- Validate the tag with a strict semantic-version parser; do not rely only on the glob.
- Reject `v0.0.0`.
- Verify every version declaration and changelog heading matches the tag.
- Run lint, formatting checks, type checks, tests, 100% per-file coverage, architecture checks, and builds before publishing.
- Build once and publish the verified artifact.
- Generate version and changelog changes in a reviewable release change before creating the tag. For JavaScript and TypeScript packages, prefer Changesets; use the ecosystem-equivalent maintained tool in other languages.
- Use OIDC trusted publishing instead of long-lived registry credentials when the registry supports it.
- Use a protected release environment and required reviewers for sensitive packages when supported.
- Fail without publishing when any prerequisite fails.

## Docker image names

Map Dockerfiles to image repositories deterministically:

| Condition                                 | Dockerfile                                             | Image repository                       |
| ----------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| REST is the only deployable image         | `src/dockerfiles/rest.Dockerfile`                      | `<repo-name>`                          |
| Repository has multiple deployable images | `src/dockerfiles/rest.Dockerfile`                      | `<repo-name>/api`                      |
| MCP image                                 | `src/dockerfiles/mcp.Dockerfile`                       | `<repo-name>/mcp`                      |
| Workflow image                            | `src/dockerfiles/workflows/<workflow-name>.Dockerfile` | `<repo-name>/workflow/<workflow-name>` |

- Derive `<repo-name>` from the canonical repository/package name, normalized for the target registry.
- Use kebab-case workflow names.
- Do not create a separate workflow image unless the worker is independently deployable.

## Docker image versions

- Apply the exact Git tag as the version tag for every configured Docker image. If the Git tag is `v1.2.3`, every image tag is `v1.2.3`.
- Build and publish every configured image on every release tag, even when that image's source or part of the repository did not change.
- Treat all images carrying one Git tag as a coherent release set.
- Never infer an image-specific version from changed paths.
- Never skip an image because path filtering reports no changes.
- Never overwrite an existing image version tag.
- Do not add mutable aliases such as `latest` unless the project explicitly requires and documents them.

Example multi-image release for Git tag `v1.2.3`:

```text
<repo-name>/api:v1.2.3
<repo-name>/mcp:v1.2.3
<repo-name>/workflow/project-onboarding:v1.2.3
<repo-name>/workflow/billing-sync:v1.2.3
```

## Release verification

1. Validate the semantic Git tag and reject `v0.0.0`.
2. Verify package versions and changelog entries match the tag.
3. Run all code-quality, architecture, security, test, and coverage gates.
4. Build packages and every configured Docker image from the tagged commit.
5. Scan release artifacts and images using the project's approved security tooling.
6. Publish only after every artifact succeeds; avoid a partial release set.
7. Record immutable digests, package versions, provenance, and release notes.

Never treat a successful command as proof that publication occurred. Verify the expected package versions, image tags, and immutable digests in their registries after publishing.

## References

- GitHub Actions tag filters: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore
- GitHub deployment environments: https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- Semantic Versioning: https://semver.org/
