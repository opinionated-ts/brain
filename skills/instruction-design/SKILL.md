---
name: instruction-design
description: "Design, write, review, and restructure AI-facing instructions with explicit state, decision boundaries, validation, escalation, and deterministic execution. This skill covers skills, prompts, system prompts, AGENTS.md, CLAUDE.md, operational playbooks, structured procedures, branching workflows, and troubleshooting flows. It is optimized for execution reliability, progressive disclosure, and unambiguous decision-making."
---

# Instruction Design v2

Instructions for an AI are not normal documentation. They are executable decision systems. The goal is not to write prose that is merely readable; it is to reduce the number of inferences the agent must make from missing context.

This skill replaces the loose heuristic model with a more explicit operating model: every step must define state, action, success condition, branching, and return point.

## Execution model

Treat an instruction set as a graph of decisions and actions.

For every step, the agent should be able to determine:

1. the required preconditions;
2. the action to perform;
3. the authoritative inputs;
4. the success condition;
5. the postconditions after success;
6. the branch or stop condition if the result differs;
7. where execution continues or terminates.

If a step does not make these explicit, it is not deterministic enough.

## 1. Determinism is both linguistic and operational

Determinism has two dimensions:

- Linguistic determinism: the wording has one intended interpretation.
- Operational determinism: the same project state leads to the same action when the instruction is executed.

A sentence can be precise but still nondeterministic in practice. Examples:

- "Choose the best candidate."
- "Use the latest version."
- "Pick the most relevant file."
- "Fix the issue."
- "Use an available tool."

These are not executable rules until the selection criteria are explicitly defined.

### Tie-breaking rules

Whenever the instruction uses terms such as best, first, preferred, relevant, matching, available, latest, nearest, primary, or similar, define the ranking rule or tie-breaker.

**Anti-pattern:** unspecified tie-breaking.

**Rule:** if multiple candidates match, identify the ranking in order, for example:

1. exact filename match;
2. same directory;
3. nearest parent directory;
4. lexical path order;
5. explicit user preference when supplied;
6. otherwise stop and report the ambiguity.

Never allow the agent to silently choose by convenience or first-seen order.

## 2. Define state boundaries

For any consequential step, define the state contract:

- Preconditions: what must already be true.
- Action: what the agent does.
- Postconditions: what becomes true if successful.
- Invariants: what must not change.
- Idempotency: whether repeating the step is safe.

Use all five when the step mutates files, dependencies, infrastructure, configuration, repositories, or external systems. For trivial read-only steps, the minimum useful state check may be shorter.

### Example

```markdown
## Step 3: Generate the config

**Preconditions:** the schema file exists and the project root is known.
**Action:** read `schema.json` and generate `config.generated.json` from it.
**Postconditions:** the generated file exists and contains valid JSON.
**Invariant:** the source schema file remains unchanged.
**Idempotency:** rerunning this step overwrites the generated file with the same content, which is safe.
```

## 3. Source of truth and normalization

When a step depends on project information, the authoritative source must be explicit.

### Source of truth

Prefer the most authoritative source in this order:

1. explicit project file;
2. explicit configuration field;
3. command output from the current environment;
4. user-provided input;
5. external source, only when explicitly required.

Do not leave it to the agent to infer which source is authoritative when multiple sources may disagree.

If two sources disagree, the instructions must say which one wins or instruct the agent to stop and report the conflict.

### Normalize inputs before branching

When equivalent inputs can appear in different representations, normalize them before making decisions.

Examples:

- uppercase vs. lowercase;
- `./path` vs `path`;
- trailing slashes in URLs;
- empty string vs. null;
- singular vs. plural values;
- aliases and synonyms.

**Rule:** normalize first, then branch on the canonical representation.

### Tool capability constraints

When tool choice is intentionally open, specify the minimum capabilities the selected tool must support.

Example:

- must issue authenticated GET requests;
- must preserve headers;
- must expose response status and body;
- must run from the project environment.

A rule such as "use any HTTP tool available" is not operationally deterministic unless the required capabilities are named.

## 4. Instruction precedence and hidden defaults

When multiple instructions can define behavior, the real precedence model must be respected.

The common hierarchy is:

