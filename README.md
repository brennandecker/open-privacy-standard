# Open Privacy Standard

**Build what matters. Privacy comes standard.**

## Your app works. Do its privacy promises?

A visitor lands from an Instagram ad. A pixel reports the visit. Analytics measures the session. A discount popup collects an email. A marketing tool sends tomorrow’s offer.

To your customer, it is one experience. Behind the screen, their information moves through several systems. **Can you explain those uses—and prove that changing a choice changes what those systems do?**

OPS is an independent, open-source privacy platform being designed for builders who need that foundation. We start with consent and preferences, then extend into data lifecycle and governance.

**Our intended foundation: free to use, self-hostable, API-first, and extensible.** Intended software license: Apache-2.0.

> **Available now:** educational resources, a nine-question assessment, integration-level definitions, illustrative case studies, and a separate browser-local demo. **Not yet available:** installable production OPS packages, APIs, SDKs, connectors, or MCP. This repository remains README-only.

**[Find your starting point](https://openprivacystandard.org/assessment/)** · **[Try the demo](https://demo.openprivacystandard.org/)** · **[Understand privacy architecture](https://openprivacystandard.org/architecture/)** · **[Help build OPS](https://github.com/brennandecker/open-privacy-standard/issues)**

## Start with your application

You do not need to know the names of privacy laws. The **[“Should I care about privacy?” assessment](https://openprivacystandard.org/assessment/)** asks nine plain-language questions about your app, information, tracking, purposes, connected tools, AI, younger users, locations, and lifecycle needs.

You receive a suggested integration level, the answers behind it, and unresolved questions. Answers stay in the page’s memory. This is an integration recommendation, not a legal compliance determination.

## Three levels of integration

These are cumulative integration packages, not paid plans or compliance certifications. All are intended to remain open source. **None has shipped as a production package.**

| Level | Who it fits | Proposed package | Follow an example |
| --- | --- | --- | --- |
| **Tier 1 — Website controls** | A public site with optional analytics or tracking | Consent banner, purpose configuration, script gating, withdrawal, and evidence | [Harbor Workshop: a local furniture website with Google Analytics](https://openprivacystandard.org/case-studies/tier-1/) |
| **Tier 2 — Connected preferences** | A store or app with customer relationships and connected services | Tier 1 plus authenticated preference center, consent service and ledger, API/SDK, and change propagation | [Tide & Trail: Shopify, Meta conversion tracking, and a Klaviyo discount popup](https://openprivacystandard.org/case-studies/tier-2/) |
| **Tier 3 — Data lifecycle & governance** | Sensitive information, younger users, complex platforms, or coordinated privacy workflows | Tier 2 plus inventories, access/deletion requests, retention, policy controls, and governance | [ClearPath Practice: family records and optional AI processing](https://openprivacystandard.org/case-studies/tier-3/) |

**[Explore the tiers and complete feature scorecard →](https://openprivacystandard.org/tiers/)**

Each case study works backward from a customer promise: follow the person, follow the information, identify the controls, and define tests that show the promise holds. The businesses are fictional; the vendor tools are real examples. They are not OPS customer deployments or shipped adapters.

## Privacy is an architecture responsibility

A banner can collect a choice. Respecting it requires the rest of the application to cooperate.

| Layer | The builder’s question | Example |
| --- | --- | --- |
| **Code** | What collects or uses information—and what stops when permission changes? | A discount form, an analytics script, a scheduled marketing job |
| **APIs** | Who may request an action, which records may they access, and is the purpose permitted? | Checking email permission before calling a send API |
| **Database** | What stays, who can access it, and when is it removed? | Customer records, private uploads, consent evidence, logs, and backups |
| **Sharing** | Which other companies receive information, and how do changes reach them? | Meta, Google Analytics, Klaviyo, a CRM, or an AI provider |

These layers overlap. A browser pixel can send information directly to another company without passing through your database. A server-side sender can keep sharing even after the browser pixel is blocked.

**[Read Understanding Privacy Architecture →](https://openprivacystandard.org/architecture/)**

## Two products, one mission

- **OPS runtime platform:** planned services and components that record choices, evaluate configured policy, propagate changes, and retain minimized evidence. Applications must integrate checks at the actual points of use.
- **OPS Guide:** a planned knowledge and integration-planning platform that turns app context into source-linked candidate requirements, unresolved facts, module recommendations, implementation tasks, and acceptance tests. **MCP is the coding-agent interface to that product**, alongside its proposed knowledge API.

OPS Guide can help a builder implement any tier. It does not replace runtime enforcement or certify compliance. Neither platform product is released yet.

## What has actually shipped?

| Deliverable | Current state |
| --- | --- |
| [Educational website](https://openprivacystandard.org/) | Public: learning pages, initial law summaries, assessment, architecture guide, and case studies |
| [Integration levels and feature scorecard](https://openprivacystandard.org/tiers/) | Published definitions; prototype behavior graded separately from software releases |
| [Interactive demo](https://demo.openprivacystandard.org/) | Browser-local prototype with synthetic data and no production vendor connections |
| Production Tier 1, 2, and 3 packages | **0/3 release grade for each:** no complete installable open-source tier released |
| OPS Guide / MCP | Planned; no released endpoint |
| This GitHub repository | Product definition in this README; implementation remains ahead |

The release scale is **0: absent · 1: published source · 2: installable alpha with tests · 3: supported release with documented validation**. Prototype interactions are not production software. Website and demo source are maintained separately from this repository.

## Try the interactive demo

**[Open the OPS demo →](https://demo.openprivacystandard.org/)**

Explore three connected product experiences:

| Experience | Who uses it | Try it |
| --- | --- | --- |
| **Cookie consent banner** | Website visitors choosing optional cookies and tracking | [Try the banner](https://demo.openprivacystandard.org/#consent) |
| **Preference center** | Customers managing email, personalization, and other permissions | [Manage preferences](https://demo.openprivacystandard.org/#preferences) |
| **Admin console** | Business owners and builders configuring purposes and inspecting evidence | [Open the console](https://demo.openprivacystandard.org/#admin) |

**Try a complete workflow:** grant email permission in the preference center, run a permission check, withdraw permission, and check again. The second check is blocked, and the consent evidence records the change.

The demo uses synthetic data and browser-local storage. It is a working interaction prototype, not the production platform. The hosted API, SDK, authenticated customer accounts, integrations, and production ledger remain planned. The demo and marketing website are maintained separately from this product repository.

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

## OPS Guide: knowledge API and MCP platform product

OPS should help builders understand responsibilities they may not know to ask about.

A maintained, source-linked regulatory knowledge base and guidance API will support plain-language explanations, candidate rules, unanswered questions, and implementation checklists. Jurisdiction alone is insufficient: relevant context includes users, data, purposes, age groups, business activities, scale, roles, thresholds, and exemptions.

OPS Guide is the separate knowledge and integration-planning product. Its proposed API will serve structured guidance and module contracts; an MCP server will bring those capabilities into AI coding tools. It does not replace the runtime consent engine, ledger, APIs, SDKs, or enforcement integrations. The website assessment currently uses local rules, not this unbuilt service.

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
- Interactive demo: https://demo.openprivacystandard.org/
- LinkedIn: https://www.linkedin.com/in/brennandecker
- X: https://x.com/brennan_decker
