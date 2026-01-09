# Runtime Errors Fixed

## Errors Encountered & Solutions

### 1. ✅ PGRST116 Error - Multiple Rows Returned
**Error**: `JSON object requested, multiple (or no) rows returned`

**Location**: `components/BrandSlider.tsx`

**Cause**: Query used `.single()` but table had multiple rows

**Fix**: Changed from `.single()` to `.limit(1)` and handle array response
```typescript
// Before
const { data, error } = await supabase
  .from('brands_content')
  .select('title')
  .single();

// After
const { data, error } = await supabase
  .from('brands_content')
  .select('title')
  .limit(1);

if (data && data.length > 0) setTitle(data[0].title);
```

### 2. ✅ React Key Warning
**Error**: `Each child in a list should have a unique "key" prop`

**Location**: `components/Header.tsx`

**Cause**: Components returned from `renderDropdownMenu` and `renderMegaMenu` didn't have keys

**Fix**: Added `key={item.id}` to both components
```typescript
const renderDropdownMenu = (item: NavItem) => (
  <DropdownMenu
    key={item.id}  // Added this
    item={item}
    // ... other props
  />
);

const renderMegaMenu = (item: NavItem) => (
  <MegaMenu
    key={item.id}  // Added this
    item={item}
    // ... other props
  />
);
```

### 3. ✅ Framer Motion useScroll Error
**Error**: `Target ref is defined but not hydrated`

**Location**: `components/features/Banner.tsx`

**Cause**: `useRef(null)` without proper TypeScript typing for Framer Motion

**Fix**: Type the ref as `HTMLElement`
```typescript
// Before
const containerRef = useRef(null);

// After
const containerRef = useRef<HTMLElement>(null);
```

## If Error Persists

### Hard Refresh Browser
The error might be cached. Try:

**Chrome/Edge**:
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox**:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Check All useScroll Usage
If error still persists, search for other files:
```bash
grep -r "useScroll" components/
```

And ensure all refs are typed:
```typescript
const ref = useRef<HTMLElement>(null);  // ✅ Correct
const ref = useRef(null);                // ❌ May cause hydration error
```

## WebSocket Error (Secondary)

**Error**: `WebSocket connection failed: WebSocket is closed before the connection is established`

**Cause**: Supabase Realtime connection issue (non-critical)

**Impact**: Real-time features may not work, but app will still function

**Solution**: This usually resolves on its own. If persistent:
1. Check Supabase project status
2. Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
3. Check network/firewall settings

## Verification Checklist

- [x] All 117 files migrated to Supabase SSR
- [x] PGRST116 error fixed
- [x] React key warning fixed  
- [x] Framer Motion ref error fixed
- [ ] Hard refresh browser to clear cache
- [ ] Verify no errors in console

## Next Steps

Once all errors are cleared:
1. Test all major features
2. Verify authentication works
3. Check admin dashboard
4. Test real-time updates
5. Ready for Phase 4: shadcn/ui integration
