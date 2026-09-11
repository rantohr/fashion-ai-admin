---
name: ng-crud-feature
description: Scaffold a lazy-loaded Angular feature (model + HTTP service + list + form components, routes file) in fashion-ai-admin for one API resource. Use when adding CRUD screens for Users, Scenarios, or any future entity. Triggers on "add a CRUD feature for X", "scaffold the X admin screens", "generate list/form for X".
metadata:
  type: project-skill
---

# Angular CRUD Feature (fashion-ai-admin)

Generates one lazy-loaded feature area under `src/app/features/<feature>/`,
following the pattern already used by `brands`/`outfits`/`articles` — read
that trio as the reference implementation before starting a new one.

## Steps

1. Generate the two components with the Angular CLI — **do not** repeat the
   component name in the path (the CLI appends it automatically):
   ```bash
   npx ng generate component features/<feature>/<entity>-list
   npx ng generate component features/<feature>/<entity>-form
   ```
   This produces `features/<feature>/<entity>-list/<entity>-list.ts` etc. If
   you see a doubled folder (`<entity>-list/<entity>-list/<entity>-list.ts`),
   the path was wrong — flatten it by moving the inner folder's contents up
   one level and deleting the empty wrapper.
2. Create `features/<feature>/<entity>.model.ts`: a plain interface for the
   API shape, an `as const` tuple + derived union type for any enum-like
   field (see `outfit.model.ts`'s `SEASONS`/`Season`), and a `<Entity>Payload`
   interface for create/update bodies (optional fields as `?:`, matching the
   API DTO's optionality exactly).
3. Create `features/<feature>/<feature>s.service.ts`: `@Injectable({
   providedIn: 'root' })`, inject `HttpClient`, one method per REST verb
   against `${API_BASE_URL}/<feature>` (`src/app/core/api-config.ts`). Thin
   wrappers only — no `.pipe()` transforms here, that belongs in the
   component if it's even needed.
4. Create `features/<feature>/<feature>.routes.ts` exporting a `Routes`
   array with `''` (list), `'new'` (form), and `':id'` (form, edit mode) —
   mirror `features/brands/brands.routes.ts` exactly.
5. Wire it into `src/app/app.routes.ts`'s shell `children` via
   `loadChildren: () => import('./features/<feature>/<feature>.routes').then((m) => m.<FEATURE>_ROUTES)`.
6. List component: `ngOnInit` calls `<feature>Service.list()`, holds
   `brands`/`loading`/`error` as signals, renders rows with `@for`, links to
   `new` and `:id` with `RouterLink`. Delete: either a plain
   `confirm()` (outfit/article lists) or the deferred confirm-dialog pattern
   (brand list) — **don't add a second `@defer` block**, one is the
   deliberate total for this app (see `CLAUDE.md`).
7. Form component: reactive forms (`FormBuilder.nonNullable.group`), read
   `:id` from `ActivatedRoute.snapshot.paramMap` to decide create-vs-edit
   mode, signals for loading/saving/error state. If the entity references
   another one (like `outfits.brandId` or `articles.outfitId`), inject that
   other feature's service too and populate a `<select>` from its `list()`
   call in the same `ngOnInit` — that request fires unconditionally, not
   just in edit mode (see `outfit-form.ts`).
8. Any spec file whose component imports `RouterLink`/`RouterLinkActive`/
   `RouterOutlet` needs `provideRouter([])` in `TestBed.configureTestingModule`
   providers (`NG0201` otherwise). Any component whose `ngOnInit` calls
   `HttpClient` additionally needs `provideHttpClient()` +
   `provideHttpClientTesting()`, and the test must call
   `fixture.detectChanges()` then immediately
   `TestBed.inject(HttpTestingController).expectOne(url).flush(...)` —
   don't `await fixture.whenStable()` before flushing, the outstanding
   request keeps the fixture unstable forever.
9. Change detection: `OnPush` on every new component.
10. Sanity check: `npm run build` and `npm test -- --watch=false` before
    considering it done. If a real API is reachable locally
    (`fashion-api`'s `npm run db:up` + built API running), also smoke-test
    the actual HTTP contract with `curl` (login, then create/list/update/
    delete) — payload shape mismatches (e.g. sending `""` instead of
    omitting an optional field) are easy to miss from the Angular side
    alone.

## Don't

- Don't add a guard to the new routes yourself — `authGuard` already covers
  every route under the shell in `app.routes.ts`.
- Don't reach for NgRx or another state library for a list+form screen —
  signals are enough at this scale.
- Don't duplicate token-attachment logic in a new service — `authInterceptor`
  (wired in `app.config.ts`) already attaches the Bearer token to every
  `HttpClient` request app-wide.
