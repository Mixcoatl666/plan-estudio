# Repository Guidelines

## Project Structure & Module Organization

The application lives in `plan-estudio/`; run project commands from that directory. `src/app/` contains the page, layout, global styles, and ChatGPT sign-in helpers. `src/components/ui/` holds vendored UI components; keep product-specific behavior in `src/app/` or a focused module instead of changing those components casually. Shared utilities are in `src/lib/`, database code in `src/db/`, static assets in `public/`, and framework and install helpers in `scripts/`. The repository-local Vitest guidance is in `.agents/skills/vitest-testing/SKILL.md`.

## Build, Test, and Development Commands

Use Node.js 22.13 or newer. From `plan-estudio/`:

- `npm run install:ci` installs the locked dependencies through the project's install helper.
- `npm run dev` starts the local Vinext development server.
- `npm run build` creates the deployable build; `npm run start` previews that build locally.
- `npm run lint` runs ESLint. Run it before submitting code changes.
- `npm run db:generate` generates Drizzle migrations after schema changes.

There is currently no `test` script. Add and run Vitest only when tests are part of the change; follow the repository skill for setup and execution.

## Coding Style & Naming Conventions

Use TypeScript and TSX, two-space indentation, and the existing double-quote style. Keep React components in PascalCase, hooks in `useX` form, and ordinary functions and variables in camelCase. Use the `@/` alias for imports from `src/`. Follow the existing ESLint configuration; `src/components/ui/` has special rules because it contains vendored code.

## Testing Guidelines

No test suite or coverage threshold is configured yet. When adding tests, use Vitest files named `*.test.ts` or `*.test.tsx`, near the code they cover. Test visible behavior and meaningful edge cases, especially task creation, editing, completion, calendar dates, and local storage. Keep time and browser storage isolated between tests. Run the focused test, then the full suite and lint.

## Commits & Pull Requests

Use Conventional Commits with short imperative subjects, such as `feat(frontend): add study calendar`. Pull requests should explain the behavior changed, list verification commands, link a relevant issue when one exists, and include screenshots for visible UI changes.

## Configuration & Secrets

Keep local `.env*` files and generated `.sites-runtime/` or `.wrangler/` state out of commits. Check `plan-estudio/README.md` before changing hosting, authentication, or Cloudflare bindings.
