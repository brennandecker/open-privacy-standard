# Open Privacy Standard

**Build what matters. Privacy comes standard.**

**Privacy infrastructure for every builder.**

Open Privacy Standard (OPS) is an independent, open-source privacy platform being designed to make enterprise-class privacy capabilities accessible to developers, first-time builders, people building with AI, and business owners commissioning applications.

Free to use. Self-hostable. API-first. Extensible.

Our starting point is **consent and preference management**: a reusable foundation for recording people's choices, enforcing them across applications and integrations, and retaining evidence of what was agreed.

## Current status

**Planning and investigation. This repository currently contains only this README.**

Documentation research has begun. REA tooling has been installed for the investigation, but client-side artifact analysis and authorized runtime verification are incomplete. No working consent engine, ledger, API, SDK, banner, preference center, admin console, or MCP server has been released.

The public website is maintained separately. This repository is for the actual OPS platform, specifications, SDKs, and tests as they are developed.

## The first release: consent and preferences

The first proposed release is a self-hostable TypeScript platform with a PostgreSQL consent ledger, developer APIs and SDK, configurable consent experiences, and integration hooks.

| Component | Intended capability |
| --- | --- |
| Consent engine and policy evaluator | Define purposes and evaluate whether a requested use is permitted under configured policy |
| Consent ledger | Record grants, refusals, withdrawals, preference changes, purpose and policy versions, timestamps, sources, and relevant evidence |
| REST API and JavaScript SDK | Collect choices, retrieve preferences, check permissions, and retrieve receipts |
| Web consent manager | Configurable banner and preference dialog, purpose categories, consent persistence, withdrawal, and tracker gating |
| Universal preference center | Let authenticated users manage email, SMS, personalization, and data-sharing choices through one configurable experience |
| Admin console | Manage purposes, notices, versions, collection configurations, regional settings, and integrations |
| Webhooks and adapters | Propagate changes into applications, marketing tools, and downstream systems; evaluate Google Tag Manager as an initial integration |
| Self-hosting and verification | Docker Compose, example applications, documentation, and tests for isolation, evidence, and withdrawal enforcement |

These are planned capabilities, not claims about software currently available.

## Consent is a shared primitive

Consent should be usable across a website, mobile app, CRM, marketing platform, API, and AI application.

A common permission service should be able to answer questions such as:

- May this application send a marketing email for this purpose?
- Has this person agreed to personalization?
- Has permission been withdrawn?
- Which purpose and policy version did the choice refer to?
- What evidence supports the current decision?
- Can a future AI integration use a particular category of information for its declared purpose?

The ledger preserves history; an effective-state projection supports permission checks. Applications and integrations must enforce those decisions at the point of use. Recording a receipt alone does not prevent processing.

Consent is one part of responsible data handling. The platform must distinguish consent-dependent uses from other policy and legal-basis questions.

## Proposed architecture

**Developer SDKs → Privacy API and policy engine → PostgreSQL**

**Privacy API → Webhooks and integration adapters → Connected applications**

Modular experiences will sit on that shared foundation:

- Web consent manager
- Universal preference center
- Administrative console
- Later: data-subject request portal and AI policy gateway

The proposed stack is TypeScript, PostgreSQL, a lightweight API service, and a web administrative interface. Docker Compose should provide a straightforward self-hosting path. React and framework-specific SDKs can follow the initial JavaScript SDK; mobile support comes later.

The implementation specification must define tenant and subject isolation, authentication boundaries, purpose-version provenance, event ordering, idempotency, expiration, withdrawal propagation, and integration delivery behavior before these become release claims.

## Research approach: OneTrust as the reference

**Use OneTrust as the reference product, REA as an investigative tool, and build an independent platform from scratch.**

The investigation combines:

1. **Published interfaces:** official API and SDK documentation.
2. **Authorized observations:** consent, preference, and integration behavior in approved test environments.
3. **REA artifact analysis:** evidence from legally accessible client-side implementations.

