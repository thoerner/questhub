# AGENTS.md

## Cursor Cloud specific instructions

### Repository Status

QuestHub is a **greenfield project** — as of the initial setup, the repository contains only a `README.md` describing the product vision (a themed GitHub client that gamifies GitHub workflows). There is no source code, no dependency manifests, no build system, and no runnable services.

### Environment

- No dependencies to install and no update script is needed until a tech stack is chosen and code is added.
- Once a stack is selected, future agents should add the appropriate update script via `SetupVmEnvironment` and update this section.

### Development

- No lint, test, build, or run commands exist yet.
- The README's "Next Steps" section tracks what needs to happen next: define core user flows, pick stack/architecture, build initial UI shell.
