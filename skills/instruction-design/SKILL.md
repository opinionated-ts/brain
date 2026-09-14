---
name: instruction-design
description: 'Design, write, review, or restructure instructions that an AI/LLM will execute — skills (SKILL.md), prompts, system prompts, agent instruction files (AGENTS.md, CLAUDE.md), rules, workflows, AI-facing documentation, tool instructions, and operational playbooks. Trigger whenever the user wants an AI to follow a procedure, or asks to draft, improve, or review instructions, prompts, skills, or rules — even when they don’t say "skill" or "prompt" explicitly (phrases like "instrucciones para el agente", "docs para la IA", "system prompt", "reglas para el bot", "quiero que la IA haga X paso a paso" all qualify). Apply this skill instead of generic prompt-writing advice: it encodes a specific philosophy — maximum determinism, non-blocking happy path with error handling deferred to separate files, and branch-based file structure.'
---

# Instruction Design

Instructions written for an AI are not read the way humans read documentation: the AI executes literally, doesn't skim, and can't ask a colleague when something is ambiguous. Every rule in this skill follows from that single fact.

## The one question that drives everything

Before writing anything, understand the task well enough to answer two questions:

- **What is the trunk?** — the single path that covers most invocations, assuming things work.
- **What are the branches?** — the different tools, formats, and conditions that split off it.

That split is the backbone of everything that follows.

## 1. Prefer determinism over interpretation

Write instructions as steps the agent can follow without judgment calls: what to check, in what order, what the exact output looks like. When two phrasings could both technically satisfy an instruction, prefer the one that admits only one way to comply.

Bad (interpretation required):

> Build the project using the configured build command.

Good (explicit):

> Read `config.json`. Use the `build` field as the command to execute, and run it from the repository root.

### Intentional flexibility is not ambiguity

Sometimes ambiguity is correct — not an oversight. The clearest case: several tools or resources could each satisfy a need and you don't want to hardcode one. There, name the _criteria_ the tool must meet, not a specific tool.

