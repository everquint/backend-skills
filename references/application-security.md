# Application Security

## Contents

- Boundary security
- Trusted proxies and client IP
- Injection and unsafe interpretation
- Outbound requests and SSRF
- Browser and transport security
- Uploads and untrusted content
- Abuse resistance
- Verification

## Boundary security

- Treat every REST body, header, query, path parameter, cookie, gRPC message or metadata value, MCP argument, event, webhook, file, provider response, and database value originating outside the trust boundary as untrusted.
- Parse through an explicit schema before use. Apply length, range, format, count, nesting-depth, and total-size limits before expensive processing.
- Authenticate every operation at the protocol boundary unless it is explicitly allowlisted and documented as public. Authorize again in `logic` immediately before sensitive action.
- Keep authorization independent of client-controlled IP, headers, roles, tenant identifiers, feature flags, or UI state.
- Use maintained framework security mechanisms and encoders. Never create custom escaping, token parsing, cryptography, or security-header logic when a vetted implementation exists.

## Trusted proxies and client IP

Use the direct socket peer address unless the application is deployed behind an explicitly trusted reverse proxy or load balancer.

When deployed behind a trusted proxy and the real user IP is required:

- Configure the framework's trusted-proxy mechanism with the exact proxy addresses, CIDR ranges, or a verified fixed hop count. Never enable a blanket `trust proxy = true` equivalent.
- Restrict network access so clients cannot reach the application directly and bypass the trusted proxy.
- Configure the edge proxy to remove untrusted incoming `Forwarded`, `X-Forwarded-For`, `X-Real-IP`, `X-Forwarded-Proto`, and `X-Forwarded-Host` values before setting the canonical chain.
- Derive the client IP by walking from the socket peer through only trusted hops. Never take the first forwarded value blindly.
- Choose one canonical header strategy supported by the proxy and framework. Do not combine conflicting chains silently.
- Normalize IPv4, IPv6, IPv4-mapped IPv6, and port forms before comparison or rate-limit keys.
- Use the derived IP for telemetry, abuse detection, or coarse rate limiting only. Never treat an IP address as authenticated identity, tenant, ownership, or authorization evidence.
- Record whether the address was direct or proxy-derived without logging the entire untrusted header chain by default.

If the proxy trust configuration is absent or invalid, ignore forwarded client-IP headers and use the direct peer address.

## Injection and unsafe interpretation

- Use parameterized ORM queries. Never concatenate untrusted input into SQL, document-store operators, search queries, or migration commands.
- Pass command arguments as an argument array through a safe process API. Never interpolate untrusted data into a shell command.
- Encode output for its destination and prohibit dynamic template, expression, regular-expression, code, or query evaluation from untrusted strings.
- Allowlist sortable fields, filter operators, object paths, redirect targets, and provider actions.
- Protect against prototype or object-property pollution in languages where nested object merging can modify special properties.
- Use safe parsers with bounded depth and entity expansion disabled for XML or similar formats.

## Outbound requests and SSRF

- Treat every user-influenced URL, hostname, redirect, webhook target, import source, and callback as an SSRF boundary.
- Prefer an allowlist of schemes, hosts, ports, and paths. Permit `https` by default and reject embedded credentials, fragments where irrelevant, and non-network schemes.
- Resolve and validate every destination against private, loopback, link-local, multicast, metadata-service, and otherwise prohibited networks for both IPv4 and IPv6.
- Revalidate redirects and prevent DNS rebinding with an approved outbound client, proxy, or network policy. A pre-request string check alone is insufficient.
- Apply connection, response, redirect, byte, and time limits. Never return raw internal response bodies or headers to the caller.
- Restrict production egress at the network layer so application validation is not the only control.

## Browser and transport security

- Terminate only approved TLS versions and redirect plaintext traffic at the trusted edge.
- Configure CORS with an explicit origin allowlist, required methods and headers, and the minimum credential use. Never combine wildcard origin with credentials.
- Protect cookie-authenticated state-changing requests against CSRF using same-site cookies and a proven token or origin-verification mechanism appropriate to the architecture.
- Set cookies with `Secure`, `HttpOnly`, an intentional `SameSite` value, narrow path/domain, and bounded lifetime.
- Set maintained security headers appropriate to the response, including transport, framing, content-type, referrer, and browser capability controls.
- Mark responses containing secrets, tokens, personal data, or tenant-sensitive content as non-cacheable by shared caches.
- Trust forwarded scheme and host only through the trusted-proxy configuration; otherwise generate absolute URLs from approved configuration.

## Uploads and untrusted content

- Limit file count, declared size, streamed size, filename length, archive expansion, and processing time.
- Verify content from bytes, not extension or caller-supplied MIME type alone.
- Generate storage names; never use an uploaded path directly or allow traversal outside the assigned location.
- Store untrusted files outside executable and publicly served application paths. Serve through a controlled download path with safe content disposition.
- Scan or sandbox risky formats before downstream processing. Disable macros, external references, and active content when the business case does not require them.
- Reject archives with traversal entries, links, device files, excessive entry counts, or decompression ratios.

## Abuse resistance

- Bound request size, parsing work, concurrency, query cost, pagination, authentication attempts, secret reveals, exports, and expensive provider calls.
- Rate-limit by verified principal and tenant, using trusted client IP only as an additional signal.
- Make error responses constant enough to avoid account, tenant, or resource enumeration.
- Audit allowed and denied sensitive actions without storing secrets or unsafe request bodies.
- Fail closed when an authorization, signature, CSRF, proxy-trust, or security-policy dependency cannot produce a trustworthy decision.

## Verification

Test spoofed forwarded headers, direct-backend access, multiple trusted and untrusted proxy hops, IPv6 forms, injection payloads, SSRF redirects and private destinations, CORS preflight, CSRF, cache headers, upload traversal and decompression, oversized inputs, enumeration, and rate limits. Require 100% coverage across every reliably measured metric for authored security controls and use maintained dynamic or static security testing in CI where it provides reliable signal.
