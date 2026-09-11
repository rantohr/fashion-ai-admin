@.docs/fashion-ai-project-plan.md

# fashion-ai-admin

Angular 22 admin panel for the Fashion AI Showcase (see the full plan above
for business context, scope, and the day-by-day build order). This is the
only authenticated surface in the project — the public site has no accounts.

## Conventions

- Standalone components (the project default — no `standalone: true` flag
  needed), signals for local state, reactive forms, RxJS for API calls.
- File naming has no `.component` suffix (`brand-list.ts`, not
  `brand-list.component.ts`) — this is this Angular version's CLI default.
  Always generate new components with `ng generate component <path>` rather
  than hand-writing files, and pass the **path only once** — the CLI already
  appends a folder named after the component itself
  (`ng generate component features/x/y` -> `features/x/y/y.ts`; repeating the
  last segment doubles the nesting).
- Routing is feature-based and lazy: each feature folder under
  `src/app/features/` owns a `<feature>.routes.ts` exporting a `Routes`
  array, wired into `src/app/app.routes.ts` via `loadChildren`. Single-page
  features (wizards) use `loadComponent` directly instead.
- `src/app/layout/shell/shell.ts` is the authenticated shell (nav + outlet)
  wrapping every route except `/login`. The route guard that actually
  enforces auth is Day 3 work — it doesn't exist yet, don't assume routes are
  protected.
- Any component that uses `RouterLink`/`RouterLinkActive`/`RouterOutlet`
  needs `provideRouter([])` (or a real router config) in its spec's
  `TestBed.configureTestingModule` `providers`, or `NG0201: No provider
  found for ActivatedRoute` will fail the test — see any `*-list.spec.ts`
  for the pattern.

## Backend

There is no local API in this repo. `fashion-api` (NestJS) owns Postgres via
Docker Compose and Prisma — see its `CLAUDE.md` to bring that up locally
before wiring real HTTP calls into these forms/lists.

## Skills

- `ng-crud-feature` (`.claude/skills/`) — scaffolds a lazy-loaded Angular
  feature (list + form components, routes file, reactive form) matching this
  repo's conventions. Use it for Day 3's Brands/Outfits/Articles CRUD instead
  of hand-writing the next feature's boilerplate.
