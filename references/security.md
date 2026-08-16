# Security Standards

## Contents

- Authorization and isolation
- User-managed secrets
- Database storage exception
- Passwordless authentication
- MCP authentication decision
- MCP OAuth requirements
- API-key requirements
- Tests and audit evidence

## Authorization and isolation

- Deny by default and grant the minimum required permission.
- Authenticate at the REST, MCP, or workflow boundary.
- Perform authoritative authorization again inside `logic` immediately before sensitive reads, writes, or secret retrieval.
- Verify the current principal, tenant, ownership, role, action, and target resource using trusted server-side data.
- Never trust caller-supplied identity, tenant, ownership, or role claims without verified token context.
- Prevent existence leaks: return the approved not-found/forbidden behavior without confirming inaccessible resources.
- Keep RBAC and tenant-isolation policy in `logic`; consumers only pass verified context and translate outcomes.

## User-managed secrets

Apply this section to product functionality that stores or retrieves secrets supplied or shared by users. Do not confuse this with ordinary deployment environment configuration.

- Store secret values in AWS Secrets Manager, OpenBao, or an equivalent dedicated secret manager.
- Put provider clients under `src/services/<provider-name>`.
- Store only opaque provider references and non-sensitive ownership, tenant, lifecycle, and audit metadata in the database.
- Return metadata only from list operations.
- Require an explicit reveal operation for plaintext retrieval.
- Recheck authorization in `logic` immediately before asking the secret service for the value.
- Minimize plaintext lifetime in memory and transmit only over TLS.
- Never place secrets in URLs, query strings, logs, traces, errors, analytics, caches, events, tests, fixtures, snapshots, or coverage artifacts.
- Redact structured fields and provider errors defensively.
- Audit approved and rejected create, reveal, update, rotate, and delete operations without recording the value.
- Support least privilege, expiry, revocation, rotation, and incident response.

## Database storage exception

Never recommend storing retrievable plaintext secrets in a database. If a hard requirement forces database storage:

1. Warn that the design is not recommended and require an explicit architectural decision.
2. Use a vetted authenticated-encryption implementation such as AES-256-GCM through a proven library.
3. Prefer envelope encryption with a KMS- or HSM-managed key.
4. Keep encryption keys outside the database that stores ciphertext.
5. Store the ciphertext, nonce, authentication tag, key identifier, and key version needed for safe decryption and rotation.
6. Support key rotation and re-encryption.
7. Never design custom cryptography.
8. Apply the same authorization, redaction, audit, and 100% security-control coverage requirements.

## Passwordless authentication

Never recommend or introduce a new password-based login system by default.

Use this preference order:

1. Federated identity through a trusted IdP using OpenID Connect, such as Microsoft Entra ID, Google, or an equivalent provider.
2. Passkeys/WebAuthn for direct passwordless authentication.
3. OTP or magic-link authentication as a fallback.

- Use OpenID Connect, not OAuth alone, for user authentication.
- Validate signature, issuer, audience, expiry, nonce, state, and authorized tenant as applicable.
- Use authorization code with PKCE for browser or public-client flows.
- Request minimum scopes and require IdP MFA or conditional-access policy for sensitive systems when supported.
- Prefer authenticator-app OTP over SMS or voice OTP.
- Treat manually entered OTP as non-phishing-resistant fallback.
- Make OTPs cryptographically random, short-lived, single-use, purpose-bound, identity-bound, attempt-limited, and rate-limited.
- Store only a secure verifier when persistence is necessary; never log plaintext OTP values.
- If legacy requirements force password login, warn that it violates the preferred standard and require an explicit documented exception before implementation.

## MCP authentication decision

Determine whether the MCP operation acts on behalf of an identifiable end user:

```text
Identifiable or delegated user authority → OAuth 2.1
No end-user identity or delegation      → API key is permitted
```

Treat an API key as client or application identity, never as user identity. Do not use API keys for user impersonation, delegated consent, or user-specific authorization.

Recheck the latest official MCP authorization specification before implementing a new authorization flow because registration guidance evolves.

## MCP OAuth requirements

- Use OAuth 2.1 authorization code with PKCE for user-identifying HTTP MCP.
- Implement Protected Resource Metadata and authorization-server discovery required by the applicable MCP specification.
- Validate token signature, issuer, audience/resource, expiry, scopes, and authorized tenant.
- Send access tokens only in the `Authorization` header, never a query string.
- Request least-privilege scopes and return correct `401` versus `403` outcomes.
- Never accept or forward a token intended for another resource.
- Prefer Dynamic Client Registration with OAuth 2.1 when the selected authorization server and current MCP specification support it. Implement RFC 7591, exact redirect-URI matching, rate limits, metadata validation, and per-client consent.
- Recheck the current MCP specification before implementation. If its required registration mechanism differs from DCR, surface the difference and follow the interoperable mechanism rather than silently shipping an obsolete flow.
- Protect against confused-deputy attacks when proxying third-party authorization.

## API-key requirements

For private or service-to-service MCP without end-user identity:

- Generate cryptographically random, high-entropy keys.
- Send keys in a dedicated authorization header, never URLs or tool arguments.
- Show the complete key only once.
- Store a secure hash when later retrieval is unnecessary; store retrievable key material only in an approved secret manager.
- Associate the key with a non-secret identifier, client, tenant, scopes, expiry, status, and audit metadata.
- Support rotation, revocation, rate limiting, and last-used tracking.
- Document that API-key authentication is a private convention rather than the interoperable MCP OAuth flow.

## Tests and audit evidence

- Require 100% coverage across every reliably measured metric for authentication, authorization, RBAC, tenant isolation, secret handling, encryption, and API-key validation.
- Test valid, invalid, expired, revoked, replayed, cross-tenant, wrong-audience, and insufficient-scope cases.
- Test that logs, traces, errors, events, snapshots, and responses do not leak secrets or tokens.
- Preserve CI results, reviews, security-test reports, and relevant audit logs as evidence that controls operated consistently.

## Authoritative references

- OWASP Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- NIST SP 800-63B authenticator guidance: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/
- MCP authorization specification: https://modelcontextprotocol.io/specification/draft/basic/authorization
- MCP security best practices: https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices
- RFC 7591 Dynamic Client Registration: https://www.rfc-editor.org/info/rfc7591/
