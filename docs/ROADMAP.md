# From the foundation to functional products

Build one shared consent service, then connect the visitor, customer, and business experiences to it. Educational pages and the browser-local demo are maintained separately. Integration tiers describe application needs; they are not separate codebases or paid plans.

| Milestone | Functional product | Acceptance test |
| --- | --- | --- |
| 1 — implemented in this alpha | Consent API + PostgreSQL ledger + server-side TypeScript SDK | A synthetic customer has no marketing choice; use is blocked. Grant permits the next guarded use. Withdrawal blocks the next one. Retries, stale grants, changed purposes, and another tenant cannot silently change that result. |
| 2 — next | Web consent manager | An actual test site loads no optional analytics or advertising request until the corresponding choice permits it. Reject/withdraw controls stop subsequent optional initialization and usage. Reload preserves choices; a configuration update requests a fresh choice where required. |
| 3 | Customer preference center | An authenticated customer changes a choice, signs in from a second device, and sees the same persisted state. Attempts to read or change another customer's choice fail at the application's session boundary. |
| 4 | Business admin console | An authorized operator creates purposes, versions notices, inspects current state and historical receipts, and tests a decision. Application credentials cannot alter configuration. |
| 5 | Provider delivery | Durable outbox events reach an initial marketing adapter with retries, signatures, duplicate handling, ordering, dead-letter inspection, and reconciliation. A real synthetic provider account stops the next affected operation after withdrawal. |
| 6 | Self-hostable alpha release | Independent builders install from a clean checkout; PostgreSQL and Docker checks pass; endpoint security, UI accessibility, retention, and enforcement limitations are published. |
| Parallel after runtime contracts settle | OPS Guide API + MCP | A coding tool receives versioned, source-linked guidance and accurate installation contracts for the modules that actually exist. No customer records are needed to describe an application. |

## First reference application

A small online shop provides an e-receipt at checkout, optional analytics, advertising conversion tracking, and a promotional signup. Each purpose has its own choice; the fact that checkout returned an email address never creates marketing consent. Use synthetic data and a controlled test provider account.

This application will exercise the banner, account preference center, server-side marketing check, and business console against the same persisted service. Do not turn the current browser-local demo into the ledger or treat a checkbox as proof that a provider honors withdrawal.

## Follow-on integration depth

- Tier 1: banner, purpose configuration, browser script gating, withdrawal, and useful evidence.
- Tier 2: connected identities, server decisions, customer preferences, and tested provider delivery.
- Tier 3: inventory, retention/erasure workflows, rights requests, and governance across stores and sharing.

The service in milestone 1 is a shared foundation. No full tier is completed by this commit.
