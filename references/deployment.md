# Terraform and Deployment

## Contents

- Terraform is mandatory
- Repository structure
- State and secrets
- Plan and apply workflow
- Deployment runtime
- Drift and destructive changes
- Verification

## Terraform only when requested

Do not create, propose, or scaffold Terraform merely because a project deploys infrastructure. Add `src/terraform` only when the user explicitly asks for Terraform or asks to change an existing Terraform implementation.

Once Terraform is explicitly in scope, define and manage that infrastructure under `src/terraform`. Do not introduce Pulumi, CloudFormation, handwritten cloud scripts, or console-only resources into the Terraform-managed scope without an explicit approved exception and ADR.

Keep infrastructure changes in the same repository and review process as the application version they support. Import existing managed resources into Terraform rather than leaving permanent undocumented infrastructure outside state.

## Repository structure

Use this starting shape and add only required modules and environments:

```text
src/terraform/
├── modules/
│   └── <module-name>/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── versions.tf
├── environments/
│   └── <environment-name>/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── providers.tf
│       ├── versions.tf
│       └── .terraform.lock.hcl
```

- Keep environment root modules thin and put a reusable component in `modules` only when a second real consumer or a stable boundary exists.
- Use lowercase snake_case for Terraform block labels, variables, locals, and outputs. Use kebab-case for directories and filenames when not using the conventional single-word Terraform filenames above.
- Declare Terraform, provider, and module version constraints. Commit each root module's `.terraform.lock.hcl` and update it through reviewed dependency changes.
- Give resources consistent environment, service, owner, cost, data-classification, and managed-by tags where the provider supports them.
- Output only values another stack or operator genuinely needs. Mark sensitive output correctly, while remembering that sensitive values still exist in state.

## State and secrets

- Use encrypted remote state with locking, version history, restricted access, and audit logging. Use separate state and credentials per environment and trust boundary.
- Never commit local state, plan files, `.terraform` directories, credential files, or secret variable files.
- Assume state and saved plans can contain sensitive values even when terminal output redacts them. Protect and retain them accordingly.
- Prefer secret-manager references and workload identity. Avoid placing secret values in Terraform variables or resource arguments when the provider would persist them in state.
- Use short-lived CI identity federation rather than long-lived cloud access keys.
- Back up and test recovery of the remote-state backend before mission-critical infrastructure depends on it.

## Plan and apply workflow

- Run `terraform fmt -check`, `terraform validate`, TFLint, an approved infrastructure security scanner, and Terraform tests for authored modules in pull requests.
- Produce a plan for the target environment and make the readable change summary available for review without exposing sensitive values.
- Review replacements, deletions, access-policy changes, public exposure, encryption, backup, network, capacity, and estimated operational impact explicitly.
- Apply only an approved plan from a protected CI environment after merge. Never make routine production changes from a developer workstation.
- Ensure the apply uses the same commit, lockfile, variables, backend, providers, and plan that were reviewed.
- Serialize applies per state and prevent concurrent mutation.
- Require explicit approval for production and every destructive change.

## Deployment runtime

- Deploy the exact signed package or image digest produced by the tag release; never rebuild during infrastructure apply.
- Define health checks, resource requests and limits, replica count, autoscaling bounds, disruption behavior, termination grace, and rollout strategy in Terraform or the Terraform-managed platform configuration.
- Use workload identity and least-privilege network and cloud permissions for each deployable REST, MCP, and workflow image.
- Keep databases, Redis/Valkey, secret managers, collectors, and other required infrastructure private by default.
- When a trusted reverse proxy or load balancer fronts the application, block direct application ingress, sanitize forwarded headers at the edge, and configure the application with the exact trusted proxy path described in [application-security.md](application-security.md).
- Roll out without advertising readiness until required dependencies and migrations are compatible. Preserve a verified rollback digest.

## Drift and destructive changes

- Run scheduled read-only plans to detect drift and alert an owner. Reconcile through code; do not normalize console edits as routine workflow.
- Use `moved` or import declarations when renaming or adopting resources so Terraform does not destroy and recreate them accidentally.
- Protect stateful and critical resources with deletion safeguards where supported, but do not treat lifecycle settings as a substitute for backups.
- Separate destructive removal from the deployment that first stops using a resource. Verify no consumers, data, DNS, credentials, or rollback paths still depend on it.
- Use recoverable decommissioning: snapshot or export where required, revoke access, observe a defined waiting period, then destroy through an approved plan.

## Verification

Verify formatting, validation, lint, security policy, module tests, plans for supported environments, state locking, least privilege, private networking, trusted-proxy behavior, rollout health, autoscaling bounds, restore procedures, drift detection, and destructive approval. A green Terraform command that loaded no configuration or targeted the wrong environment is a failed gate.