Findings will distinguish documented behavior, runtime observations, static observations, inferred design, and unresolved questions. Our implementation will use original code and independently designed interfaces.

The investigation should produce a capability map, data contracts, sequence diagrams, black-box test cases, and an evidence-backed implementation specification. Public documentation is useful evidence; it is not proof of runtime behavior or feature parity.

Starting references:

- [OneTrust Developer Documentation Index](https://developer.onetrust.com/onetrust/llms.txt)
- [OneTrust Developer Portal](https://developer.onetrust.com/)
- [REA: Reverse Engineer Anything](https://github.com/morluto/rea)

## Standards and integrations

Support for the following must be explicitly scoped, implemented, and tested:

- Global Privacy Control (GPC)
- Google Consent Mode
- IAB Transparency & Consent Framework (TCF)

Interoperability support, certification, and formal compliance validation are separate deliverables. None is currently claimed.

We will also evaluate existing open-source consent interfaces such as Klaro and CookieConsent for patterns, developer ergonomics, and license compatibility.

## Supporting module: regulatory guidance and MCP

OPS should help builders understand responsibilities they may not know to ask about.

A maintained, source-linked regulatory knowledge base and guidance API will support plain-language explanations, candidate rules, unanswered questions, and implementation checklists. Jurisdiction alone is insufficient: relevant context includes users, data, purposes, age groups, business activities, scale, roles, thresholds, and exemptions.

An MCP server will bring that guidance and implementation knowledge into AI coding tools. It supports the privacy platform; it does not replace the consent engine, ledger, APIs, SDKs, or enforcement integrations.

Guidance must carry official sources, versions, operative dates, source-check dates, review status, and coverage limitations. Unknown facts must remain unknown. The service should not need customer records to evaluate a synthetic application description.

## Long-term platform scope

After a useful consent and preference foundation, the broader mission includes:

| Area | Future scope |
| --- | --- |
| Privacy automation | Data-subject requests, privacy assessments, and data mapping |
| Data-use governance | Policies for collection, processing, retention, and sharing |
| AI governance | Data permissions, model-use policies, and audit evidence |
| Third-party management | Vendor registry and risk assessments |
| Technology risk and compliance | Controls, evidence collection, and workflows |

These are expansion areas, not first-release commitments.

## Delivery plan

1. **Investigation and specification:** complete the bounded consent and preference investigation; define data models, interfaces, state transitions, and black-box tests.
2. **Core infrastructure:** implement the consent engine, ledger, effective-state projection, REST API, JavaScript SDK, and audit tests.
3. **Builder experiences:** implement the banner, tracker gating, authenticated preference center, admin console, regional configuration, and initial integrations.
4. **Self-hostable alpha:** publish Docker Compose distribution, examples, documentation, and security, accessibility, and enforcement test results.
5. **Guidance and expansion:** develop reviewed regulatory coverage and MCP support, then broaden the platform based on demonstrated usefulness.

The earlier 90-day roadmap is an aggressive planning hypothesis, not a committed delivery date or a production-certification claim.

## First adoption milestone

An independent developer can install OPS, add consent management to an application, record auditable choices, evaluate permission, withdraw a choice, and verify that the application stops the affected processing.

Every important decision should be traceable to the applicable purpose, policy version, and consent evidence.

## Open-source principles

- Keep the core services, SDKs, reference interfaces, APIs, and tests open.
- Make the platform understandable to first-time builders and business owners.
- Support self-hosting and interoperable interfaces.
- Minimize collected data and make retention and access explicit.
- Preserve source provenance and distinguish evidence from inference.
- Publish limitations, corrections, and release verification.
- Earn adoption as an open standard through transparent governance and community participation.

## Licensing

The intended software license is **Apache-2.0**. The full license and required notices will accompany the first code release.

Dependencies and reference projects require release-specific license review. Linked legislation, documentation, and third-party material retain their original status and terms.

## Project

Initiated by Brennan Decker.

- Website: https://openprivacystandard.org/
- LinkedIn: https://www.linkedin.com/in/brennandecker
- X: https://x.com/brennan_decker