1. platform- or environment-level constraints;
2. system instructions;
3. developer instructions;
4. repository instructions;
5. skill instructions;
6. task-specific instructions;
7. runtime outputs or generated state.

Do not resolve conflicts by whichever instruction is later, more specific, or more verbose. If the platform defines precedence differently, follow the platform model and reference it instead of re-defining it.

### Hidden defaults

Do not rely on unstated defaults for:

- working directories;
- package managers;
- shell type;
- OS behavior;
- credentials;
- file encodings;
- time zones;
- network access;
- versions;
- output formats;
- environment assumptions.

When a default is intentionally relied upon, state it explicitly.

### Environment assumptions

For every required command or operation, ensure the execution environment is either explicitly defined or determined from project configuration.

Do not assume a shell, OS, package manager, binary availability, or working directory unless the target environment guarantees it.

### Artifact contract

When an instruction creates or modifies an artifact, define the required postcondition:

- location;
- format;
- required content;
- prohibited content;
- overwrite behavior;
- naming and encoding rules.

This is especially important for generated files, JSON/YAML, reports, code generation, documentation, and configuration output.

## 5. Decision types must be explicit

Represent each decision in one explicit form.

- Binary: if X, do A; otherwise do B.
- Multi-way: if X, do A; if Y, do B; otherwise do C.
- Priority: evaluate A, then B, then C; select the first match.
- Fallback: try A; if condition X occurs, use B.
- Loop: repeat while condition X remains true; stop when Y occurs.
- Approval: stop and request human approval when X occurs.
- Delegation: hand off to another agent or tool with a defined contract.
- Termination: stop execution when a terminal condition is reached.

### Preserve resolved decisions

Once the trunk resolves a decision, downstream references must consume that decision rather than re-deriving it.

Do not ask the agent to rediscover the same fact from another source unless the state may legitimately have changed.

### Branch completeness

For every decision:

- Mutual exclusivity: at most one branch should match, unless priority is explicitly defined.
- Exhaustiveness: every valid state should map to a branch or an explicit stop/escalation condition.

If multiple branches can match, define the priority or make the branches mutually exclusive.

### Scope boundaries

At the top of a branch or reference file, define what it covers and what it does not cover.

```markdown
## Scope

This file covers only the PostgreSQL-specific configuration steps.
It does not cover backup, restore, or migration procedures; those remain in the main instructions or a separate reference.
```

This reduces accidental duplication and cross-branch leakage.

## 6. Keep the trunk small, but split only when needed

Use a small happy-path trunk and defer the rest.

The main document should contain the common execution path: what must happen in the normal case, what success looks like, and where to go if a material variant applies.

### Separate materially different execution paths

Split a document into a branch file only when at least one of these is true:

- the branch has materially different actions;
- the branch has materially different validation;
- the branch has enough detail to obscure the trunk;
- the branch has an independent maintenance cadence;
- the branch introduces a different model, tool, or environment.

Do not split when:

- only a few commands differ;
- the differences can be expressed in one deterministic condition;
- splitting would create more navigation cost than context savings.

### Reference depth and navigation cost

Progressive disclosure should reduce irrelevant context without creating a navigation maze.

Prefer:

- shallow link chains;
- direct next-decision links;
- branch files that capture the full procedure for their scope.

Avoid forcing an agent to traverse `SKILL.md → branch.md → sub-branch.md → troubleshooting.md` before the first actionable step.

## 7. Link contracts and return points

Every branch or reference link should answer four questions:

1. When should this file be read?
2. Why is it relevant?
3. What does it contain?
4. Where does execution resume after reading it?

### Example

```markdown
If the target uses PostgreSQL, read `references/postgresql.md` for the database-specific setup steps. Continue from Step 5 in `SKILL.md` after completing that file.
```

Branch files should also end with a clear return condition:

```markdown
## Return

Continue from Step 6 in `SKILL.md`.
```

or

```markdown
## Completion

This branch completes the task. No steps remain in the trunk.
```

## 8. Failure model and escalation

Failure must be classified into one of these categories.

1. Expected result requiring corrective work
   - The tool completed normally but reported defects that the task explicitly expects the agent to fix.
   - Continue with the documented correction flow.

2. Known failure
   - The current instructions define the symptom and the recovery.
   - Follow that recovery.

