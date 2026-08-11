# Software Supply Chain

## Contents

- Dependencies
- Source and CI
- Build integrity
- SBOM, provenance, and signing
- Vulnerability management
- Deployment verification
- Incident response

## Dependencies

- Commit the ecosystem lockfile and use immutable, reproducible install modes in CI and builds.
- Pin direct dependencies deliberately and review transitive changes through the lockfile.
- Prefer maintained dependencies with an acceptable license, security history, release cadence, and minimal install footprint.
- Remove unused dependencies and prohibit packages whose capability is already supplied safely by the standard library or an approved dependency.
- Automate dependency update proposals, but require the normal tests, review, and release process.
- Never execute an unreviewed install script with production credentials or broad workstation access.

## Source and CI

- Protect the default branch and release tags. Require reviewed pull requests and all mandatory checks.
- Give CI jobs the minimum token permissions. Use separate jobs and environments for validation, build, and publication.
- Pin third-party CI actions or plugins to immutable commit digests; record the human-readable release in a comment or update tool.
- Scan commits and pull requests for secrets. Revoke and rotate a detected secret; deleting it from the latest commit is insufficient.
- Keep untrusted pull-request code away from publish credentials, cloud roles, signing keys, and privileged runners.
- Use ephemeral runners where practical and clean caches by trust boundary.

## Build integrity

- Build from a clean checkout of the exact reviewed commit or immutable Git tag.
- Use pinned language, package-manager, compiler, base-image, and build-tool versions.
- Separate build and runtime images, run as a non-root user, minimize packages, and exclude source, tests, debug adapters, credentials, and build tools from production images unless required at runtime.
- Pin base images by immutable digest while retaining a readable version reference and an automated update path.
- Build once, verify once, and promote the same immutable artifact across environments. Never rebuild a release independently for production.

## SBOM, provenance, and signing

- Generate a machine-readable SBOM for every published package and container image.
- Produce build provenance that ties the artifact to its source commit, workflow, dependencies, and builder identity.
- Sign packages and images with a maintained keyless or protected-key mechanism supported by the registry and deployment platform.
- Publish SBOMs, provenance, signatures, and immutable digests beside the release artifacts.
- Keep signing identity separate from application runtime identity.

## Vulnerability management

- Scan source dependencies, lockfiles, artifacts, and container images before publication and on a recurring schedule after release.
- Define blocking severity and exploitability policy. A scanner exit code without the approved policy is not a gate.
- Verify findings against the shipped artifact and reachable code before dismissing them.
- Record every exception with owner, rationale, compensating control, affected versions, and expiry date.
- Rebuild and republish from the fixed source; never patch a released image manually.
- Monitor base images and already-published artifacts because new vulnerabilities appear after release.

## Deployment verification

- Verify signature, provenance, expected repository, exact Git tag, and immutable digest before deployment.
- Deploy by digest, not a mutable tag. Keep the Git-tagged image name for human release identification.
- Prevent production deployment of `0.0.0`, untagged local builds, debug images, or artifacts from an untrusted workflow.
- Record which package versions and image digests reached each environment.
- Make rollback select a previously verified immutable artifact; never rebuild old source during an incident.

## Incident response

- Maintain a process for compromised dependency, leaked CI credential, malicious release, registry compromise, and signing-identity compromise.
- Be able to identify every affected artifact and deployment from SBOM, provenance, tag, and digest records.
- Revoke credentials and signing trust, quarantine artifacts, notify owners, publish corrected versions, and preserve evidence without exposing secrets.

## Verification

Test or exercise secret detection, permission boundaries, reproducible installation, SBOM generation, provenance, signing, verification rejection, vulnerability-policy failure, and rollback by digest. Treat every false-green or skipped supply-chain step as a release blocker.
