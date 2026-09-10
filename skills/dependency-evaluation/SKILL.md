---
name: dependency-evaluation
description: Determine whether an external dependency is necessary and, when it is, identify and compare viable candidates based on existing solutions, implementation cost, project fit, stability, transparency, documentation, activity, adoption, security, and context-specific footprint.
---

# Dependency Evaluation

Use this skill whenever a task may require a library, package, framework, plugin, utility, or other external dependency.

> Determine the best practical solution before deciding ownership. Prefer an existing adequate solution, but never assume “existing” means local. Adopt a dependency when its value outweighs its engineering, maintenance, security, and performance cost.

Never assume a dependency is necessary or that local implementation is preferable merely because it is possible. Compare realistic alternatives.

## 1. Understand the Requirement

Determine:

- execution context: server, web/client, CLI, build, test, library, or mixed;
- required behavior, constraints, scale, compatibility, security/performance sensitivity;
- recurrence, edge cases, extensibility/future capability;
- approximate implementation complexity and testing burden.

Do not evaluate solutions against an unclear problem.

Split materially different tasks and evaluate them independently. Afterward, determine whether one solution can coherently cover multiple tasks without unnecessary complexity or unacceptable trade-offs. Do not combine unrelated capabilities merely to reduce dependency count.

## 2. Inventory Existing Solutions

Check in this order:

1. language/platform/runtime APIs;
2. current project code;
3. local helpers/utilities;
4. internal abstractions/services;
5. installed dependencies;
6. workspace/monorepo packages;
7. previously used repository solutions;
8. framework/toolchain conventions/utilities;
9. external ecosystem packages.

This is an **inventory, not a local-first preference**.

Distinguish between:

- an existing implementation that already solves the requirement;
- an existing primitive requiring substantial implementation;
- a local implementation from scratch;
- mature external solutions.

If an existing implementation adequately solves the requirement with reasonable complexity and maintenance cost, use it and stop unless comparison is specifically useful. Never reject an external solution merely because local implementation is possible.

## 3. Compare Ownership Cost

Before choosing local or external ownership, assess:

- algorithmic complexity and interacting features;
- edge cases, testing, correctness risk;
- performance tuning;
- API design and interoperability;
- maintenance burden;
- future extensibility and likely feature growth.

Local ownership is attractive when behavior is small, well understood, stable, and cheap to test/maintain. External solutions become more attractive as functionality becomes broad, mature, algorithmically non-trivial, edge-case-heavy, specialized, or likely to grow.

“We can implement it ourselves” is never sufficient justification. Compare **total engineering cost**, not dependency count.

## 4. Research the Ecosystem

For every task without an adequate existing solution, research broadly across applicable categories:

- runtime/platform capability;
- existing project/local implementation;
- installed dependency reuse;
- extension of an existing abstraction;
- specialized external package;
- broader external package covering multiple needs coherently;
- custom implementation.

Search by the underlying capability, algorithms, architecture, and constraints—not only package names. Do not stop at the first popular package or first local implementation, and do not conclude that no dependency is needed merely because no package is immediately known.

For serious external candidates, verify important claims through primary sources where possible:

- official repository/documentation;
- registry/package metadata;
- changelogs/releases;
- issues/PRs;
- maintainer/governance information;
- security advisories;
- bundle-size data when relevant.

Use secondary sources for discovery and primary sources for important verification.

## 5. Evaluate Project Fit

Evaluate every realistic solution against the actual project's philosophy, stack, architecture, and constraints:

- modernity/maintenance standards;
- runtime compatibility;
- TypeScript/type safety;
- performance;
- security;
- API ergonomics/design;
- module format/tree-shaking;
- browser/server compatibility;
- dependency footprint;
- licensing/distribution constraints;
- project conventions;
- implementation/maintenance cost.

Also assess architectural fit where relevant:

- public libraries should avoid leaking unwanted abstractions/types into their API;
- plugin architectures favor composable primitives over lifecycle control;
- explicit error-handling conventions favor compatible error models;
- dependency injection disfavors hidden global state/singletons;
- deliberate abstraction ownership disfavors unnecessary permanent boundaries;
- complex specialized functionality should not be reimplemented locally when that creates substantial long-term ownership.