3. Self-explanatory failure
   - The output explicitly identifies the cause and the current instructions authorize the corresponding correction.
   - Apply the correction without entering troubleshooting.

4. Unknown or ambiguous failure
   - The cause cannot be established from the current instructions and observable evidence.
   - Stop speculative recovery and read the linked troubleshooting or escalation document.

5. Fatal / escalation condition
   - The procedure explicitly forbids automatic recovery.
   - Stop and report or request approval.

### Global troubleshooting trigger

Use a deterministic trigger, not a judgment call such as "if it is unclear enough":

```markdown
If a step produces a documented failure class, follow its documented recovery.
If the step produces a self-explanatory error and the instructions authorize the corresponding correction, apply it.
Otherwise, stop and read `references/troubleshooting.md`.
```

This is more reliable than asking the agent to decide whether an error is "clear enough".

### Troubleshooting model

Troubleshooting files should follow this flow:

`Symptom → diagnostic check → cause → recovery → return`

Each troubleshooting entry should define:

- the observable symptom;
- the prerequisite state or tooling required for the check;
- the exact diagnostic command or inspection;
- the identified cause;
- the recovery steps;
- the return point.

### Escalation payload

When automatic execution must stop, report:

- the step being executed;
- the exact observed error or output;
- relevant input or state;
- what checks were already performed;
- why the available instructions do not determine a safe next action.

## 9. Validation is layered

Use the smallest validation that proves the required property.

### Validation levels

1. Action validation: Did the command or action complete?
2. State validation: Is the expected state now true?
3. Semantic validation: Does the result actually satisfy the task requirement?
4. Final validation: Does the entire task satisfy its acceptance criteria?

Examples:

- `git commit` exits successfully = action validation.
- the commit exists = state validation.
- the commit contains the intended changes = semantic validation.
- repository checks pass = final validation.

### Negative validation

When correctness depends on an unwanted state not existing, validate absence explicitly.

Examples:

- no secrets committed;
- no unrelated files changed;
- no forbidden dependency added;
- no production resource modified;
- no stale generated file remains.

## 10. Make side effects and approval gates explicit

For mutating operations, state the following:

- what will change;
- what will not change;
- whether the action is reversible;
- whether approval is required;
- whether repeated execution is safe.

### Approval gates

When an action is destructive, externally visible, costly, irreversible, or security-sensitive, define whether explicit human approval is required before execution.

Do not infer authorization from the presence of the step in the instructions.

## 11. Repeated execution, retries, and stale state

### Repeated execution

For steps that may be executed more than once, define one of:

- idempotent: repeating the step produces the same final state;
- guarded: check state before mutating;
- one-time: stop if already completed;
- retryable: safe to repeat after a failed attempt.

Never leave repeated execution behavior implicit for consequential actions.

### Retry rules

When retrying an action, define:

- the exact condition that permits retry;
- the maximum number of retries;
- what changes between attempts;
- the condition that ends the loop;
- what happens when retries are exhausted.

Never imply "retry until it works" without a bounded rule.

### Loop determinism

Every loop must define:

- the initial state;
- the repeat condition;
- the action in each iteration;
- the state change between iterations;
- the termination condition;
- the maximum iteration count when termination cannot be guaranteed.

### State freshness and concurrency

When a step depends on mutable external state, define when that state must be refreshed.

If another process may modify the same resource concurrently, specify the required consistency check before applying mutations.

Example:

```markdown
Re-read the file after generation before applying a patch; do not rely on an earlier snapshot.
```

## 12. Rationale, normative language, and examples

### Rationale

Include rationale only when it prevents a predictable mistake or explains a non-obvious constraint.

Keep rationale separate from the executable instruction when possible. Do not let rationale introduce additional requirements that are not expressed in the rule itself.

### Normative strength

Use a consistent normative model:

- MUST / MUST NOT: mandatory requirement.
- SHOULD / SHOULD NOT: default expectation unless a documented reason justifies deviation.
- MAY: optional or allowed.
- EXAMPLE: illustrative only, not normative.

### Example boundaries

Examples are never policy by default. Mark them clearly and keep them distinct from mandatory instructions.

## 13. Authoring procedure

Follow this sequence when creating or restructuring any instruction set.

