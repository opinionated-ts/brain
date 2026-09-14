# Structure of a troubleshooting document

Referenced from section 8 of `SKILL.md`. A troubleshooting document exists so the agent can identify the _cause_ before applying a _fix_ — never as a pile of random remedies.

> ⚠️ Only create this file when the main path has a realistic failure mode worth documenting. A simple, single-step instruction that can't realistically break doesn't need one.

## The diagnostic flow

Every section should follow the same shape:

```text
symptom
   ↓
diagnostic check
   ↓
identified cause
   ↓
recovery
   ↓
return to main path
```

The agent reads the symptom, runs a check to confirm which cause applies, then follows only that recovery path and returns to the trunk. Avoid one big unordered list of possible fixes — the agent ends up trying fixes blindly.

## Template

```markdown
# Troubleshooting: <step or task>

Read this document only when the main instructions tell you to — the
trigger condition in SKILL.md decides this. If you got here on your own,
the error you're experiencing may be documented below; if none of these
sections match, stop and report the error message verbatim instead of
guessing.

## <Symptom / error message>

**Cause:** <what actually produces this symptom>

**Check:** <one observable command or inspection that confirms this
cause and rules out the others>

**Fix:**

1. ...
2. ...

**Return:** continue from the step you were on in the main instructions
when the failure occurred.

## <Symptom / error message>

... (repeat)
```

## Rules for writing good entries

- **Name the symptom as the agent will see it** — the exact error message, the odd exit code, the missing file. The agent matches against the entry by what it observes, so the heading must be phrased in observable terms, not in cause terms ("`command not found: eslint`", not "ESLint not properly installed").
- **Keep one entry per distinct cause.** If two different problems produce the same symptom, give them separate entries with their own checks; the check is what disambiguates them.
- **Every fix must return to the main path.** An entry that fixes the problem but leaves the agent unsure of what to do next forces an early stop.
- **Give the agent a stop condition.** If no entry matches, the instruction should say to report the error verbatim rather than invent a fix (see section 8 of SKILL.md — never encourage speculative recovery).
- **Make the check observable.** "Verify the version" is weaker than "Run `node --version` and compare with the first two digits of `18.x`". The check should be a command or inspection the agent can run and get a yes/no answer from.

## Example entry

```markdown
## "command not found: eslint"

**Cause:** ESLint is not installed, or the local `node_modules/.bin`
directory is not on the PATH of the shell the script uses.

**Check:** run `ls node_modules/.bin/eslint`. If the file exists, the
cause is PATH; if it doesn't, the cause is a missing install.

**Fix (missing install):**

1. Run `npm install` from the repository root.
2. Re-run the linter step.

**Fix (PATH):**

1. Invoke the binary via its full path: `node_modules/.bin/eslint .`.
2. Re-run the linter step.

**Return:** continue from the step that failed in the main instructions.
```
