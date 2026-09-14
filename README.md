# @opinionated-ts/brain

The AI-assisted development layer of the [Opinionated TS](https://github.com/opinionated-ts) ecosystem.

## What is Brain?

`@opinionated-ts/brain` provides the skills, knowledge, and workflows that enable AI coding agents to work effectively within [Opinionated TS](https://github.com/opinionated-ts) projects.

Brain is designed to be included in [Opinionated TS templates](https://github.com/opinionated-ts/template), providing projects with a consistent foundation for AI-assisted development from the start.

As the [Opinionated TS](https://github.com/opinionated-ts) ecosystem evolves into a complete environment for developing TypeScript applications, Brain will provide the AI-assisted development capabilities that complement the project's code, tooling, and conventions.

## Skills

For now, this package only contains skills for AI coding agents, which are:

- **Self-contained skills** — bundled in this repository.
- **Opinionated TS ecosystem skills** — maintained in other packages of the [Opinionated TS](https://github.com/opinionated-ts) organization.

### Self-contained skills

These skills are installable via `npx skills add opinionated-ts/brain`:

- [`dependency-evaluation`](https://github.com/opinionated-ts/brain/tree/main/skills/dependency-evaluation) — Helps determine whether an external dependency is actually needed and, when it is, evaluates viable alternatives.
- [`instruction-design`](https://github.com/opinionated-ts/brain/tree/main/skills/instruction-design) — Designs, writes, reviews, or restructures instructions that an AI will execute.

### Opinionated TS ecosystem skills

- [`context-tree`](https://github.com/opinionated-ts/ai-context-tree) — Gives humans and AI coding agents a map of where relevant information lives in a repository.

## Related Projects

- [`template`](https://github.com/opinionated-ts/template) — Opinionated foundation for TypeScript projects.
- [`config`](https://github.com/opinionated-ts/config) — Shared development configuration for Opinionated TS projects.

## License

MIT
