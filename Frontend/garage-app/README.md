# Car Services – React Frontend

React 19 + TypeScript + Vite + MUI + Redux Toolkit + React Router + Axios + React Hook Form + i18next (EN / AR with RTL),
built for the Spring Boot `Car-Services` Backend.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc -b
npm run lint
npm run build
```

The API address is read from `VITE_API_BASE_URL` (see `.env.example`; `.env.development` is used by `npm run dev`).
It must include the `/api` prefix, e.g. `http://localhost:8080/api`. For production create `.env.production`.

## Backend configuration you must set

| Setting | Why |
|---|---|
| `app.cors.allowed-origins` = `http://localhost:3000` (no trailing slash) | The default has a trailing `/`, which never matches the browser `Origin`, so the browser blocks every call. |
| `app.frontend.url` = `http://localhost:3000` (no trailing slash) | Email links (`/verify-email`, `/reset-password`, `/set-password`) are built from it; a trailing slash produces `//`. |
| An ADMIN user inserted in the database | There is no endpoint or seed that creates the first admin. |

## Structure (same conventions as the reference project)

```
src/
  app/
    api/agent.ts          axios instance + typed endpoint groups (Account, Registration, Garages, Technicians, Admin, Catalog, Assignments)
    components/           AppTextInput, AppSelect, AppFileInput, ConfirmDialog, PageHeader, StatusChip, Loading/Empty/ErrorState...
    errors/               NotFound, Unauthorized, ServerError
    layout/               App (theme, session refresh, token expiry), PublicLayout
    models/               TypeScript types mirroring the Backend DTOs / enums
    router/               Routes, RequireAuth (role-based), DashboardRedirect
    utils/                jwt, authStorage, error normalisation, notify, paths, validation
  features/
    Account/              Login, Signup, VerifyEmail, ResendVerification, ForgotPassword, ResetPassword, SetPassword, ChangePassword
    Admin/                registration requests (paginated), users, services catalog + options
    GarageOwner/          register owner, my garages, request garage, technicians
    Technician/           home, share location
    Dashboard/            role-aware drawer shell
  store/configureStore.ts
  locales/{en,ar}/translation.json
```

## Authentication

* `POST /auth/login` → `{ email, fullName, role, token }`; the token is stored in `localStorage` (key `user`) and sent as `Authorization: Bearer`.
* `userId`, `role` and `exp` are decoded from the JWT (the Backend does not return the user id in the response).
* On start-up the session is refreshed with `GET /auth/current-user`.
* A `401` response or JWT expiry signs the user out and redirects to the login page.
* After login each role lands on its dashboard: ADMIN → `/admin/dashboard`, GARAGE_OWNER → `/owner/dashboard`, TECHNICIAN → `/technician/dashboard`.

## Known limitations that come from the Backend (not invented around)

* **Backend bugs read from the source (not fixed here):** `AdminUserController` and `TechnicianAssignmentController` never receive their injected service (non-`final` field with `@RequiredArgsConstructor`), so **Users list/create and location update will fail with 500** until fixed. The technician **set-password** link looks up the hashed token by its raw value, so it is expected to fail. `ResponseStatusException` / `BadCredentialsException` may surface as generic 500 errors.
* There is no endpoint to download the registration certificate, to list an owner's own registration requests, to update a technician's salary, to reactivate a garage, or to list technician assignments. The UI does not fake these.
* Only `/admin/registration-documents` is paginated (0-based). The Backend has no search or filtering endpoints, so the UI has none.
* The Backend has no `USER`/customer role or customer controllers, so no such area exists.
* Tracking over WebSocket (`/ws-tracking`) is not consumed: no screen in the Backend flow needs it for the existing roles.
