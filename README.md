# Open Privacy Standard

**Build what matters. Privacy comes standard.**

Open Privacy Standard (OPS) is an open-source project that helps builders understand and implement responsible data handling, privacy, and security.

We are building for first-time developers, people building with AI, and business owners having applications built for them. You should not need to know the names of privacy laws—or become a privacy engineer—to find a sound starting point.

## Product status

**This repository currently contains the product definition only.** The regulatory knowledge base, guidance API, MCP server, privacy engine, SDKs, and conformance tests have not been implemented or released.

The public website is maintained separately. Website code is not part of this repository.

## What we are building

OPS combines three foundations:

1. **Understand the responsibilities.** Source-backed, plain-language guidance helps people discover privacy questions they may not know to ask.
2. **Bring that guidance into the build.** An API and MCP server give coding agents and developer tools access to the same versioned regulatory knowledge and implementation guidance.
3. **Make responsible behavior reusable.** Open specifications, a self-hostable reference implementation, SDKs, and public tests help applications handle permissions, preferences, and personal information consistently.

The goal is to democratize these foundations for builders. The project is independent of any commercial privacy platform.

## 1. Regulatory knowledge base and guidance API

A maintained, structured knowledge base will connect official legislation and regulator guidance to practical application scenarios.

Relevant context includes:

- Where the business operates and where its users are.
- The information collected, its sources, and the purposes for using it.
- Age groups, biometric processing, sensitive information, and downstream providers.
- Business scale, activities, roles, thresholds, exemptions, and other applicability conditions.

A country or state alone is not enough to establish whether a law applies.

Each regulatory record should identify its jurisdiction, official sources, relevant provisions, legislative and operative status, effective dates, source-check date, review status, version history, and coverage limitations. Legal requirements, regulator guidance, and engineering recommendations must remain distinguishable.

Outputs should explain candidate rules, why they may matter, missing facts, and useful next steps. Unknown facts must remain unknown; they must not silently become exemptions.

## 2. OPS MCP server

The MCP server is a core product deliverable. It will let an AI coding assistant consult OPS while helping someone build an application.

Proposed capabilities:

| Capability | Intended result |
| --- | --- |
| Discover relevant rules | Candidate rules matched to application context, with reasons and unanswered questions |
| Retrieve a rule | Versioned explanation, official sources, operative dates, review status, and limitations |
| Generate an implementation checklist | Concrete tasks grounded in the selected findings, with legal requirements separated from engineering recommendations |
| Retrieve implementation guidance | Patterns, examples, and verification steps tied to the open specification and reference implementation |

The web-facing guidance API and MCP interface should share one knowledge base. Answers must carry source provenance and freshness information.

The service should work with synthetic descriptions and structural application context. Uploading customer records should not be required to ask a privacy question.

## 3. Open privacy specification and reference implementation

OPS will publish shared contracts and original, reusable implementations for responsible data handling.

The first proposed software scope is **consent and preference management**:

- Define purposes and the notices associated with them.
- Record grants, refusals, withdrawals, and preference changes.
- Read the effective state of a person's choices.
- Evaluate a requested use against configured policies.
- Generate appropriately minimized receipts and decision evidence.
- Propagate changes to integrations so applications can enforce them.
- Verify behavior through public conformance tests.

A receipt is evidence, not enforcement. Applications must honor decisions where information is actually accessed or used.

Permissions and access, minimization, retention, deletion, data-rights workflows, and AI-specific data permissions are expansion areas. They are not claims about an available first release.

## Builder experience

A business owner should be able to describe an application in ordinary language and understand what needs investigation. Their developer or coding agent should be able to turn the same findings into implementation work.

For example:

> I am building a booking app that stores customer contact details and sends appointment reminders. What should my builder check, and what should the application support?

OPS should explain the relevant questions, link to the underlying sources, distinguish unresolved legal applicability from practical safeguards, and provide reusable implementation patterns as they become available.

## Delivery sequence

1. Define a narrow initial scope and the regulatory record format.
2. Build and review a small knowledge base around common application patterns.
3. Implement the guidance API and MCP server.
4. Test explanations with first-time builders and business owners.
5. Publish the initial consent and preference contracts.
6. Build the self-hostable reference implementation and TypeScript SDK.
7. Publish conformance tests and real integration examples.
8. Expand coverage based on reviewed evidence and demonstrated usefulness.

Each release must clearly state what is implemented, what was reviewed, which jurisdictions and scenarios are covered, and what remains unresolved.

## Principles

- **Accessible to beginners.** Explain unfamiliar terms and connect them to recognizable application behavior.
- **Open and independently built.** Publish original code, contracts, reasoning, and tests. Research may use public documentation and authorized observations; proprietary code and protected assets are not project inputs.
- **Trust through evidence.** Preserve sources, versions, review status, and correction history.
- **Privacy by default.** Minimize inputs and avoid unnecessary personal information.
- **Interoperability and self-hosting.** Keep builders free to inspect, adapt, and operate the implementation.
- **Honest limits.** No automatic compliance certification, blanket legal conclusions, or promises that installing a tool removes responsibility.

## Community and governance

Builders and business owners help identify where responsible data handling is confusing. Privacy and security practitioners help make the guidance and implementations sound.

Regulatory corrections should include official sources and explain the affected scope. Contributions should use synthetic examples rather than personal records.

OPS is a proposed initiative. Recognition as an interoperable standard must be earned through useful implementations, transparent governance, independent review, and community adoption.

## Licensing

The intended license for the software implementation is **Apache-2.0**, supporting commercial reuse and explicit contributor patent licensing under its terms. The license file and required notices will accompany the first code release.

Linked legislation, regulator guidance, and third-party material retain their original status and terms.

## Project

Initiated by Brennan Decker.

- Website: https://openprivacystandard.org/
- LinkedIn: https://www.linkedin.com/in/brennandecker
- X: https://x.com/brennan_decker