These are alignment considerations, not mandatory criteria; actual project constraints take precedence. Always explain **how well each solution aligns and why**.

## 6. Context-Specific Rules

### Server

Broader coherent functionality is a positive secondary factor when related capabilities may be useful later, the extra surface has no disproportionate maintenance/security/performance cost, and it can avoid multiple overlapping dependencies.

Future usefulness cannot rescue a poor candidate. Do not prefer local implementation merely because bundle size is irrelevant.

### Web / Client

Prefer the smallest adequate solution, local or external.

Evaluate:

- minified and compressed size when available;
- browser-specific entry points;
- tree-shakability and actual removal of unused functionality;
- transitive dependencies;
- client suitability.

Always show trustworthy package-size data with source, version, and measurement context when possible. Evaluate **bundle impact, not raw install size**.

## 7. Candidate Scorecard

Every viable external candidate receives a **0–10 score for every applicable criterion**, with evidence-based justification.

When local, runtime, or project-owned solutions are materially competitive, evaluate their engineering trade-offs alongside external candidates rather than assuming they win.

### Alignment

Fit with project philosophy, stack, architecture, and constraints.

- **9–10:** natural fit, little/no compromise
- **7–8:** good fit, minor trade-offs
- **4–6:** usable, meaningful mismatch
- **0–3:** conflicts with project goals

### Stability

Assess how responsibly changes and breaking changes are managed: versioning discipline, compatibility policy, migration guidance, changelogs/releases, deprecations, breaking-change frequency/magnitude, and how major changes are explained and managed.

Volatility is acceptable when controlled, documented, and justified.

### Popularity

Adoption is a signal, not proof of quality. **>1,000 GitHub stars is preferred but optional**; low stars should not heavily penalize an otherwise exceptional candidate. Consider measurable real ecosystem usage.

### Transparency

Assess whether maintainers openly address problems through issue/PR discussions, security advisories, changelogs, postmortems/incidents, bug responses, and explanations for reversions, removals, or breaking changes.

Investigate suspicious gaps such as disappearing issue numbers, deleted references, unavailable problem reports, unexplained removals, or changes apparently erasing evidence of known problems. Do not infer intentional concealment merely because content is unavailable; report only verifiable evidence and label uncertainty.

Strong transparency means openly addressing problems, documenting decisions, and communicating limitations.

### Documentation

Assess whether the package can be discovered, understood, and used correctly: installation, quick start, API reference, configuration, common/advanced use cases, migrations/breaking changes, troubleshooting, environment constraints, and applicable examples.

Prefer accurate, navigable documentation over documentation that is merely large.

### Activity

Assess active, sustainable maintenance. Ideal signals include multiple meaningfully involved maintainers/contributors, maintenance within the last **6 months**, ongoing issue/PR activity, and continued releases.

Do not equate raw commit frequency with project health; mature stable projects may commit less often.

### Bundle Size / Client Footprint

Apply strongly to browser/client dependencies and lightly or not at all to server-only dependencies. Consider minified/compressed size, tree-shaking, entry points, transitive client dependencies, and whether the footprint is justified. Show measurable size data for client candidates.

## 8. Security

Security is always part of the evaluation and may override an otherwise strong result.

For security-sensitive candidates—especially sensitive data, networking, untrusted input, authentication, cryptography, or sandboxing—investigate vulnerabilities, advisories, affected versions, remediation status, dependency vulnerabilities, and security-response practices.

A known unresolved high-impact vulnerability should normally disqualify a candidate unless there is a compelling documented reason and mitigation.

“No known vulnerabilities found” does not mean “secure.”

## 9. Eliminate Dependency Bloat

Reject an external dependency when:

- the runtime already provides an adequate solution;
- an existing project dependency does;
- a genuinely small, well-tested local implementation is clearly sufficient;
- it adds substantial unrelated functionality without meaningful benefit;
- it duplicates existing capabilities;
- its maintenance/security cost is disproportionate.

However, never automatically prefer local code or fewer dependencies. A dependency may be justified when it replaces substantial implementation effort, mature algorithms, broad edge-case handling, ongoing maintenance, or specialized expertise.

Choose the best **total cost of ownership**.

## 10. Evidence