1. Identify the task and the real success condition.
2. Define the trunk: the common successful path.
3. Define the state model: preconditions, postconditions, invariants, idempotency.
4. Identify all authoritative inputs and sources of truth.
5. Normalize input representations before branching.
6. Enumerate the decision points and define one explicit decision form for each.
7. Identify branches and split only materially different flows.
8. Define exactly when each branch or troubleshooting document is read.
9. Add validation at the correct layer.
10. Add recovery, retry, and escalation semantics only where they are required.
11. Define approval gates for high-impact actions.
12. Define the return point from every branch and recovery path.
13. Run the review pass and test the instruction set against ambiguous cases.

## 14. Review pass and test methodology

Read the draft back as an agent executing the normal path and test the following.

### Test 1: happy path

Can an agent execute the task from start to finish without inventing steps?

### Test 2: boundary cases

Test missing input, empty input, invalid input, duplicate input, already-completed state, and partially-completed state.

### Test 3: branch coverage

For every branch:

- does exactly one branch match;
- can zero branches match;
- can multiple branches match;
- is the priority explicit if multiple matches are possible?

### Test 4: failure coverage

For each consequential action:

- what is the expected failure;
- what is the known failure;
- what is the unknown failure;
- where does execution go next?

### Test 5: stop behavior

Can the agent know when it must stop instead of continuing?

### Test 6: restart behavior

If the agent stops after step N and resumes later, is the correct next action obvious?

### Test 7: adversarial interpretation

Interpret ambiguous words in the most plausible alternative way and check whether the procedure still yields the same action.

### Test 8: unnecessary-context test

For each reference document, ask: could the agent complete the normal path without reading this file?

If yes, the document is probably too broad or not effectively progressive.

## 15. Anti-patterns to avoid

- giant instruction files containing normal flow, every edge case, every alternate path, and all troubleshooting;
- premature troubleshooting before the agent attempts the happy path;
- unspecified branching or decision conditions;
- hidden assumptions about environment, path, shell, or package manager;
- arbitrary tool mandates when a capability-based rule would be clearer;
- conditional links without a clear trigger;
- self-triggering reference docs;
- duplicate knowledge spread across files without a defined source of truth;
- silent conflict resolution between competing sources;
- retry loops without retries counts or stop conditions;
- validation that checks only that an action ran, not whether the target state is correct;
- decisions that leave the agent to guess the tie-breaker.

## 16. Output format and examples

Use this skill whenever you need to create, review, or restructure any of the following:

- skills, prompts, system prompts, AGENTS.md, CLAUDE.md, and workflow docs;
- AI-facing operational playbooks;
- setup guides with environment-specific branches;
- procedures with meaningful error handling;
- instruction sets that have become tangled or nondeterministic.

The standard structure is:

```text
[Main action step]

→ If this step might fail and guidance is needed, see [reference-file] for [specific problem family].

[Next main action step]

→ If [specific condition], read [conditional-file] for [specific scenario].
```

### Example: repository setup

```markdown
Install the project dependencies from the repository root.

→ If the install fails due to a package resolution error, read `references/troubleshooting.md` and continue from the same step after the recovery.

Create the environment file from the template if it is missing.

→ If the project is configured for PostgreSQL, read `references/postgresql.md` and continue from Step 3 in this file.
```

### Example: dependency selection

```markdown
Select the implementation by the following ranked criteria:

1. exact package name match;
2. same ecosystem;
3. same project constraints;
4. lexical name order.

If no candidate satisfies the constraints, stop and report the conflict.
```

### Example: approval gate

```markdown
Before deleting the production database snapshot, request explicit approval from the operator. Do not proceed without a confirmation token.
```

### Example: loop determinism

```markdown
Repeat this check while the status is `pending` and the retry count is below 5.
On each retry, re-read the latest status from the source of truth.
Stop after 5 attempts or when the status is no longer `pending`.
```

The ideal result is an executable decision tree with progressive disclosure:

```text
                    START
                      │
               common path
                      │
          ┌───────────┴───────────┐
          │                       │
     normal result            conditional branch
          │                       │
       finish               read relevant branch
                               │
                         continue execution
```

The agent should never need to guess what the next correct state, action, or validation point is.
