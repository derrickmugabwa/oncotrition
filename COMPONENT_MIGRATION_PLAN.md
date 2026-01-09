# Component Migration Plan

## Status: 92 Components Need Migration

### Discovery
Found **92 component files** still using deprecated `@supabase/auth-helpers-nextjs`:
- All are client components (`'use client'`)
- All use `createClientComponentClient`
- Simple find-and-replace pattern applies to all

### Migration Pattern (Same for All 92 Files)

**Before:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient<Database>();
```

**After:**
```typescript
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
```

### Component Categories

1. **Main Components** (12 files)
   - BrandSlider.tsx
   - Features.tsx
   - Footer.tsx
   - Header.tsx
   - HeroSlider.tsx
   - HomepageMentorship.tsx
   - HomepageSmartspoon.tsx
   - Logo.tsx
   - ModernFeatures.tsx
   - ModernHero.tsx
   - Statistics.tsx
   - Testimonials.tsx

2. **About Components** (8 files)
   - about/Mission.tsx
   - about/Modules.tsx
   - about/Team.tsx
   - about/Values.tsx
   - about/Values.tsx.new
   - about/WhyChooseUs.tsx

3. **Admin Components** (~60 files)
   - admin/* (various tabs and editors)

4. **Other Components** (~12 files)
   - blog, contact, events, features, mentorship, smartspoon, etc.

### Automated Migration Strategy

Since all 92 files follow the same pattern, we can use a PowerShell script:

```powershell
# Find and replace in all component files
$files = Get-ChildItem -Path "components" -Recurse -Include *.tsx,*.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace import
    $content = $content -replace "import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';", "import { createClient } from '@/utils/supabase/client';"
    
    # Replace usage (with Database type)
    $content = $content -replace "createClientComponentClient<Database>\(\)", "createClient()"
    
    # Replace usage (without Database type)
    $content = $content -replace "createClientComponentClient\(\)", "createClient()"
    
    Set-Content $file.FullName $content
}
```

### Manual Migration (Safer Approach)

Given the large number, we should:
1. Start with critical components (Header, Footer, Logo)
2. Then admin components
3. Then remaining components
4. Test after each batch

### Estimated Time
- **Automated**: 5 minutes (risky)
- **Manual (batch)**: 2-3 hours
- **Manual (one-by-one)**: 4-5 hours

### Recommendation

**Option 1: Automated Script** (Fast but risky)
- Run PowerShell script
- Test build immediately
- Fix any issues

**Option 2: Batch Manual** (Balanced)
- Migrate in batches of 10-15 files
- Test after each batch
- Safer but slower

**Option 3: Critical First** (Safest)
- Migrate Header, Footer, Logo first
- Test
- Then continue with rest

Which approach would you prefer?
