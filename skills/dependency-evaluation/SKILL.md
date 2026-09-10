---
name: dependency-evaluation
description: Determine whether an external dependency is necessary and, when it is, identify and compare viable candidates based on existing solutions, project fit, stability, transparency, documentation, activity, adoption, security, and context-specific footprint.
---

# Dependency Evaluation

Use this skill whenever a task may require a library, package, framework, plugin, utility, or other external dependency.

> First find out whether the problem is already solved. Add a dependency only when its value clearly outweighs its engineering and maintenance cost.

Never assume a dependency is necessary before researching what already exists.

## 1. Understand the Requirement

Determine:

- execution context: server, web/client, CLI, build, test, library, or mixed;
- required behavior, constraints, scale, compatibility, and security sensitivity;
- performance sensitivity;
- whether the functionality is one-off or likely to recur.

Do not evaluate solutions against an unclear problem.

## 2. Find an Existing Solution First

Search in this order:

1. language/platform/runtime APIs;
2. current project code;
3. local utilities/helpers;
4. internal abstractions/services;
5. installed dependencies;
6. another package in the workspace/monorepo;
7. previously used solutions elsewhere in the repository;
8. existing framework/toolchain conventions or utilities;
9. only then, new external dependencies.

A solution does not need to be a dedicated package. A small, proven local helper may be preferable to adding one.

If an existing solution adequately solves the requirement, use it and stop. Do not replace it simply because a package exists.

## 3. Decompose the Work

When the requirement contains multiple materially different tasks, split them into independent tasks before researching dependencies.

Examples: parsing, validation, serialization, caching, filesystem access, process execution, formatting, networking.

Evaluate each task independently: a package that is excellent for one task is not automatically the best for another.

Afterward, check whether one candidate can coherently cover multiple tasks without unnecessary complexity or unacceptable trade-offs.

## 4. Research Before Deciding

For every task without an adequate existing solution, research the ecosystem first.

Search broadly enough to identify the largest practical set of relevant candidates, not just the first package found.

For each candidate, verify as much as possible through primary sources:

- official repository;
- official documentation;
- package registry/metadata;
- changelog and releases;
- issues and pull requests;
- maintainer/governance information;
- security advisories;
- bundle-size data when relevant.

Use secondary sources for discovery, then verify important claims with primary sources.

Do not conclude that no dependency is needed merely because no package is immediately known.

## 5. Project Alignment

Evaluate each candidate against the actual project's philosophy, stack, architecture, and constraints.

Consider:

- modernity and maintenance standards;
- runtime compatibility;
- TypeScript/type-safety quality;
- performance;
- security;
- API ergonomics/design;
- module format and tree-shaking;
- browser/server compatibility;
- dependency footprint;
- licensing/distribution constraints;
- project conventions.

Also evaluate architectural fit where relevant. For example:

- a public library with a deliberately small API → penalize candidates whose types/abstractions would leak into the public API;
- plugin-oriented architecture → favor composable primitives over candidates that take control of the lifecycle;
- explicit error-handling conventions → favor compatible error models rather than forcing a different flow;
- dependency-injection architecture → penalize hidden global state/process-wide singletons that hurt composition or testing;
- deliberate ownership of abstractions → favor solutions that do not create another permanent architectural boundary.

These examples illustrate alignment; they are not mandatory criteria. Actual project constraints take precedence.

Always explain **how well each candidate aligns and why**.

## 6. Context-Specific Preference

### Server

Prefer broader, coherent functionality when:

- related capabilities may be useful later;
- the extra surface does not create disproportionate maintenance, security, or performance cost;
- it can avoid multiple overlapping dependencies.

Future usefulness is secondary and cannot rescue a poor candidate.

### Web / Client

Prefer the smallest dependency that adequately solves the task.

Bundle impact is important. Evaluate:

- minified size;
- compressed size when available;
- browser-specific entry points;
- tree-shakability;
- whether unused functionality can actually be removed;
- transitive dependencies;
- client suitability.

Always show package-size information when trustworthy data exists. Useful sources include Bundlephobia and published package/build metadata. State the source, version, and measurement context when possible.

Do not use raw install size as a substitute for client bundle impact.

## 7. Candidate Scorecard

Every viable candidate gets a **0–10 score for each applicable criterion**, with evidence-based justification.

### Alignment

Fit with the project's philosophy, stack, architecture, and constraints.

- 9–10: natural fit, little/no compromise
- 7–8: good fit, minor trade-offs
- 4–6: usable, meaningful mismatch
- 0–3: conflicts with project goals

### Stability

How responsibly the project manages change and breaking changes.

Consider:

- versioning discipline;
- compatibility policy;
- migration guides;
- changelogs/release notes;
- deprecations;
- frequency/magnitude of breaking changes;
- explanation and management of major changes.

Volatility is acceptable when it is controlled, documented, and justified.

### Popularity

Treat adoption as a signal, not proof of quality.

**>1,000 GitHub stars is preferred but optional.** Low stars should not heavily penalize a candidate when every other criterion is exceptionally strong.

Consider real ecosystem usage where measurable; stars alone can mislead.

### Transparency

Determine whether maintainers confront problems openly.

Inspect:

- issue/PR discussions;
- security advisories;
- changelogs;
- postmortems/incidents;
- maintainer responses to serious bugs;
- explanations for reversions, removals, or breaking changes.

Investigate suspicious gaps such as:

- disappearing issue numbers;
- references to deleted discussions/issues;
- PRs referring to unavailable problem reports;
- unexplained removals;
- changes that appear to erase evidence of known problems.

Do not infer intentional concealment merely because content is unavailable. Report only verifiable evidence and label uncertainty.

Strong transparency means a pattern of openly addressing problems, documenting decisions, and communicating limitations.

### Documentation

Evaluate how easily the package can be discovered, understood, and used correctly.

Where applicable, check:

- installation;
- quick start;
- API reference;
- configuration;
- common/advanced use cases;
- migration/breaking changes;
- troubleshooting;
- runtime/environment constraints;
- examples.

Prefer navigable, accurate documentation over documentation that is merely large.

### Activity

Evaluate active and sustainable maintenance.

Ideal signals:

- more than one meaningfully involved maintainer/contributor;
- maintenance activity within the last **6 months**;
- ongoing issue/PR activity;
- releases showing continued maintenance.

Do not equate raw commit frequency with health; mature stable projects may commit less often.

### Bundle Size / Client Footprint

Strongly apply to browser/client dependencies and lightly or not at all to server-only dependencies.

Consider:

- minified/compressed size;
- tree-shaking;
- entry points;
- transitive client dependencies;
- whether the footprint is justified.

Always show measurable size data for client candidates.

## 8. Security

Security is always part of the evaluation and can override an otherwise strong result.

For security-sensitive candidates—such as those handling sensitive data, networking, untrusted input, authentication, cryptography, or sandboxing—investigate:

- known vulnerabilities;
- advisories;
- affected versions;
- remediation status;
- dependency vulnerabilities;
- security-response practices.

A known unresolved high-impact vulnerability should normally disqualify a candidate unless there is a compelling documented reason and mitigation.

“No known vulnerabilities found” does not mean “secure.”

## 9. Dependency Bloat

Reject a dependency when:

- the runtime already provides an adequate solution;
- an existing project dependency already does;
- a small, well-tested local helper is clearly sufficient;
- it adds substantial unrelated functionality without meaningful benefit;
- it duplicates existing capabilities;
- its maintenance/security cost is disproportionate to the task.

Do not automatically prefer fewer dependencies. Choose the best total engineering trade-off.

## 10. Evidence

Collect enough evidence to support every score.

Useful evidence includes:

- current version and release date;
- release cadence;
- breaking-change history;
- maintenance/contributor activity;
- adoption/stars;
- issue/PR handling;
- security history;
- documentation coverage;
- bundle-size measurements;
- dependency/transitive footprint;
- target-environment compatibility.

Record important dates explicitly.

When information is unavailable, write **Unknown** rather than guessing.

When sources disagree, report the discrepancy and prefer the most authoritative/current source.

## 11. Research Strategy

For each independent task:

1. identify relevant solution categories/approaches;
2. discover a broad candidate set;
3. eliminate clearly incompatible or abandoned candidates;
4. verify remaining candidates through primary sources;
5. inspect stability, transparency, activity, documentation, adoption, security, and footprint;
6. measure client bundle impact when applicable;
7. score every viable candidate;
8. recommend the strongest options while preserving credible alternatives.

Do not stop at the first popular package and do not search only by package name; search by the underlying task and its constraints.

## 12. Final Response

Use this structure:

### Existing Solution

State whether the functionality already exists in the runtime, project, workspace, dependencies, or ecosystem already in use.

If an adequate existing solution exists, identify it, explain why it is sufficient, recommend it, and stop unless comparison is specifically useful.

### Tasks

List the independent tasks discovered.

### Candidates by Task

Show relevant candidates and major trade-offs for each task.

### Scorecard

Give every viable candidate a justified 0–10 score for every applicable criterion.

Suggested table:

| Candidate | Alignment | Stability | Popularity | Transparency | Documentation | Activity | Bundle Size* | Notes |
| --------- | --------: | --------: | ---------: | -----------: | ------------: | -------: | -----------: | ----- |

`*` Especially important for web/client projects; use `N/A` when irrelevant.

An overall score may be used as a secondary aid, never instead of individual scores and justifications.

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

- strongest option;
- why it fits best;
- main downside;
- strongest alternative;
- when that alternative is preferable.

### User Choice

Show all strong viable alternatives. Do not hide them because one is preferred.

## Rules

- Check for an existing solution before any new dependency.
- Never assume a dependency is necessary before research.
- Decompose multi-part work and research tasks independently.
- Research multiple candidates before choosing.
- Evaluate actual project fit, not generic package quality.
- For clients, bundle size is a major criterion and must be shown when measurable.
- For servers, broader coherent functionality is a positive secondary factor when its cost is reasonable.
- 1k stars is preferred, never mandatory.
- Stability means controlled, documented change—not simply age.
- Investigate transparency seriously, including suspicious missing/deleted issue evidence where relevant, without inventing intent.
- Prefer primary sources for important claims.
- Explicitly state unknowns.
- Scores require justification.
- Security can override an otherwise strong result.
- Give the user all strong options, not only the favorite.
- Never recommend a new dependency when an adequate existing solution already exists.
