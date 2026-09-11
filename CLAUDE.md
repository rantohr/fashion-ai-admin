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
- `src/app/layout/shell/shell.ts` is the authenticated shell (nav + outlet +
  current user + logout) wrapping every route except `/login`, guarded by
  `authGuard` (`src/app/core/auth/auth.guard.ts`) on the shell's route in
  `app.routes.ts`.
- Any component that uses `RouterLink`/`RouterLinkActive`/`RouterOutlet`
  needs `provideRouter([])` (or a real router config) in its spec's
  `TestBed.configureTestingModule` `providers`, or `NG0201: No provider
  found for ActivatedRoute` will fail the test — see any `*-list.spec.ts`
  for the pattern.

## Auth

- `src/app/core/auth/`: `AuthService` (signals: `currentUser`,
  `isAuthenticated`; token + user persisted to `localStorage` so a refresh
  doesn't log you out), `authGuard` (`CanActivateFn`, redirects to `/login`
  via `router.parseUrl`, doesn't `Router.navigate` — that matters for
  testability), `authInterceptor` (functional `HttpInterceptorFn`, attaches
  `Authorization: Bearer <token>` to every outgoing request when one exists).
  All three are wired in `app.config.ts`/`app.routes.ts` — don't duplicate
  token-attachment logic in a feature service, the interceptor already
  covers every `HttpClient` call app-wide.
- `API_BASE_URL` (`src/app/core/api-config.ts`) is a hardcoded
  `http://localhost:3000` constant, not an environment file — deployment
  isn't in scope for this project (plan §2).

## HTTP + testing pattern

- Each entity has a flat `<entity>.model.ts` (interfaces, plus `as const`
  tuples for enum-like fields such as `Season`/`OutfitStatus`) and a
  `<entity>s.service.ts` (thin `HttpClient` wrapper, `providedIn: 'root'`) —
  see `src/app/features/brands/` as the reference pair.
- Any component whose `ngOnInit` calls `HttpClient` needs
  `provideHttpClient()` **and** `provideHttpClientTesting()` in its spec,
  and the test must trigger `fixture.detectChanges()` then immediately
  satisfy the request via `TestBed.inject(HttpTestingController)
  .expectOne(url).flush(...)` — don't rely on `fixture.whenStable()` alone
  before flushing, the pending request keeps the fixture "unstable" and the
  await never resolves. See `outfit-form.spec.ts` for a case where
  `ngOnInit` fires an unconditional request (loading brands for the select)
  regardless of create-vs-edit mode.
- List components expose their delete-flow members (`requestDelete`,
  `confirmDelete`, `pendingDelete`, etc.) as `protected` for the template;
  specs reach them through a small local harness type + cast
  (`asHarness(component)` in `brand-list.spec.ts`) rather than widening the
  component's real API just for tests.

## The `@defer` usage

`brand-list.html` defers `<app-confirm-dialog>` behind
`@defer (when pendingDelete() !== null)` — its JS chunk isn't fetched until
the user actually requests a delete. This is deliberately the **only**
`@defer` in the app per the plan's ask for "one `@defer` usage"; outfit/
article lists use a plain `confirm()` instead of repeating the pattern.
Don't add more `@defer` blocks to satisfy this requirement again elsewhere.

## Image cropping & uploads (Day 4)

- `src/app/shared/image-cropper/` — canvas-based crop tool, generic across
  two modes via `mode = input<'single' | 'grid'>('single')`:
  - `'grid'`: no interactive selection — the whole image is auto-sliced
    into an even `rows x cols` grid. Used for the outfit wizard's combined
    10-outfit image (`rows=5, cols=2`), because the image-generation prompt
    already asks the AI for a clean, gapless grid.
  - `'single'`: the user drags a rectangle on the canvas (pointer events,
    not mouse events, for touch support) to pick one crop region. Used for
    brand logo upload (`brand-form.ts`'s `onLogoFileSelected`/
    `onLogoCropped`) — reusing this same component, not a second cropper.
  - Both modes emit `cropped = output<Blob[]>()` (length 1 for single,
    `rows*cols` for grid) via `HTMLCanvasElement.toBlob()`. The component
    reads `imageSrc` reactively through an `effect()` keyed on both
    `imageSrc()` and the `viewChild` canvas signal — that's what makes it
    safe to swap the source image on an already-mounted instance, not just
    on first render.
  - **Not covered by the test suite**: this project's Vitest+jsdom
    environment has no real canvas 2D context or image decoding (no
    `canvas` npm package installed, and it wasn't added here to avoid a
    native-binary dependency on Windows) — `image-cropper.spec.ts` only
    verifies the component mounts and accepts inputs. The actual pixel
    cropping is a manual/browser-verified concern.
- `src/app/core/uploads/uploads.service.ts` — posts a `Blob` as
  `multipart/form-data` to `POST /uploads`; do **not** set a Content-Type
  header manually, `HttpClient` sets the multipart boundary itself from the
  `FormData` body. Returns `{ url: string }`, an **absolute**
  `http://localhost:3000/uploads/...` URL suitable to store directly as
  `imageUrl`/`logoUrl`.
- `OutfitsService.batchCreate()` posts to `POST /outfits/batch` (the Day 2
  transactional endpoint) — the outfit wizard uploads all 10 cropped
  images first (`forkJoin`), then does one `batchCreate` call so the
  create is genuinely all-or-nothing, matching the API's transaction.
- `src/app/features/wizards/outfit-wizard/outfit-wizard.utils.ts` holds the
  pure logic (`parseOutfitDrafts`, `slugify`, `withUniqueSlugs`) split out
  specifically so it's unit-testable without any DOM/canvas involved — see
  its `.spec.ts` for real coverage of the validation rules, as opposed to
  the component's necessarily-shallow spec.

## Backend

There is no local API in this repo. `fashion-api` (NestJS) owns Postgres via
Docker Compose and Prisma — see its `CLAUDE.md` to bring that up locally
before wiring real HTTP calls into these forms/lists. CORS is already
enabled there (`app.enableCors()`), so cross-origin calls from
`localhost:4200` work without extra configuration on either side.

## Skills

- `ng-crud-feature` (`.claude/skills/`) — scaffolds a lazy-loaded Angular
  feature (list + form components, routes file, reactive form) matching this
  repo's conventions, including the model/service split and the
  `provideHttpClientTesting()` spec pattern above. Use it for the next
  entity's CRUD instead of hand-writing the boilerplate.
