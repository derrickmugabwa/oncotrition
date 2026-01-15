# Quick Fix Reference Guide

## Common Error Patterns & Solutions

### 1. "Property does not exist on type 'never'"

**Cause:** IDE hasn't loaded new database types

**Solution:**
```bash
# Restart TypeScript server
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# OR reload window
Ctrl+Shift+P → "Developer: Reload Window"

# OR close and reopen IDE
```

---

### 2. "Type 'string | null' is not assignable to type 'string'"

**Cause:** Database allows null, but interface doesn't

**Solution A - Update Interface:**
```typescript
// BEFORE
interface BlogPost {
  excerpt: string
  category: string
}

// AFTER
interface BlogPost {
  excerpt: string | null
  category: string | null
}
```

**Solution B - Use Nullish Coalescing:**
```typescript
const excerpt = post.excerpt ?? 'No excerpt available'
const category = post.category ?? 'Uncategorized'
```

**Solution C - Use Database Types:**
```typescript
import type { Database } from '@/types/supabase'
type BlogPost = Database['public']['Tables']['blog_posts']['Row']
```

---

### 3. "Type 'boolean | null' is not assignable to type 'boolean'"

**Solution:**
```typescript
// Update interface
interface NavItem {
  open_in_new_tab: boolean | null  // was: boolean
}

// Use with default
const openInNewTab = item.open_in_new_tab ?? false
```

---

### 4. "Property 'value' does not exist on type..."

**Cause:** Database schema doesn't have the column

**Solution A - Add Column to Database:**
```sql
ALTER TABLE site_settings ADD COLUMN value TEXT;
ALTER TABLE site_settings ADD COLUMN key TEXT;
```

**Solution B - Remove from Code:**
```typescript
// Don't reference non-existent columns
// Use only columns that exist in database
```

---

### 5. "Argument of type 'X' is not assignable to parameter of type 'never'"

**Cause:** Supabase insert/update with wrong types

**Solution:**
```typescript
// Ensure data matches Insert type
const { data, error } = await supabase
  .from('table_name')
  .insert({
    field1: value1,
    field2: value2 ?? null,  // Handle null explicitly
  })
```

---

### 6. JSON Field Type Errors

**Solution:**
```typescript
import type { Json } from '@/types/supabase'

// Cast JSON fields properly
const features = data.features as string[]
const metadata = data.metadata as { [key: string]: any }

// Or define specific type
type Features = {
  name: string
  description: string
}[]

const features = data.features as Features
```

---

### 7. Array Transformation Errors

**Solution:**
```typescript
// Add explicit type annotation
const posts: BlogPost[] = data.map((item): BlogPost => ({
  ...item,
  excerpt: item.excerpt ?? '',
  category: item.category ?? 'Uncategorized'
}))
```

---

## Quick Commands

```bash
# Check errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit path/to/file.tsx

# Count errors
npx tsc --noEmit 2>&1 | Select-String "error TS" | Measure-Object

# Clear caches
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
```

---

## Type Helper Utilities

Create `lib/type-helpers.ts`:

```typescript
import type { Database } from '@/types/supabase'

// Get Row type for any table
export type DbRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

// Get Insert type for any table
export type DbInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

// Get Update type for any table
export type DbUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Make all properties non-nullable
export type NonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

// Make specific properties required
export type RequireFields<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>
}
```

**Usage:**
```typescript
import { DbRow, RequireFields } from '@/lib/type-helpers'

// Use database type directly
type BlogPost = DbRow<'blog_posts'>

// Require specific fields
type BlogPostRequired = RequireFields<DbRow<'blog_posts'>, 'title' | 'content'>
```

---

## Batch Fix Patterns

### Pattern 1: Update All Interfaces in a File
```typescript
// Find all interfaces
interface A { field: string }
interface B { field: string }

// Replace with
interface A { field: string | null }
interface B { field: string | null }
```

### Pattern 2: Add Null Checks
```typescript
// Find: data.field
// Replace with: data.field ?? 'default'
```

### Pattern 3: Update State Setters
```typescript
// Find: setState(data)
// Replace with: setState(data ?? null)
```

---

## Priority Order

1. **Restart IDE** → Fixes ~80 "never" errors immediately
2. **Fix site_settings** → Fixes ~20 errors
3. **Update blog interfaces** → Fixes ~15 errors
4. **Update navigation interfaces** → Fixes ~10 errors
5. **Batch update remaining** → Fixes ~100 errors
6. **Final cleanup** → Fixes remaining errors

**Total Time: ~2.5 hours to zero errors**
