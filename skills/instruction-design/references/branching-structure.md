# Branch-per-file structure: worked example

This is the full pattern referenced by section 4 of `SKILL.md`, shown with a task that has three divergence points.

## The task

"Instructions for an agent that deploys a web app" — the deploy target (cloud provider), the app type (static vs. server), and whether this is a first deploy vs. a redeploy all fork the steps in genuinely different directions.

## Bad: one file, all branches inlined

A single `SKILL.md` that reads like:

```markdown
## Step 4: Deploy

If deploying to AWS, run `aws s3 sync ...` if it's a static site, or if
it's a server app instead run `eb deploy`, unless this is a first deploy
in which case first run `eb init` and configure the environment, but if
deploying to GCP instead the static site command is `gsutil rsync ...`
and the server app command is `gcloud app deploy` unless first deploy in
which case run `gcloud app create` first, and if Azure...
```

This is unreadable even by a human; an agent following it is likely to mix a GCP command with an AWS setup step, because everything sits in one undifferentiated block of conditionals.

## Good: split at each divergence point

```text
deploy-app/
├── SKILL.md
└── references/
    ├── aws/
    │   ├── static.md
    │   └── server.md
    ├── gcp/
    │   ├── static.md
    │   └── server.md
    └── azure/
        ├── static.md
        └── server.md
```

**In `SKILL.md` (the trunk):**

```markdown
## Step 4: Deploy

First, confirm two things: the deploy target (AWS / GCP / Azure) and the
app type (static / server). Both should already be answered by the
project config from Step 1 — don't re-derive them here.

- AWS + static → read `references/aws/static.md`
- AWS + server → read `references/aws/server.md`
- GCP + static → read `references/gcp/static.md`
- GCP + server → read `references/gcp/server.md`
- Azure + static → read `references/azure/static.md`
- Azure + server → read `references/azure/server.md`

Each of those files assumes Steps 1–3 (build, test, config validation)
are already done — don't repeat them.
```

**In `references/aws/server.md`:**

```markdown
# Deploy: AWS, server app

Assumes the app has already been built and tested (Steps 1–3 in
SKILL.md). This file covers only the AWS-server-specific deploy steps.

## First deploy

1. Run `eb init` ...
2. ...

## Redeploy

1. Run `eb deploy` ...

If the deploy fails with a health-check timeout, or any error that
doesn't clearly explain what went wrong, read
`references/aws/troubleshooting.md` before retrying.
```

## Why this is correct

- The trunk file only ever contains the _decision_ (which combination applies) and the _link_ — never the AWS-specific or GCP-specific commands themselves. An agent reading the trunk for a GCP static deploy never has to skim past AWS or Azure detail to find its path.
- The divergence condition and the destination are stated together, in the same line, so there's no separate lookup step to figure out where a given combination leads.
- Shared steps (build, test, config validation) live once, in the trunk, before the fork — they are explicitly _not_ duplicated into each branch file, and each branch file says so, so nobody re-derives or re-explains them.
- A second, smaller fork (first deploy vs. redeploy) happens _inside_ a single branch file rather than as its own top-level file — that's fine. Split into a new file when the divergence produces a genuinely different set of steps that would otherwise clutter the trunk or a branch file; a two-or-three-line difference inside an already-scoped branch file doesn't need its own file just for the sake of splitting.
- Nested folders (`aws/static.md`) vs. flat files (`aws-static.md`) is a cosmetic choice — pick whichever keeps the reference list in SKILL.md easy to scan. What matters structurally is the one-file-per-branch rule and the explicit trunk-to-branch link, not the exact folder shape.

## When a branch link should live

Place the link at the point where the decision becomes relevant, not at the beginning of the whole instruction set.

Bad:

> Before starting, read `path-a.md`, `path-b.md`, and `troubleshooting.md`.

Better:

> Determine the execution mode.
>
> - If mode A, read `path-a.md`.
> - If mode B, read `path-b.md`.

This ensures the agent loads only the instructions associated with its current path.

## Stating a branch's applicability

Each branch document should state its applicability clearly, so the agent can determine whether reading it is necessary:

```text
Read this document only when the repository uses pnpm.
```

```text
Read this document only when the initial command reports a missing dependency.
```
