# App Skeleton

A starter front-end template

## Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** + **shadcn/ui** (radix-nova style) components
- **react-router v7** with file-based route discovery
- **Redux Toolkit** store
- JWT auth scaffold + settings/layout theming system

## Getting started

```bash
npm install
npm run dev      # start dev server on http://localhost:5173
npm run build    # type-check + production build
npm run lint     # eslint
npm run format   # prettier
```

Runtime config (e.g. the API base URL) is loaded from `public/config.json` into
`window.__ENV__` at startup — point it at your backend.

## Project structure

```
src/
  app/                 # pages — each folder has page.tsx + route.tsx (auto-discovered)
    (control-panel)/   # authenticated area rendered inside MainLayout
      dashboard/       # the single example page
    public/            # unauthenticated pages (sign-in, 401, 404)
    App.tsx            # provider tree (store, theme, auth, settings, layout)
  auth/                # JWT auth context, providers, guards, roles
  components/
    ui/                # shadcn/ui primitives (@/components/ui/*)
    theme-provider.tsx
  configs/             # router assembly, settings, theme config
  hooks/               # generic reusable hooks
  layouts/             # app shell: sidebar, header, layout settings
  lib/utils.ts         # cn() helper
  providers/           # theme / authorization providers
  settings/            # runtime layout-settings system
  shared/              # Link, Loading, ThemeToggle
  store/               # Redux Toolkit setup
  types/               # shared types
  utils/               # fetch wrapper, date/color/storage helpers
```

## Adding a page

1. Create `src/app/<name>/page.tsx` exporting a default component.
2. Add a sibling `src/app/<name>/route.tsx`:

   ```tsx
   import type { RouteItemType } from "@/types"
   import authRoles from "@/auth/roles"
   import MyPage from "./page"

   const MyPageRoute: RouteItemType = {
     path: "my-page",
     element: <MyPage />,
     auth: authRoles.user,
     settings: { page: { title: "My Page" } },
   }

   export default MyPageRoute
   ```

   Routes are discovered automatically via `import.meta.glob` in
   `src/configs/router.tsx` — no central registration needed.
3. Add a nav entry in `src/layouts/components/AppSidebar.tsx`.

## What was removed from app-fe

The domain-specific modules (projects, tasks, kanban board, calendar and their
APIs/types) were stripped out so this stays a clean foundation. The UI kit,
auth, layout and settings infrastructure are unchanged.
