# frontend

React web app for the EOS visitor management system. It serves both zones of the backend API from one build:

**Visitor zone** — mobile-first, no OIDC. A visit is authorized by the opaque `visitToken` returned at check-in and sent back as `X-Visit-Token`.

The visitor sees exactly two views, decided by the visit session:

| Route                   | Without a session             | With a session                |
| ----------------------- | ----------------------------- | ----------------------------- |
| `/check-in/:locationId` | Check-in form (the QR target) | redirect to the badge         |
| `/`                     | Prompt to scan the QR code    | redirect to the badge         |
| `/visit/:visitId`       | "see reception" notice        | Badge card with **Check out** |

A successful check-in _is_ the check-in: it creates the visit in `ON_SITE`, stores `visitId` and `visitToken` in the `eos_visit` cookie (`Path=/`, `SameSite=Lax`, 16 h, `Secure` over https) and lands on the badge. **Check out** calls `selfCheckOut`, clears the cookie and confirms — the next scan starts a fresh registration. A badge request answered with 401/404/410 (token rejected, visit purged) also clears the cookie, so a stale session falls back to the form instead of trapping the visitor on an error.

**Admin zone** — responsive (cards below `md`, tables and a permanent drawer above). The backend requires an OIDC bearer token with role `eos-admin`; **the token provider is not wired up yet** (see [Open ends](#open-ends)).

| Route              | Page                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `/admin/visits`    | Search and filter visits, pre-register, edit, delete, desk check-in/out, visitor pass PDF |
| `/admin/on-site`   | Evacuation list (`status=ON_SITE`), printable                                             |
| `/admin/locations` | Locations with QR code, create/edit, deactivate                                           |

## Stack

| Concern         | Choice                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| Build           | Vite 8 + React 19 + TypeScript 6 (`@vitejs/plugin-react`)                  |
| Components      | MUI 9 (`@mui/material`, `@mui/icons-material`) on Emotion                  |
| State / data    | Redux Toolkit 2 + RTK Query                                                |
| Routing         | React Router 8, data router (`createBrowserRouter`)                        |
| i18n            | i18next 26 / react-i18next 17, `de` (fallback) and `en`, browser detection |
| Tests           | Vitest 5 + Testing Library + MSW 2, jsdom                                  |
| Lint / format   | oxlint, Prettier                                                           |
| Package manager | pnpm                                                                       |

Node `^20.19.0 || >=22.12.0` (Vite 8 `engines`). Developed on 22.14.

## Getting started

```shell
pnpm install
pnpm dev
```

The dev server proxies `/api` to `http://localhost:8080`, so run the backend with `./mvnw quarkus:dev` in `../backend`.

`VITE_API_BASE_URL` overrides the API base (see `.env.example`); it defaults to `/`, i.e. same origin through the proxy.

### Demo mode without a backend

`VITE_USE_MOCKS=true` starts an MSW service worker in the browser that serves `src/mocks/handlers.ts` against the fixtures in `src/mocks/fixtures.ts` — every page is clickable with no backend running. `.env.development.local` enables it by default; set it to `false` (or delete the file) to talk to the real Quarkus service. Mocks are never bundled into a production build unless the flag is set at build time.

## Scripts

| Script               | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `pnpm dev`           | Vite dev server                                  |
| `pnpm build`         | `tsc -b` then production build                   |
| `pnpm preview`       | Serve the production build                       |
| `pnpm test`          | Vitest run                                       |
| `pnpm test:watch`    | Vitest watch mode                                |
| `pnpm test:coverage` | Vitest with v8 coverage                          |
| `pnpm typecheck`     | `tsc -b`                                         |
| `pnpm lint`          | oxlint                                           |
| `pnpm format`        | Prettier write                                   |
| `pnpm format:check`  | Prettier check (CI gate)                         |
| `pnpm api:generate`  | Regenerate the API client from `../openapi.yaml` |

## Styling

**No CSS lives in a component file** — no `sx`, no inline styles. Every component imports its own stylesheet next to it (`CheckInPage.tsx` → `CheckInPage.css`) and only sets `className`. The two form dialogs share `FormDialog.css`; that is the single deliberate exception.

Layers, from most global to most local:

| Layer     | File                      | Holds                                                                              |
| --------- | ------------------------- | ---------------------------------------------------------------------------------- |
| Brand     | `src/theme.ts`            | Palette (light + dark), typography, radius, MUI default props                      |
| Tokens    | `src/styles/tokens.css`   | Semantic variables — spacing, radii, shadows, surfaces, status accents, focus ring |
| Skin      | `src/styles/mui-skin.css` | How MUI primitives look app-wide (buttons, papers, inputs, tables, dialogs)        |
| Component | `src/**/<Component>.css`  | Layout and identity of one component                                               |

### The look

One look, folded into the base stylesheets — translucent "glass" surfaces over a dark ground:

- `body` carries two fixed radial glows (orange top-left, violet top-right); every surface above it is semi-transparent white with `backdrop-filter: blur(18px)`, so the glow reads through cards, dialogs, bars and the drawer.
- Hairline borders (`--eos-hairline`, white at 12%) instead of solid dividers; large radii (12 / 16 / 24px); the primary button carries a coloured halo (`--eos-glow-primary`) rather than a grey drop shadow.
- Visit status is carried by the chip alone — no accent rails. An inset shadow on a rounded card bows outward at the corner, so accents are never drawn that way.

### Changing the colours

`brand` in `src/theme.ts` is the only place a colour value is written. MUI runs with `cssVariables: { cssVarPrefix: 'eos' }`, so it emits every palette entry as a CSS variable (`--eos-palette-primary-main`, `--eos-palette-background-paper`, …); `tokens.css` and every component stylesheet consume only those variables, never a literal colour. Swapping the palette in `theme.ts` restyles the whole app, CSS included, without touching a stylesheet — and a runtime colour guide later only has to feed a palette object into `createTheme`.

Semantic aliases keep the intent readable: `--eos-accent-on-site` / `--eos-accent-expected` / `--eos-accent-checked-out` map visit status to colour in one place, alongside `--eos-surface-*`, `--eos-shadow-*`, `--eos-radius-*` and `--eos-space-*`.

`main.tsx` wraps the app in `<StyledEngineProvider injectFirst>` so Emotion injects MUI's styles _before_ the stylesheets — without it MUI's runtime styles outrank the component CSS.

## API client

`src/api/eosApi.ts` is **generated — never edit it by hand.** `@rtk-query/codegen-openapi` reads `../openapi.yaml` (config: `openapi-config.ts`) and injects every operation into the empty `baseApi` as a typed hook named after its `operationId` (`useSelfCheckInMutation`, `useListVisitsQuery`, `useGetPublicLocationQuery`, …). Regenerate after any spec change:

```shell
pnpm api:generate
```

The codegen CLI needs `esbuild-runner` to read the TypeScript config file; it is a dev dependency for that reason only.

`src/api/baseApi.ts` is the hand-written half: `fetchBaseQuery` with `VITE_API_BASE_URL`, the `Visit` / `Location` / `Identity` tag types, and a `prepareHeaders` that attaches `Authorization: Bearer …` and `X-Visit-Token` from the `auth` slice. Add cross-cutting request behaviour there, not in the generated file.

`src/app/authSlice.ts` holds both credentials. The `visitToken` is persisted to `localStorage` (`eos.visitToken`) because the visitor reopens their badge from the QR/badge URL; the admin access token is kept in memory only.

## Layout

```
src/
  api/          baseApi.ts (hand-written) + eosApi.ts (generated) + binaryApi.ts + toContactInfo.ts
  app/          store, typed hooks, router
  components/   shared components used by more than one feature
  features/
    auth/       auth slice, useSignOut, logout page
    locations/  components/ + pages/
    visits/     components/ + pages/ (visits list, evacuation list)
    visitor/    components/ + pages/ (check-in, badge, QR prompt)
  layouts/      VisitorLayout, AdminLayout
  pages/        pages outside any feature (NotFoundPage)
  i18n/         i18next setup, locales/{de,en}.json, i18next.d.ts
  mocks/        MSW browser worker, handlers and demo fixtures (dev only)
  styles/       tokens.css, base.css, mui-skin.css, form-dialog.css
  test/         MSW server, setup, renderWithProviders
  theme.ts      brand palette and MUI theme (CSS variables, light + dark)
```

A feature owns everything only it uses; anything a second feature needs moves up to `components/` or `styles/`. Each component keeps its stylesheet next to it, so a page and its CSS move together.

`@/` resolves to `src/` (`vite.config.ts` alias + `tsconfig.app.json` paths). Imports inside one folder stay relative (`./VisitCard`); anything crossing a folder uses the alias (`@/api/eosApi`), so moving a file never rewrites a chain of `../../`.

Use `useAppDispatch` / `useAppSelector` from `src/app/hooks.ts` — never the untyped `react-redux` hooks.

## i18n

`src/i18n/locales/{de,en}.json` are the only resources; `src/i18n/i18next.d.ts` types `t()` against the German file, so a typo in a key is a compile error. Language is detected from querystring, then `localStorage`, then the browser, and persisted to `localStorage`; fallback is `de`.

## Tests

`renderWithProviders` (`src/test/renderWithProviders.tsx`) wraps the component under test in store, i18n, MUI theme and a `MemoryRouter`. Options: `store`, `route`, `path`, `language` (defaults to `en`, so assertions read in English). **A component using `useParams` needs both** — `route` is the URL, `path` the pattern it must match:

```tsx
renderWithProviders(<CheckInPage />, {
  route: `/check-in/${LOCATION_ID}`,
  path: '/check-in/:locationId',
})
```

MSW stubs the backend. `onUnhandledRequest: 'error'` means every test declares the endpoints it touches, and mock payloads must match the schemas in `openapi.yaml` (`PublicLocation.companyName`, `VisitPage.items`, …).

Two things in `vite.config.ts` exist for the test environment specifically: jsdom is pinned to the origin `http://localhost:3000` and `VITE_API_BASE_URL` is set to the same value, because a relative base URL cannot be turned into a `Request` under Node and every RTK Query call would fail with `Failed to parse URL`.

Vitest globals are off — import `describe` / `it` / `expect` from `vitest`, and note that `src/test/setup.ts` calls Testing Library's `cleanup()` itself (without globals it is not registered automatically).

MUI appends ` *` to the label of a required field, so query those by regex: `screen.getByLabelText(/^Name/)`, not the exact string.

## Known shortcuts

`updateVisit` and `replaceLocation` require an `If-Match` header for optimistic locking. RTK Query's generated hooks do not expose response headers, so the ETag of the loaded entity is not available and both calls send `If-Match: *`. Concurrent edits therefore overwrite each other. Fixing it means reading the `ETag` header — either through a custom `baseQuery` that keeps a per-entity ETag map, or by having the backend accept a version field in the body.

## Open ends

- **OIDC is not implemented.** `accessTokenReceived` exists in the auth slice, but nothing dispatches it and `/admin/visits` is unguarded. Needs a provider (`oidc-client-ts` or the Keycloak adapter) plus the issuer URL.
- The bundle is a single ~700 kB chunk (~223 kB gzip) — MUI is not split. Route-level `lazy()` when it starts to matter.
