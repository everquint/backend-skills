# Engineering and Code Quality

## Contents

- Think before coding
- Simplicity first
- Surgical changes
- Goal-driven execution
- Evidence and dependency selection
- Clean code
- File and function boundaries
- JavaScript and TypeScript linting
- Comments and errors

## Think before coding

- Inspect before changing code.
- State material assumptions explicitly.
- Surface meaningful alternative interpretations and tradeoffs.
- Point out a simpler approach or push back when warranted.
- Stop and ask when uncertainty could materially affect scope, data, security, compatibility, or architecture.
- Use judgment for trivial, low-risk work; do not turn every small change into ceremony.

## Simplicity first

- Write the minimum code that completely solves the requested problem.
- Add no features, configurability, flexibility, or error cases that the requirement does not need.
- Avoid abstractions for a single use. Refactor when a second real use or proven variation appears.
- Use OOP in `logic` without cargo-cult interfaces, inheritance, factories, or strategies.
- Prefer clear code over compressed or clever code.
- If an implementation is much longer than the behavior warrants, simplify it before delivery.

## Surgical changes

- Touch only what the request requires.
- Do not improve adjacent names, comments, types, formatting, or architecture opportunistically.
- Match established repository conventions during a scoped change unless the task is an explicit standards migration.
- Mention unrelated defects or dead code; do not change them without authorization.
- Remove imports, variables, functions, and files made obsolete by the current change.
- Do not remove pre-existing unused code unless asked.
- Require every changed line to trace to the task or to necessary verification.

## Goal-driven execution

Convert work into verifiable outcomes:

```text
1. Specify the observable behavior → verify the acceptance target is clear
2. Implement the smallest working change → verify the primary path directly
3. Announce the testable milestone → invite user testing while compliance continues
4. Add happy and failure tests, audit, and harden → verify all relevant gates pass
```

- Define success before implementation.
- Reproduce a reported bug before fixing it.
- Prioritize a working vertical slice before spending time on broad audit, coverage, or compliance work.
- Do not defer a minimum safeguard when its absence could expose secrets or tenant data, bypass authorization, corrupt data, or perform an unsafe destructive action.
- Keep multi-step work incremental and independently verifiable.
- Loop until the defined checks pass; do not stop at “looks correct.”

## Evidence and dependency selection

- Detect repository facts; do not derive the standard from existing code.
- Read dependency behavior from the version actually installed. Prefer its source, types, packaged documentation, or official versioned documentation over memory or secondary articles.
- Prove uncertain behavior with the smallest executable probe. Exercise both the expected-success and expected-failure state so a false-green check is visible.
- Search the language ecosystem and the organization's existing modules before writing infrastructure or a reusable utility.
- Prefer a maintained formatter, linter rule, release tool, security library, or framework mechanism to bespoke code.
- Keep policy local even when a tool supplies the mechanism. For example, the coverage tool measures while this standard decides the required threshold.
- Add custom enforcement only when the required rule has no reliable maintained mechanism or when an adopted tool can silently skip enforcement.
- Document a new dependency's purpose, what it replaces, maintenance state, license suitability, and operational or security cost when those are material.
- Never implement custom cryptography, authentication protocols, parsers, retry frameworks, migration engines, or release machinery when a vetted implementation satisfies the requirement.

## Clean code

Apply SOLID, DRY, and KISS pragmatically:

- Give each class one coherent responsibility and one primary reason to change.
- Extend through abstractions only when actual variation exists.
- Preserve parent contracts and invariants in every subtype.
- Keep interfaces small and consumer-specific.
- Make high-level logic depend on stable capabilities rather than vendor SDK details.
- Maintain one canonical representation of each business rule. Treat DRY as duplication of knowledge, not merely similar syntax.
- Avoid premature deduplication that couples unrelated concepts.
- Choose descriptive names that reveal intent.
- Keep methods focused and control flow easy to follow.
- Prefer composition and delegation over unnecessary inheritance.

## File and function boundaries

- Put one class in each file.
- Put one exported function in each file.
- Allow small, tightly coupled, non-exported utilities beside their sole consumer.
- Extract a utility when it becomes reusable, complex, or independently testable.
- Keep index files export-only.
- Target at most 200 physical lines for every function, method, constructor, callback, and handler, counting comments and blanks.
- Allow 201–600 lines only for genuinely complex, cohesive behavior that cannot be split more clearly. Explain the exception in review.
- Prohibit functions over 600 physical lines without exception.
- Treat 200 lines as a ceiling, not a design target; prefer substantially smaller units.
- Do not fragment cohesive behavior merely to satisfy a metric.

## JavaScript and TypeScript linting

- Use Oxlint as the required JavaScript and TypeScript linter.
- Run Oxlint in local verification and CI.
- Treat warnings as failures.
- Configure enforceable architecture, correctness, and size rules where supported.
- Add a small deterministic CI check when Oxlint cannot express a mandatory rule such as the exceptional 600-line hard limit.
- Do not add a second linter unless a required rule cannot be enforced otherwise and the tradeoff is documented.

## Comments and errors

- Make code self-explanatory through precise names, explicit types, focused units, and straightforward control flow. Refactor unclear code before adding an explanatory comment.
- Add a comment only when required to preserve non-obvious intent, an invariant, an external compatibility constraint, a security boundary, a deliberate workaround, or a decision that cannot be made clear safely through code.
- Write comments about why the code must behave that way, not what a readable statement already does. Never repeat identifiers, signatures, types, or control flow in prose.
- Allow a necessary comment around measured performance-sensitive code when the clearer implementation would materially regress the verified requirement. State the constraint, the reason the simpler form was rejected, and the invariant that future changes must preserve; keep benchmark or profiling evidence in the review or linked documentation.
- Do not use performance as a speculative excuse for obscure code. Measure first, keep the smallest justified optimization, and test its behavior.
- Delete obsolete and commented-out code instead of preserving it in comments. Keep every remaining comment accurate when behavior changes.
- Document public APIs using the language's established convention when the contract is not self-evident.
- Represent expected business failures as explicit logic-layer errors.
- Never swallow exceptions silently.
- Preserve useful causal context without leaking secrets or sensitive data.
- Let REST, gRPC, MCP, and workflows translate logic errors into their protocol-specific forms.
