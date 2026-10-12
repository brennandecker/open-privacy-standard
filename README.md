# Open Privacy Standard

**Build what matters. Privacy comes standard.**

## Your app collects people's information. Can it respect their choices?

A customer signs up. A parent creates a profile for their child. Someone books an appointment, changes a preference, or asks you to stop using their information.

Your application needs a way to understand those choices, act on them, and show what happened.

**Open Privacy Standard (OPS) is an independent, open-source privacy platform being designed to make that foundation accessible to every builder.** We are starting with consent and preference management: shared infrastructure for recording choices, checking permissions, propagating changes, and retaining evidence.

**Free to use. Self-hostable. API-first. Extensible.**

> **Early-stage project:** this repository currently contains the product definition only. The platform has not been implemented or released. The capabilities described below are planned.

## Who this is for

- **First-time builders** who know what they want to create but may not know what responsible data handling requires.
- **Developers and people building with AI** who need reusable privacy infrastructure inside their applications.
- **Business owners commissioning apps** who need to understand what their builder should implement and how to verify it.
- **Small teams** that need consent and preference management without building the entire foundation themselves.

You should not need to know the names of privacy laws—or become a privacy engineer—to find a sound starting point.

## The problem: collecting a choice is only the beginning

A checkbox can collect an answer. A privacy policy can explain an intention. Neither, by itself, makes every connected system respect that answer.

A customer's preference may need to travel through a website, database, CRM, marketing platform, API, and eventually an AI integration. It can change over time. Different purposes can have different permissions. The application must know which choice is effective now and what evidence supports it.

Building that consistently means handling identity, purpose definitions, versions, timestamps, withdrawals, policy checks, integrations, and audit records. Those responsibilities are easy to miss when a team is focused on getting an app working.

**OPS exists to give builders a shared foundation for this work.**

## Why it matters

When choices are recorded but not enforced, people lose meaningful control over how their information is used. A customer can unsubscribe and still receive marketing. A preference change can get lost between systems. A business can struggle to explain why an application used someone's data.

These failures can harm people, undermine customer trust, create operational rework, and—depending on applicable requirements and the circumstances—create legal exposure.

The risk is not limited to whether your app has a consent banner. It includes what happens to the information after someone interacts with it.

| A recognizable failure | The planned OPS capability |
| --- | --- |
| A customer withdraws marketing consent, but a connected system keeps using the old choice | Effective permission checks and change propagation, with integration tests for withdrawal |
| An older event overwrites a newer preference | Explicit ordering rules and a deterministic current-state projection |
| A team cannot explain which notice or purpose a person agreed to | Version-linked consent history and receipts |
| Each app implements preferences differently | Shared APIs, SDKs, contracts, and conformance tests |

## How OPS will help

OPS will connect three things that belong together:

1. **The person's choice.** Configurable consent experiences and an authenticated preference center.
2. **The application's decision.** A shared consent engine, policy evaluator, API, and SDK.
3. **The evidence.** A PostgreSQL consent ledger linking changes and decisions to their purposes, versions, timestamps, and sources.

Webhooks and adapters will help connected systems receive changes. Public tests and examples will help builders verify that those systems actually honor them.

**Recording a receipt is not enforcement.** Applications and integrations must check and respect the relevant decision where the information is used. OPS is intended to make that behavior reusable and verifiable.

Plain-language regulatory guidance and an MCP server will support builders and their coding tools alongside that operational foundation.

## A concrete example: booking without unwanted marketing

A customer books an appointment and declines marketing emails.

In the intended OPS workflow:

1. The application records the marketing choice against a defined purpose and notice version.
2. OPS records the event and makes the effective preference available through the API.
3. The marketing integration checks permission before using the customer's information for that purpose.
4. If the customer later grants or withdraws permission, the effective state changes and integrations receive the update.
5. The application can retrieve the evidence behind the decision and test that withdrawal stops the affected processing.

Booking-related processing is evaluated separately under its configured policy. Consent for one purpose must not silently become permission for another.

This is an intended product experience, not a demonstration of software currently shipped.

## What is available today—and what comes next

**Current stage: planning and investigation. This repository contains only this README.**

Documentation research now includes OneTrust and Ketch. REA tooling is installed. A bounded REA attempt inventoried Ketch's published JavaScript loader SDK, but semantic analysis was blocked by the execution environment. Direct SDK source inspection is recorded separately from REA evidence. Authorized runtime verification remains incomplete; no complete reverse-engineered platform or feature-parity result is claimed. No working consent engine, ledger, API, SDK, banner, preference center, admin console, or MCP server has been released.

The first adoption milestone is an independent developer installing OPS, collecting a choice, checking permission, withdrawing the choice, and proving that the application stops the affected processing—with traceable evidence.

The public website is maintained separately. This repository is for the actual OPS platform, specifications, SDKs, and tests as they are developed.

## Help shape the foundation

[Open an issue](https://github.com/brennandecker/open-privacy-standard/issues) with a real application scenario, a question you could not answer, or a behavior the platform should support. You do not need privacy expertise or code to contribute a useful question.

Describe the data, the purpose, the person's choice, and what the application should do next. Use synthetic examples rather than customer records.

The sections below explain the proposed release, architecture, investigation approach, standards, roadmap, and licensing in detail.

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

## Research approach: multiple references, independent design

**Study OneTrust, Ketch, established standards, and relevant open-source projects; use REA where artifact evidence is needed; build an independently designed privacy platform.**

We will compare common requirements with vendor-specific choices, then publish OPS's own contracts and design rationale. Each implementation decision should be tied to a builder need, a standard, observed evidence, or an explicit original design choice. Adding more references is useful only when the comparison informs the work.

OneTrust and Ketch are research references. Their inclusion does not imply affiliation, endorsement, feature parity, or compatibility.

The investigation combines:

1. **Published interfaces:** official API and SDK documentation.
2. **Authorized observations:** consent, preference, and integration behavior in approved test environments.
3. **REA artifact analysis:** evidence from legally accessible client-side implementations.

Findings will distinguish documented behavior, runtime observations, static observations, inferred design, and unresolved questions. Our implementation will use original code and independently designed interfaces.

The investigation should produce a capability map, data contracts, sequence diagrams, black-box test cases, and an evidence-backed implementation specification. Public documentation is useful evidence; it is not proof of runtime behavior or feature parity.

Starting references:

- [OneTrust Developer Documentation Index](https://developer.onetrust.com/onetrust/llms.txt)
- [OneTrust Developer Portal](https://developer.onetrust.com/)
- [Ketch Documentation and API Reference](https://docs.ketch.com/)
- [Ketch TypeScript/JavaScript Web API SDK](https://github.com/ketch-sdk/ketch-web-api)
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
