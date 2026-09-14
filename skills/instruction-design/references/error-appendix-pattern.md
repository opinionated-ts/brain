# Error appendix pattern: worked example

This is the full pattern referenced by section 3 of `SKILL.md`, worked through one example: a trunk step that depends on a dependency being installed.

## What NOT to do (blocking / front-loaded)

```markdown
## Step 3: Install and run the linter

Run `npx eslint .`. Note that this requires Node.js 18+; if you're on an
older version, upgrade first via nvm (`nvm install 18 && nvm use 18`), or
if nvm isn't installed, download Node directly from nodejs.org, or if the
project uses a different package manager the binary might be at
node_modules/.bin/eslint instead, and if eslint isn't installed at all
you'll need to run npm install first, and if npm install fails it might
be a registry auth issue, in which case check .npmrc for a token...
```

Every invocation pays the cost of reading all of this, even the 95% of runs where eslint is already installed and just works.

## What TO do (non-blocking / deferred)

**In the trunk file (`SKILL.md`)** — one global notice, placed once at the top of the trunk (or a section), never repeated:

```markdown
> **If anything below fails with an error that isn't clear enough to be sure
> of the cause, or you need more detail about the error**, read
> `references/troubleshooting.md` before attempting a fix.

## Step 3: Run the linter

1. Run `npx eslint .`.
2. Fix the reported warnings.

## Step 4: Type-check

1. Run `tsc --noEmit`.
2. Fix the reported type errors.

## Step 5: Run the tests

1. Run `npm test`.
```

The notice is written once and the steps below are written as plain commands — no `→ If it fails...` lines, no embedded fixes, no recovery notes. Every command in the section is covered by the single notice above it: if `eslint`, `tsc`, or `npm test` fails with an error that isn't self-explanatory, the agent already knows to read `references/troubleshooting.md` — no need to repeat the pointer after every command.

The trunk never enumerates the problems; the linked file does, one entry per problem (`eslint` errors, `tsc` errors, test failures...). Only if a single problem can be explained shorter than the link that would defer it, explain it inline instead (see the inline exception in SKILL.md section 3).

**In `references/troubleshooting.md`:**

```markdown
# Troubleshooting

Read this only when the global notice in SKILL.md triggered.

## "command not found: eslint"

...

## "Unsupported engine" / Node version errors

...

## Module resolution errors (cannot find module 'eslint-config-...')

...

## "error TS2307: Cannot find module ..."

...
```

## Why this split is correct

- The trunk still tells the agent exactly what to run and what success looks like — it isn't vague, it's just not padded with failure modes it doesn't need yet.
- The trigger condition is explicit and checkable, so the agent knows precisely when to break away — it's not left guessing whether a given error counts as "weird enough" to look something up.
- One notice covers multiple commands: the agent reads `references/troubleshooting.md` whenever any step below the notice fails with an unclear error, without the trunk repeating the pointer after every command.
- The instruction to _not_ freelance a fix from the raw error message is on purpose — it stops the agent from inventing a plausible-sounding but wrong diagnosis when a documented one exists one file away.
- Nothing here is optional flexibility (section 1 of SKILL.md) — the trunk step itself is still fully deterministic about what to run. What is deferred is only the recovery path, not the primary instruction.

## Generalizing the pattern

The same shape applies any time a trunk step rests on an assumption that could be false in a way the agent cannot fully diagnose from context alone:

- A referenced tool/binary might not be installed → point to a setup/requirements file.
- An API call assumes a specific response shape → point to a file documenting known error responses and what they mean.
- A step assumes credentials or config are already present → point to a file on how to detect and fix missing config.

In every case: the trunk states the assumption and the happy-path step; the pointer names the exact trigger condition; the linked file holds the actual diagnosis and fix.

## Phrasing the trigger condition well

The trigger must separate "expected, handle inline" from "unexpected, break away". Three shapes that work:

- **By output class:** "If the command exits with a non-zero code _other than_ lint warnings..." — precise about which failures are normal.
- **By error symptom:** "If you see `command not found`, `EACCES`, or any error whose cause isn't obvious from the message..." — names the symptoms.
- **By recoverability:** "If the error message does not tell you how to fix the problem..." — defers judgment to the document.

What never works is a bare link with no trigger: "See troubleshooting.md for issues." The agent cannot tell when that link applies, so it either reads too early (wasted context) or never (stuck).
