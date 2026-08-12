# Feature Flags

## Contents

- Ownership and placement
- Evaluation
- Safety and lifecycle
- Experiments and rollouts
- Verification

## Ownership and placement

- Keep feature-flag business policy in `logic`. REST, MCP, workflows, events, and debug adapters pass verified context and consume the logic outcome.
- Put an external flag-provider SDK and connection under `src/services/<provider-name>`; never import it directly from consumers or ORM.
- Prefer a maintained provider or existing platform over a bespoke flag system.
- Keep flags out of database schemas unless the product explicitly manages flags as domain data.
- Name every flag in kebab-case or the provider's required equivalent and keep one canonical definition.

## Evaluation

- Evaluate security- and authorization-relevant decisions on the server using trusted principal and tenant context.
- Never use a feature flag as the only authorization control.
- Define a safe explicit default for provider timeout, missing flag, malformed value, and unknown context.
- Avoid evaluating the same flag independently in several layers during one operation. Evaluate once at the logic boundary and propagate the decision where consistency matters.
- Snapshot the relevant flag decision for a durable workflow when a mid-execution change would violate determinism or produce an inconsistent sequence.
- Do not place secrets, tokens, personal data, or unbounded user input in flag attributes.

## Safety and lifecycle

Every flag must record:

- owner;
- purpose and linked change;
- creation date;
- flag type: release, operational, experiment, permission, or kill switch;
- safe default and failure behavior;
- expected removal or review date;
- cleanup ticket when temporary.

- Treat temporary flags as debt with an expiry. Remove the flag, dead branch, tests, dashboards, and provider configuration after rollout is complete.
- Make kill switches fail toward the safest behavior and keep them operable during partial provider failure where the design requires it.
- Never reuse a retired flag name for unrelated behavior.
- Record flag changes affecting security, data, cost, or availability in an auditable control plane.

## Experiments and rollouts

- Use stable assignment keys so one principal does not switch cohorts between requests.
- Define eligibility, allocation, exclusion, start, stop, success, guardrail, and rollback criteria before activation.
- Keep experiment analysis separate from authorization and billing truth.
- Roll out progressively only when observability can compare error rate, latency, saturation, and business outcomes by cohort without leaking personal data.
- Stop or roll back automatically or operationally when a predefined guardrail fails.
- Never let a rollout create incompatible writers and readers; follow contract and schema expand-and-contract rules.

## Verification

- Test enabled, disabled, missing, malformed, provider-unavailable, unauthorized, and tenant-isolation cases.
- Test both branches before release and retain tests until the flag and losing branch are removed.
- Verify durable workflow behavior when a flag changes during execution.
- Verify metrics and traces identify the flag decision with bounded, non-sensitive attributes.
- Require 100% per-file coverage for authored flag definitions, evaluation adapters, defaults, and cleanup behavior.