Collect enough evidence to support every score and major decision. Useful evidence includes:

- current version and release date;
- release cadence and breaking-change history;
- maintenance/contributor activity;
- adoption/stars;
- issue/PR handling;
- security history;
- documentation coverage;
- bundle-size measurements;
- dependency/transitive footprint;
- target-environment compatibility;
- estimated local implementation complexity.

Record important dates explicitly.

When information is unavailable, write **Unknown** rather than guessing. When sources disagree, report the discrepancy and prefer the most authoritative/current source.

## 11. Research Workflow

For each independent task:

1. understand requirements and constraints;
2. inventory existing solutions across runtime, project, dependencies, workspace, and ecosystem;
3. estimate local implementation complexity and long-term ownership;
4. identify relevant solution categories;
5. discover a broad candidate set;
6. eliminate clearly incompatible or abandoned candidates;
7. verify serious external candidates through primary sources;
8. evaluate fit, stability, transparency, activity, documentation, adoption, security, and footprint;
9. measure client bundle impact when applicable;
10. compare local versus external total engineering cost;
11. score every viable external candidate;
12. recommend the strongest option while preserving credible alternatives.

## 12. Final Response

Use this structure.

### Existing Solution

State whether the requirement already exists in the runtime, project, workspace, installed dependencies, or ecosystem. Distinguish existing implementations, reusable primitives, local-from-scratch options, and mature external solutions.

If an adequate existing solution exists, identify it, explain why it is sufficient, recommend it, and stop unless comparison is specifically useful.

### Tasks

List the independent tasks discovered.

### Solution Approaches

For each task, show applicable:

- existing/local;
- reuse;
- extension;
- external dependency;
- custom implementation.

Explain major trade-offs before selecting a winner.

### Candidates by Task

Show relevant external candidates and their major trade-offs for each task.

### Scorecard

Give every viable external candidate a justified **0–10 score for every applicable criterion**:

| Candidate | Alignment | Stability | Popularity | Transparency | Documentation | Activity | Bundle Size* | Notes |
| --------- | --------: | --------: | ---------: | -----------: | ------------: | -------: | -----------: | ----- |

Use `N/A` when bundle size is irrelevant. An overall score may be used only as a secondary aid, never instead of individual scores and justifications.

### Default Weights

**Server**

- Alignment 25%
- Stability 20%
- Transparency 15%
- Documentation 15%
- Activity 15%
- Popularity 10%
- Bundle Size N/A

**Web / Client**

- Alignment 20%
- Stability 20%
- Bundle Size 20%
- Transparency 15%
- Documentation 10%
- Activity 10%
- Popularity 5%

Adjust weights when the project explicitly prioritizes something else and explain the change.

### Recommendation

State:

- strongest solution overall;
- why it fits best;
- local or external ownership;
- main downside;
- strongest alternative;
- when that alternative is preferable;
- why the chosen ownership model has the better total engineering trade-off.

### User Choice

Show all strong viable alternatives. Do not hide them because one is preferred.

## Rules

- Check existing solutions before creating/adopting anything new.
- “Existing solution first” **does not mean “local implementation first.”**
- Never assume a dependency is necessary or local implementation preferable.
- Decompose materially different work and evaluate tasks independently.
- Estimate local complexity and long-term ownership before choosing.
- Research multiple solution categories and candidates.
- Evaluate actual project fit, not generic package quality.
- Compare total engineering/maintenance cost, not dependency count.
- Evaluate complex, mature, specialized functionality seriously instead of reflexively reimplementing it.
- For clients, bundle size is a major criterion and must be shown when measurable.
- For servers, broader coherent functionality is a positive secondary factor when its cost is reasonable.
- > 1k stars is preferred, never mandatory.
- Stability means controlled, documented change—not simply age.
- Investigate transparency, including suspicious missing/deleted issue evidence where relevant, without inventing intent.
- Prefer primary sources for important claims.
- Explicitly state unknowns and discrepancies.
- Every score requires justification.
- Security can override an otherwise strong result.
- Give the user all strong options, not only the favorite.
- Never recommend a new dependency when an adequate existing solution already exists.
- Never recommend local implementation solely because no dependency is strictly required.
- Choose the solution with the best overall engineering trade-off.
