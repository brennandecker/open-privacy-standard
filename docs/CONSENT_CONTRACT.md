# Consent foundation: alpha contract

This is an original OPS design for consent-dependent processing. It does not determine legal bases, legal applicability, or compliance. The website and browser-local demo are separate projects.

## Trust boundary

OPS authenticates a trusted application server through a bearer token. Each token is bound to exactly one tenant; the caller cannot supply or override that tenant. An `application` credential can record choices and read decisions, purposes, and evidence within its tenant. An `admin` credential can additionally define purposes. Tokens are configured on startup; restart to rotate or revoke them.

**Never put either token in a browser, mobile app, frontend bundle, or public repository.** OPS does not authenticate customers. Your backend must authenticate a customer and authorize access to that customer's opaque subject ID before forwarding any choice or retrieving evidence. All subjects within a tenant are accessible to its trusted server credential. Customer-level access control remains the integrating application's responsibility.

Use stable opaque IDs, rather than email addresses, names, or customer records. The API rejects extra fields and email-shaped identifiers, but cannot establish that an apparently opaque value contains no personal information. Pseudonymous identifiers and choice records still require appropriate protection and retention.

## Purpose versions

A purpose has an identifier, incrementing integer version, title, and exact displayed notice. Versions start at 1. Published versions cannot be overwritten. An identical retry of the latest version is accepted; different wording requires the next version. Store the full wording, including material choices and links that affect its meaning, rather than an editable URL alone.

This alpha conservatively invalidates earlier grants when a purpose version changes. It does not infer whether a wording change is material. The integration must display the current notice before collecting a new choice. OPS records submitted provenance; it cannot prove that the UI actually displayed it.

## Choices and ordering

Each `(tenant, subject, purpose)` starts at revision 0 with **no choice**. A successful `granted`, `denied`, or `withdrawn` event increments that stream's revision. Each submission includes the currently observed `expectedRevision` and current `purposeVersion`.

All transitions require an exact revision match. Client timestamps are not accepted. Database transactions serialize purpose changes and choice writes, while a compare-and-swap rule rejects stale events. Concurrent choices observing the same revision have one winner; the other receives HTTP 409. Rejected requests do not become ledger events.

**Do not automatically update the revision and retry a stale grant.** Read the current state, display current wording, and collect a fresh choice. Withdrawal conflicts must also be surfaced and retried deliberately against the current state; this alpha does not promise asynchronous/offline change propagation.

Each submission has a tenant-scoped idempotency key. The same normalized payload returns the original receipt, even after later withdrawal. The retry does not reapply the event. Reusing a key with different payload returns HTTP 409. A retry receipt describes a historical submission; use a fresh decision check to learn the current permission.

Purpose definitions and events are append-only under normal SQL updates/deletes. A separate current-preference table points to the effective event. Events and that pointer commit in the same transaction. PostgreSQL administrators can modify or remove data; this is not a tamper-proof or cryptographically signed ledger. Retention/deletion maintenance needs an explicit privileged workflow, which is not included in this alpha.

## Decision and enforcement

Only a `granted` event for the current purpose version permits a consent-dependent use. Missing choices, refusal, withdrawal, changed wording, and unknown purposes return `allowed: false`. Decisions include current revision, purpose version, supporting receipt ID, and evaluation time. Service/database failures return an error; they do not grant permission.

`OpsClient.withPermission()` checks immediately before invoking the application's operation. If the decision is blocked or the request fails, it never invokes the callback. Exceptions are not an alternative permission path. Applications must not use stale cached decisions or convert failures into permission.

A decision is a point-in-time observation. A withdrawal can race with an already-started external operation; OPS does not cancel vendor jobs or guarantee atomicity across the API and a provider. Queued jobs should recheck at execution time. Durable vendor delivery, reconciliation, short-lived permits, decision audit storage, and cancellation semantics remain future work.

## HTTP interface

All `/v1` endpoints require `Authorization: Bearer <server token>`. POST requests require `Content-Type: application/json`; body limit is 16 KiB. No CORS permissions or browser-cookie authentication are provided. Responses use `Cache-Control: no-store`. Only liveness is public at `GET /health`; it is not a database readiness check.

| Method | Endpoint | Input / output |
| --- | --- | --- |
| POST | `/v1/purposes` | Admin only: `{ purposeId, version, title, notice }` → definition |
| GET | `/v1/purposes/:purposeId` | Current definition including exact notice |
| POST | `/v1/choices` | `{ subjectId, purposeId, purposeVersion, state, expectedRevision, idempotencyKey, source }` → receipt |
| POST | `/v1/decisions` | `{ subjectId, purposeId }` → current permission decision |
| GET | `/v1/receipts/:id` | A tenant-scoped historical receipt |
| GET | `/v1/history?subjectId=…&purposeId=…` | Up to 100 receipts, newest first; `beforeRevision` is an exclusive pagination cursor |

Errors use `{ "error": { "code": "revision_conflict", "message": "…" } }`. Invalid input returns 400; invalid credentials 401; forbidden configuration 403; missing resources 404; stale versions/revisions/key reuse 409; oversized bodies 413; wrong content type 415; internal or database failures 503. Raw database errors and request bodies are not logged by OPS.

## Scope and next products

This slice supplies a real persisted consent API and server-side TypeScript SDK, with tests and a synthetic enforcement example. It is not a complete Tier 1, 2, or 3 package, a supported release, or an npm-published product.

Next: banner and purpose-based script gating; authenticated preference center and backend session integration; admin purpose/evidence UI; durable withdrawal webhooks and a real provider adapter. Before public production exposure: deployment hardening, rate limits, secrets management, least-privilege database roles, retention/erasure operations, expiry policies, observability, security review, and documented release validation. Docker Compose binds the API to loopback for development; deploy TLS before exposing it remotely.

## Implementation references

PostgreSQL transaction-level advisory locks serialize writes and release automatically when a transaction ends. All statements in a transaction use one `node-postgres` client.

- https://www.postgresql.org/docs/17/explicit-locking.html
- https://node-postgres.com/features/transactions
- https://pglite.dev/docs/pglite-socket

Default local tests use disk-backed PGlite through the PostgreSQL wire protocol with a one-connection pool. That verifies SQL behavior and restart persistence, but does not reproduce a multi-process PostgreSQL server. Set `TEST_DATABASE_URL` to a disposable PostgreSQL 17 database for the same suite using multiple connections; the suite creates and drops a unique schema. CI also exercises that mode and Docker Compose. These configured checks must actually pass before their validation is claimed.