- **Rigid (wrong when you don't actually need one specific tool):** "Fetch the page with `curl`."
- **Deliberately open (right when any HTTP client works):** "Fetch the page with whatever HTTP tool is available that can issue GET requests."

**Rule of thumb:** if you can picture a concrete right answer, write it down explicitly. If you genuinely don't care which of several valid options gets picked, say so explicitly too — "any of X, Y, or Z" is still deterministic; it simply names an equivalence class. What is never acceptable is silence that reads as ambiguity by accident: it forces the agent to guess, and different runs will guess differently.

## 2. Design around the primary execution path

Optimize for the path the agent follows most of the time. The main document holds the central path — start, inspect, decide, act, validate, finish — and nothing else.

Before keeping a paragraph in the main instructions, ask: _is this required for the agent to complete the common path?_ The main path contains required context, required decisions, required actions, required validation, and links to relevant branches — not every piece of knowledge related to the task.

Do not place every exception, edge case, implementation variant, or troubleshooting scenario inside that path. The agent should be able to complete the common task without reading information that is irrelevant to it.

## 3. Defer recovery and conditional knowledge

Write the trunk _assuming success_ — the tool exists, the file is there, the API responds, the dependency is installed. Add **one global notice** at the top of the trunk (or of each section/path that needs it), and never repeat it per command:

> **If anything below fails with an error that isn't clear enough to be sure of the cause, or you need more detail about the error**, read `references/troubleshooting.md`.

After that notice, write the steps freely and ignore it — the notice alone covers every command below it, so the steps never mention fixes, solutions, or recovery. If a command fails, the agent already knows to read the troubleshooting file instead of improvising a fix from the error text.

The troubleshooting file holds **one entry per problem** (see `references/troubleshooting.md` for the structure). The trunk carries only the trigger condition at the point where it's first relevant; all problem details live in the linked file.

**Inline exception:** if a problem can be explained shorter than the link that would defer it, explain it inline instead. General rule: **never create a reference file for a decision that fits in one line of the trunk** — a link is only worth it when it defers more content than it costs.

The same principle generalizes beyond errors: **anything that is a conditional possibility rather than the normal case** — an optional mode, a rare input shape, an edge case that applies "if X" — does not belong inline in the trunk. It goes in its own file, referenced only where it becomes relevant.

See `references/error-appendix-pattern.md` for a worked example of this deferral.

## 4. One file per branch

If the instructions cover more than one materially different path, do not write one long file interleaving all of them with conditionals. Split by branch, physically, into separate files, and link between them at the exact point where the paths diverge.

- Keep shared steps before and after the fork in the trunk; never duplicate them inside branch files.
- At the divergence point, write the condition and the link together: "If the target is AWS, read `references/aws.md`. If it's GCP, read `references/gcp.md`."
- Folder shape is flexible (flat `references/`, nested by domain); what's non-negotiable is that the trunk stays free of branch-specific detail and every branch file is reachable from exactly one clear link.
- A small fork inside an already-scoped branch file is fine — split into a new file only when the divergence produces a genuinely different set of steps.

See `references/branching-structure.md` for a worked example.

## 5. Write operational language

Prefer verbs that describe observable actions: read, inspect, determine, select, run, create, update, verify, compare, continue, stop.

Avoid instructions whose operational meaning depends on interpretation: "handle appropriately", "use your judgment", "do what is necessary", "make sure everything works", "fix as needed". Use them only when the intended judgment itself is part of the task.

State the _why_ of a non-obvious rule in one clause rather than relying on bare MUST/NEVER — an agent that understands the reason generalizes better to cases you didn't anticipate.

## 6. Define decision boundaries and stopping conditions

- **Decisions:** whenever an instruction contains a decision, make the condition explicit. Prefer "If X is true, do A. Otherwise, do B." over "Depending on the situation, choose A or B."
- **Stopping conditions:** the agent must know when the task is complete. State what confirms success, when execution stops, when validation is required, and when it should enter a troubleshooting branch.

> The task is complete when the generated file exists and the validation command exits successfully.

## 7. Validate the result, not just the action

Wherever practical, include a verification step: `action → validation`, not `action → assume success`.

Validation must be explicit and observable — a command exits successfully, an expected file exists, an expected field has the expected value, generated output matches the required structure, a test suite passes.

## 8. Handle failures with the smallest structure that works

Not every failure needs its own branch. See section 3 for when recovery gets deferred to a linked file; this section covers the structure of the failure handling itself.

- **Known failure classes** get explicit recovery: if A → recover with procedure A; if B → recover with procedure B; otherwise → read the troubleshooting document.
- **Poorly understood failures:** "If the result cannot be explained from the current instructions, stop making assumptions and read `troubleshooting.md`." Never encourage speculative recovery when the available information is insufficient.

**Troubleshooting documents should be diagnostic**, not lists of random fixes: symptom → diagnostic check → identified cause → recovery → return to main path. Each entry needs a diagnostic check that separates the causes of the same symptom (see `references/troubleshooting.md` for the template and rules).

## 9. Keep the main path small

When multiple paths share information, define the shared rule once and reference it; duplicated instructions drift.

If the instructions are short and single-path, sections 3 and 4 may simply not apply — don't force a branch split or an error appendix where there is nothing to split or defer. The philosophy exists to keep genuinely complex instructions navigable; it isn't a checklist to pad a simple one.

---

## Authoring procedure

Follow this sequence when creating or restructuring instructions.

1. **Identify the task** — determine exactly what the agent must accomplish.
2. **Define the successful path** — write only the sequence required for the common successful execution.
3. **Resolve ambiguity** — for every step, state what is done, what input it uses, what output is expected, and what determines the next step, unless flexibility is intentional.
4. **Identify intentional choices** — where multiple implementations are valid, replace arbitrary tool selection with explicit selection criteria.
5. **Identify branches** — find every condition that materially changes the path; move substantial branches into separate documents (section 4).
6. **Identify conditional knowledge** — move information that is useful only under specific circumstances into a document that states exactly when it must be read (section 3).
7. **Add recovery gates** — for dependencies, tools, files, or assumptions that may be unavailable, add a short instruction covering what failure looks like, when to read the recovery document, and where it lives. Do not preload the recovery content (section 3).
8. **Add validation** — define how the agent knows the current step and the whole task succeeded (section 7).
9. **Run the review pass** — for every paragraph ask "would the agent need this if nothing unusual happened?" (section 2) and move out anything that fails the test, then check every section of this skill against the draft (see the review pass below).

---

## Review pass before you're done

Read the draft back as an agent executing the normal path, and check each rule of this skill against it — section by section:

1. **Determinism** (section 1) — find every place a step could be read two ways. Is the ambiguity intentional (tool-agnostic by design)? If not, make it explicit.
2. **Flow** (sections 2–3) — find every step that assumes something might not hold. Confirm the trunk states the assumption plainly and defers the "what if not" to a linked file, rather than handling it inline.
3. **Structure** (section 4) — find every point where the task could fork. Confirm each fork is a link to a separate file, not an inline conditional block, and that the trunk doesn't carry branch-specific detail past the point where it should have handed off.
4. **Failure handling** (sections 3 and 8) — broken assumptions don't block the common path; failure states have a clear recovery entry point; unknown failures don't encourage guessing.
5. **Context efficiency** (sections 2 and 9) — every section in the main path is required for normal execution; additional documents are read only when relevant.

Sections that don't apply to a short, single-path instruction set are fine — the review is only about whether the sections that _do_ apply were followed.

---

## Anti-patterns

Avoid these unless there is a specific reason to use them:

- **Giant instruction files** — one document containing the normal path, every alternative, every edge case, and all troubleshooting.
- **Premature troubleshooting** — forcing the agent to read failure documentation before attempting the normal path.
- **Unspecified branching** — "depending on the situation" without defining the conditions.
- **Arbitrary tool mandates** — requiring one tool when the actual requirement is a capability several tools satisfy.
- **Hidden assumptions** — relying on the agent to infer dependencies, file locations, ordering, or decision criteria.
- **Conditional links without conditions** — pointing to documents without stating when they apply.
- **Branches embedded in prose** — combining execution paths into long paragraphs instead of making the decision structure explicit.
- **Redundant knowledge** — repeating the same rule across files instead of defining it once and referencing it.

---

## Output format and when to use it

Use this skill whenever you need to create, write, review, or restructure any of these:

- instructions for AI agents that must work reliably
- skills, prompts, system prompts, AGENTS.md / CLAUDE.md, rules, or workflows
- setup guides and operational playbooks across environments
- procedures where error handling matters but shouldn't obstruct the main flow
- instruction sets that have grown tangled

Instructions follow this shape:

```
[Main action step]

→ If this step might fail and you need guidance, see [reference-file] for troubleshooting.

[Next main action step]

→ If [specific condition], read [conditional-file] for [specific scenario].
```

**Example — database setup:**

```
Install PostgreSQL.

→ If installation fails, see references/troubleshooting/postgres-install.md for common issues.

Create the schema by reading `schema.sql` and running it against the database.

→ If you're using MySQL instead, read references/alternative-tools/mysql-setup.md for the equivalent steps.
```

Note the difference between a capability and a tool: "Create the schema" describes the outcome, but the deterministic version names the exact file and command. Prefer the explicit version whenever you can picture the concrete right answer (section 1).

The ideal result behaves like an executable decision tree with progressive disclosure:

```text
                    START
                      │
                common path
                      │
             ┌────────┴────────┐
             │                 │
        normal result      condition occurs
             │                 │
           finish        read relevant branch
                               │
                         continue execution
```

The agent reads the minimum information required to make the next correct decision.
