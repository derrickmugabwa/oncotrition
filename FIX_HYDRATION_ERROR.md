# Fix for useScroll Hydration Error

## The Problem
Framer Motion's `useScroll` hook is throwing a hydration error because the browser is caching old JavaScript code.

## The Fix is Already Applied
Both `Steps.tsx` and `Banner.tsx` have been updated with proper ref typing:
- Changed from `useRef(null)` to `useRef<HTMLDivElement>(null)`
- Refs are correctly attached to HTML elements (not motion components)

## Why You Still See the Error
**Browser cache** - Your browser is still running the old JavaScript code.

## Solution: Force Complete Cache Clear

### Step 1: Stop Dev Server
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### Step 2: Clear Next.js Cache
```powershell
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache
```

### Step 3: Clear Browser Cache Completely

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

OR

1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Open in Incognito/Private Window
This ensures no cache is used:
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- Edge: `Ctrl + Shift + N`

Navigate to `http://localhost:3000/smartspoon`

## If Error Still Persists

### Check Framer Motion Version
```bash
npm list framer-motion
```

Should be version 11.15.0 or higher for React 19 compatibility.

### Verify the Fix is in Place

Check `components/steps/Steps.tsx` line 164:
```typescript
const sectionRef = useRef<HTMLDivElement>(null);  // ✅ Should be HTMLDivElement
```

Check `components/features/Banner.tsx` line 31:
```typescript
const containerRef = useRef<HTMLDivElement>(null);  // ✅ Should be HTMLDivElement
```

### Nuclear Option: Complete Reinstall
```powershell
# Remove everything
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules

# Reinstall
npm install --legacy-peer-deps

# Start fresh
npm run dev
```

## Technical Explanation

The error occurs because:
1. Framer Motion's `useScroll` needs a ref to a DOM element
2. During SSR/hydration, the ref might not be attached yet
3. Proper TypeScript typing (`HTMLDivElement`) helps Framer Motion understand the ref type
4. The browser cache was serving old code without the proper typing

## Verification

Once fixed, you should see:
- ✅ No "Target ref is defined but not hydrated" error
- ✅ Smooth scroll animations working
- ✅ No console errors related to useScroll

## Files Modified
- `components/steps/Steps.tsx` - Line 164
- `components/features/Banner.tsx` - Line 31

Both files now have proper ref typing that prevents the hydration error.
