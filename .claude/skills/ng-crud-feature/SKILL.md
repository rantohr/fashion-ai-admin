---
name: ng-crud-feature
description: Scaffold a lazy-loaded Angular feature (list + form components, routes file) in fashion-ai-admin for one API resource. Use when adding CRUD screens for Brands, Outfits, Articles, Users, or any future entity. Triggers on "add a CRUD feature for X", "scaffold the X admin screens", "generate list/form for X".
metadata:
  type: project-skill
---

# Angular CRUD Feature (fashion-ai-admin)

Generates one lazy-loaded feature area under `src/app/features/<feature>/`,
following the pattern already used by `brands`/`outfits`/`articles`.

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
2. Create `features/<feature>/<feature>.routes.ts` exporting a `Routes`
   array with `''` (list), `'new'` (form), and `':id'` (form, edit mode) —
   mirror `features/brands/brands.routes.ts` exactly.
3. Wire it into `src/app/app.routes.ts`'s shell `children` via
   `loadChildren: () => import('./features/<feature>/<feature>.routes').then((m) => m.<FEATURE>_ROUTES)`.
4. List component: inject the feature's API service (create one under
   `src/app/core/` or `src/app/features/<feature>/` if it doesn't exist yet,
   using `HttpClient` + RxJS, not manual `fetch`), render rows with
   `@for`, and link to `new` and `:id` with `RouterLink`.
5. Form component: use a `FormGroup`/reactive forms (not template-driven),
   read `:id` from `ActivatedRoute` to decide create-vs-edit mode, use
   signals for any local UI state (loading/error), not `BehaviorSubject` for
   things a signal covers just as well.
6. Any spec file whose component imports `RouterLink`, `RouterLinkActive`,
   or `RouterOutlet` **must** add `provideRouter([])` to that spec's
   `TestBed.configureTestingModule({ providers: [...] })`, otherwise it fails
   with `NG0201: No provider found for ActivatedRoute`.
7. Change detection: use `OnPush` on new components unless there's a
   concrete reason not to (the plan calls this out explicitly as a
   convention to follow throughout the admin panel).
8. Sanity check: `npm run build` and `npm test -- --watch=false` before
   considering it done.

## Don't

- Don't add a guard to the new routes yourself unless explicitly asked —
  auth guarding is separate, project-wide work, not per-feature.
- Don't reach for NgRx or another state library for a list+form screen —
  a signal-based service or component state is enough at this scale.
