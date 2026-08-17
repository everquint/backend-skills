# Python Profile

Use the shared project shape from [language-profiles.md](language-profiles.md). Do not create a mirrored `dist` source tree. Treat wheels, source distributions, bytecode, and other package output as generated build artifacts.

## Required tooling

- Ruff for linting and formatting, configured for four-space indentation and the repository's chosen quote and line-width policy.
- Pyright in strict mode for static type checking. Permit a different checker only through an explicit repository decision with equivalent strictness.
- pytest for unit and integration tests.
- coverage.py through pytest-cov with branch measurement and at least 85% overall line and branch coverage, plus the stricter security thresholds from [testing.md](testing.md).
- Hypothesis for property-based tests of parsers, serialization, pagination, idempotency, permission matrices, and other invariant-heavy logic.
- The approved vulnerability scanner for the locked Python dependency graph.
- Commitizen for commit-message validation with `cz check`.
- [pre-commit](https://pre-commit.com/) as the Python-native Git-hook manager candidate. Configure it to invoke the confirmed Python toolchain; do not let a Python-only repository bootstrap Node hooks.

## Naming and coverage

- Pin the Python version and use a locked, hash-verifiable dependency resolution appropriate to the selected package manager.
- Use lowercase snake_case for importable `.py` module filenames because hyphens are invalid identifiers.
- Retain Ever Quint camelCase for application functions, methods, variables, and parameters even though PEP 8 defaults to snake_case; configure naming lint rules to recognize this deliberate organizational decision.
- Use PascalCase for classes and exception types.
- Keep `__init__.py` export-only. Treat it as the language-equivalent index exception to filename casing and dedicated tests.
- Mechanically gate at least 85% overall line and branch coverage and apply the control-specific 100% thresholds from [testing.md](testing.md). Do not claim function or statement metrics when the configured tool does not report them reliably.
