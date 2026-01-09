# Remaining Supabase SSR Migrations

## Files Migrated So Far (10 files)
✅ proxy.ts
✅ app/(site)/layout.tsx  
✅ app/(site)/ClientWrapper.tsx
✅ app/(site)/about/AboutClientWrapper.tsx
✅ app/(site)/mentorship/MentorshipClientWrapper.tsx
✅ app/(site)/blog/page.tsx
✅ app/(site)/blog/[slug]/page.tsx
✅ app/admin/login/page.tsx
✅ app/admin/layout.tsx
✅ app/admin/page.tsx
✅ app/auth/signout/route.ts

## Remaining Files (12 files)

### Admin Pages (4 files) - Client Components
All follow same pattern: Replace `createClientComponentClient` with `createClient()` from `@/utils/supabase/client`

1. **app/admin/pages/blog/page.tsx**
2. **app/admin/pages/events/page.tsx**
3. **app/admin/pages/navbar/page.tsx**
4. **app/admin/settings/page.tsx**

### Auth Pages (1 file) - Client Component
5. **app/auth/login/page.tsx**

### Server Pages (1 file) - Server Component
6. **app/terms/page.tsx** - Use `createClient()` from `@/utils/supabase/server` with `await`

### API Routes (6 files) - Server Components
All follow same pattern: Replace `createRouteHandlerClient({ cookies })` with `await createClient()` from `@/utils/supabase/server`

7. **app/api/admin/mentorship/hero/route.ts**
8. **app/api/admin/smartspoon/hero/route.ts**
9. **app/api/init/route.ts**
10. **app/api/mentorship/features/route.ts**
11. **app/api/mentorship/features/update/route.ts**
12. **app/api/mentorship/features-content/route.ts**

## Migration Patterns

### Client Component Pattern:
```typescript
// BEFORE
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient<Database>();

// AFTER
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
```

### Server Component/Page Pattern:
```typescript
// BEFORE
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const supabase = createServerComponentClient({ cookies });

// AFTER
import { createClient } from '@/utils/supabase/server';
const supabase = await createClient();
```

### API Route Pattern:
```typescript
// BEFORE
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
}

// AFTER
import { createClient } from '@/utils/supabase/server';
export async function POST(request: Request) {
  const supabase = await createClient();
}
```

## Quick Migration Commands

For each file type, the changes are:

**Client Components** (Admin pages, auth pages):
- Change import: `@supabase/auth-helpers-nextjs` → `@/utils/supabase/client`
- Change call: `createClientComponentClient<Database>()` → `createClient()`

**Server Components** (terms page):
- Change import: Remove `cookies` import, use `@/utils/supabase/server`
- Change call: `createServerComponentClient({ cookies })` → `await createClient()`

**API Routes**:
- Change import: Remove `cookies` import, use `@/utils/supabase/server`
- Remove: `const cookieStore = cookies()` line
- Change call: `createRouteHandlerClient({ cookies: () => cookieStore })` → `await createClient()`

## After All Migrations Complete

1. Delete old utility files:
   - `lib/supabase.ts` (if exists)
   - `utils/supabase.ts` (if exists - NOT the new utils/supabase/ folder!)

2. Uninstall deprecated package:
   ```bash
   npm uninstall @supabase/auth-helpers-nextjs
   ```

3. Run build test:
   ```bash
   npm run build
   ```

4. Commit changes:
   ```bash
   git add .
   git commit -m "Phase 3 complete: Supabase SSR migration"
   ```
