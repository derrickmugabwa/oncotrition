# Supabase SSR Migration Progress

## Phase 3 Status: IN PROGRESS

### ✅ Completed Files

1. **proxy.ts** - Migrated to new Supabase SSR middleware pattern
2. **app/(site)/layout.tsx** - Migrated to `createClient()` from server utils
3. **app/(site)/ClientWrapper.tsx** - Migrated to `createClient()` from client utils
4. **app/(site)/about/AboutClientWrapper.tsx** - Migrated to `createClient()` from client utils

### 🔄 Remaining Files (18 files)

#### Client Components (1 file)
- [ ] app/(site)/mentorship/MentorshipClientWrapper.tsx

#### Server Components - Pages (7 files)
- [ ] app/(site)/page.tsx (Homepage)
- [ ] app/(site)/about/page.tsx
- [ ] app/(site)/blog/page.tsx
- [ ] app/(site)/blog/[slug]/page.tsx
- [ ] app/(site)/mentorship/page.tsx
- [ ] app/admin/page.tsx
- [ ] app/terms/page.tsx

#### Server Components - Layouts (1 file)
- [ ] app/admin/layout.tsx

#### Admin Pages (3 files)
- [ ] app/admin/pages/blog/page.tsx
- [ ] app/admin/pages/events/page.tsx
- [ ] app/admin/pages/navbar/page.tsx
- [ ] app/admin/settings/page.tsx

#### Auth Pages (2 files)
- [ ] app/admin/login/page.tsx
- [ ] app/auth/login/page.tsx

#### API Routes (6 files)
- [ ] app/api/admin/mentorship/hero/route.ts
- [ ] app/api/admin/smartspoon/hero/route.ts
- [ ] app/api/init/route.ts
- [ ] app/api/mentorship/features/route.ts
- [ ] app/api/mentorship/features/update/route.ts
- [ ] app/api/mentorship/features-content/route.ts
- [ ] app/auth/signout/route.ts

### Migration Pattern Summary

**Client Components** (`'use client'`):
```typescript
// OLD
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient<Database>();

// NEW
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
```

**Server Components** (pages, layouts):
```typescript
// OLD
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const supabase = createServerComponentClient({ cookies });

// NEW
import { createClient } from '@/utils/supabase/server';
const supabase = await createClient();
```

**API Routes**:
```typescript
// OLD
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const supabase = createRouteHandlerClient({ cookies });

// NEW
import { createClient } from '@/utils/supabase/server';
const supabase = await createClient();
```

### Files to Delete After Migration

- [ ] lib/supabase.ts (old client component client)
- [ ] utils/supabase.ts (old public client)
- [ ] Remove `@supabase/auth-helpers-nextjs` from package.json

### Next Steps

1. Complete remaining client component migrations (1 file)
2. Migrate all server component pages (7 files)
3. Migrate admin pages (4 files)
4. Migrate auth pages (2 files)
5. Migrate API routes (7 files)
6. Delete old utility files
7. Uninstall deprecated package
8. Test build

### Notes

- TypeScript errors in layout.tsx are expected and will resolve after full migration
- All migrations include Next.js 16 async API conversions (await cookies(), etc.)
- Proxy.ts successfully migrated to new pattern with session refresh
