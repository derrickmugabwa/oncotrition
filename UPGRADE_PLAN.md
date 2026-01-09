# Oncotrition Major Upgrade Plan

**Version**: 1.0  
**Date**: January 9, 2025  
**Author**: Development Team  

---

## Executive Summary

This document outlines a comprehensive plan to upgrade the Oncotrition nutrition website with three major improvements:

1. **Next.js 14.0.4 → 16.1.0** (with React 19)
2. **Supabase Auth Helpers → @supabase/ssr** (Modern SSR package)
3. **shadcn/ui Integration** (Complete design system with project builder)

**Estimated Timeline**: 2 weeks  
**Risk Level**: Medium-High  
**Rollback Strategy**: Git branch-based with phase checkpoints

---

## Table of Contents

- [Current State Analysis](#current-state-analysis)
- [Phase 1: Pre-upgrade Preparation](#phase-1-pre-upgrade-preparation)
- [Phase 2: Next.js 16 Upgrade](#phase-2-nextjs-16-upgrade)
- [Phase 3: Supabase SSR Migration](#phase-3-supabase-ssr-migration)
- [Phase 4: shadcn/ui Setup with Project Builder](#phase-4-shadcnui-setup-with-project-builder)
- [Phase 5: Component Migration](#phase-5-component-migration)
- [Phase 6: Testing & Validation](#phase-6-testing--validation)
- [Rollback Plan](#rollback-plan)
- [Success Metrics](#success-metrics)

---

## Current State Analysis

### Dependencies (package.json)

```json
{
  "next": "14.0.4",           // → Upgrading to 16.1.0
  "react": "^18.2.0",         // → Upgrading to 19.0.0
  "react-dom": "^18.2.0",     // → Upgrading to 19.0.0
  "@supabase/auth-helpers-nextjs": "^0.10.0",  // → Removing (deprecated)
  "@supabase/supabase-js": "^2.46.2"           // → Keeping, updating to latest
}
```

### Architecture Overview

- **Total Admin Components**: 57 components
- **Database Migrations**: 72+ migrations
- **Files Using Supabase Auth Helpers**: ~47 files
- **Current Authentication**: Middleware-based with `createMiddlewareClient`
- **UI Framework**: Custom components + Radix UI primitives
- **Styling**: Tailwind CSS with custom design system

### Critical Files Requiring Migration

1. **Authentication Layer**:
   - `middleware.ts` → Will become `proxy.ts` (Next.js 16 requirement)
   - `lib/supabase.ts` (client components)
   - `utils/supabase.ts` (server components)

2. **Server Components** (~29 files):
   - All files using `cookies()`, `headers()`, `params`, `searchParams`
   - Must be converted to async/await pattern

3. **Admin Dashboard** (57 components):
   - Form components (BlogPostEditor, CategoryManager, etc.)
   - Table components (data tables)
   - Modal/Dialog components
   - Input components

---

## Phase 1: Pre-upgrade Preparation

**Duration**: 1 day  
**Priority**: Critical  
**Status**: Pending

### 1.1 Git Workflow Setup

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Pre-upgrade checkpoint: stable state before major upgrades"

# Create backup branch
git checkout -b backup-before-major-upgrade
git push origin backup-before-major-upgrade

# Create working upgrade branch
git checkout main
git checkout -b upgrade-nextjs16-supabase-ssr-shadcn
```

### 1.2 Documentation & Baseline

- [ ] Document current build time
- [ ] Run `npm run build` and save output
- [ ] Document current bundle sizes
- [ ] Take screenshots of critical UI components
- [ ] Export current Lighthouse scores
- [ ] List all environment variables in use
- [ ] Document current authentication flow

### 1.3 Dependency Audit

```bash
# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit

# Review package-lock.json
```

### 1.4 Create Rollback Checklist

- [ ] Database backup strategy confirmed
- [ ] Environment variables documented
- [ ] Build artifacts archived
- [ ] Deployment rollback procedure documented

---

## Phase 2: Next.js 16 Upgrade

**Duration**: 2-3 days  
**Priority**: Critical  
**Status**: Pending

### 2.1 Breaking Changes Overview

#### Critical Breaking Changes:

1. **Async Request APIs** (Affects ~29 files)
   - `cookies()` → `await cookies()`
   - `headers()` → `await headers()`
   - `params` → `await params`
   - `searchParams` → `await searchParams`

2. **Middleware → Proxy Migration**
   - File rename: `middleware.ts` → `proxy.ts`
   - Runtime change: Edge → Node.js only
   - API changes in session handling

3. **React 19 Compatibility**
   - New JSX transform
   - Improved Server Components
   - Better hydration

### 2.2 Upgrade Steps

#### Step 1: Update Dependencies

```bash
# Update package.json
npm install next@16.1.0 react@19.0.0 react-dom@19.0.0

# Update TypeScript types
npm install --save-dev @types/react@19.0.0 @types/react-dom@19.0.0
```

**Updated package.json**:
```json
{
  "dependencies": {
    "next": "^16.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

#### Step 2: Run Official Codemod

```bash
# Run Next.js upgrade codemod
npx @next/codemod@latest upgrade latest
```

**What the codemod handles automatically**:
- ✅ Async Dynamic APIs conversion
- ✅ Turbopack config migration
- ✅ Deprecated API removals
- ✅ `unstable_` prefix removal from stabilized APIs
- ✅ ESLint configuration updates

#### Step 3: Middleware → Proxy Migration

**Before** (`middleware.ts`):
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  // ... auth logic
  return res;
}
```

**After** (`proxy.ts`):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(req: NextRequest) {
  // Will be updated in Phase 3 with new Supabase SSR
  return await updateSession(req);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

#### Step 4: Update next.config.js

**Before**:
```javascript
const nextConfig = {
  experimental: {
    // Any experimental features
  },
  images: {
    // ... existing config
  }
}
```

**After** (if using Turbopack):
```javascript
const nextConfig = {
  turbopack: {
    // Moved from experimental to top-level
  },
  images: {
    // ... existing config
  }
}
```

#### Step 5: Convert Async Request APIs

**Example Migration**:

**Before**:
```typescript
// app/(site)/layout.tsx
export async function generateMetadata() {
  const cookieStore = cookies(); // Synchronous
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  // ...
}
```

**After**:
```typescript
// app/(site)/layout.tsx
export async function generateMetadata() {
  const cookieStore = await cookies(); // Async
  const supabase = await createClient(); // Will update in Phase 3
  // ...
}
```

**Files requiring async conversion** (~29 files):
- `app/(site)/layout.tsx`
- `app/(site)/page.tsx`
- `app/(site)/about/page.tsx`
- `app/(site)/blog/page.tsx`
- `app/(site)/blog/[slug]/page.tsx`
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- All route handlers in `app/api/*`
- All admin pages

### 2.3 Testing Checklist

- [ ] `npm run build` completes without errors
- [ ] All TypeScript errors resolved
- [ ] No runtime errors in development
- [ ] All pages render correctly
- [ ] Navigation works
- [ ] Forms submit properly

### 2.4 Commit Checkpoint

```bash
git add .
git commit -m "Phase 2 complete: Next.js 16 upgrade with React 19"
```

---

## Phase 3: Supabase SSR Migration

**Duration**: 2-3 days  
**Priority**: Critical  
**Status**: Pending

### 3.1 Migration Overview

**Deprecated Package** (Removing):
- `@supabase/auth-helpers-nextjs@0.10.0`

**New Package** (Installing):
- `@supabase/ssr@latest`

**Migration Pattern**:
- `createMiddlewareClient` → `createServerClient` (in proxy)
- `createServerComponentClient` → `createServerClient` (in server components)
- `createClientComponentClient` → `createBrowserClient` (in client components)
- `createRouteHandlerClient` → `createServerClient` (in API routes)

### 3.2 Installation

```bash
# Install new package
npm install @supabase/ssr@latest

# Remove deprecated package
npm uninstall @supabase/auth-helpers-nextjs

# Update Supabase JS to latest
npm install @supabase/supabase-js@latest
```

### 3.3 Create New Utility Files

#### File 1: `utils/supabase/server.ts`

**Purpose**: Server Components & Route Handlers

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - can't set cookies
            // This is expected in Server Components
          }
        },
      },
    }
  )
}
```

#### File 2: `utils/supabase/client.ts`

**Purpose**: Client Components (Browser)

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### File 3: `utils/supabase/middleware.ts`

**Purpose**: Proxy/Middleware (Session Refresh)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return supabaseResponse
}
```

### 3.4 Update proxy.ts

**Complete proxy.ts** (Next.js 16 + Supabase SSR):

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}

export async function proxy(req: NextRequest) {
  // Skip auth check for M-Pesa callback routes
  if (req.nextUrl.pathname.startsWith('/api/mpesa/callback')) {
    return NextResponse.next()
  }

  // Add CORS headers for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const res = NextResponse.next()
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res
  }

  // Update session and handle authentication
  const supabaseResponse = await updateSession(req)

  // Get user from the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll() {
          // Not needed here
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not authenticated and trying to access admin pages (except login)
  if (!user && req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // If user is authenticated and trying to access login page, redirect to admin
  if (user && req.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return supabaseResponse
}
```

### 3.5 Migration Checklist (47 Files)

#### Server Components Migration

**Pattern**:
```typescript
// BEFORE
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabase = createServerComponentClient({ cookies })

// AFTER
import { createClient } from '@/utils/supabase/server'

const supabase = await createClient()
```

**Files to migrate**:
- [ ] `app/(site)/layout.tsx`
- [ ] `app/(site)/page.tsx`
- [ ] `app/(site)/about/page.tsx`
- [ ] `app/(site)/blog/page.tsx`
- [ ] `app/(site)/blog/[slug]/page.tsx`
- [ ] `app/(site)/mentorship/page.tsx`
- [ ] `app/admin/layout.tsx`
- [ ] `app/admin/page.tsx`
- [ ] `app/admin/pages/blog/page.tsx`
- [ ] `app/admin/pages/events/page.tsx`
- [ ] `app/admin/pages/navbar/page.tsx`
- [ ] `app/admin/settings/page.tsx`
- [ ] `app/terms/page.tsx`

#### Client Components Migration

**Pattern**:
```typescript
// BEFORE
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// AFTER
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()
```

**Files to migrate**:
- [ ] `app/(site)/ClientWrapper.tsx`
- [ ] `app/(site)/about/AboutClientWrapper.tsx`
- [ ] `app/(site)/mentorship/MentorshipClientWrapper.tsx`
- [ ] `lib/supabase.ts` (replace entirely)
- [ ] All admin components using Supabase client

#### Route Handlers Migration

**Pattern**:
```typescript
// BEFORE
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  // ...
}

// AFTER
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  // ...
}
```

**Files to migrate**:
- [ ] `app/api/admin/mentorship/hero/route.ts`
- [ ] `app/api/admin/smartspoon/hero/route.ts`
- [ ] `app/api/init/route.ts`
- [ ] `app/api/mentorship/features/route.ts`
- [ ] `app/api/mentorship/features/update/route.ts`
- [ ] `app/api/mentorship/features-content/route.ts`
- [ ] `app/auth/signout/route.ts`
- [ ] All other API routes

### 3.6 Remove Old Files

```bash
# Delete deprecated utility files
rm lib/supabase.ts
rm utils/supabase.ts
```

### 3.7 Testing Checklist

- [ ] Admin login works
- [ ] Session persistence across page refreshes
- [ ] Protected routes redirect correctly
- [ ] Logout functionality works
- [ ] API routes authenticate properly
- [ ] Real-time subscriptions work (if used)
- [ ] No console errors related to Supabase

### 3.8 Commit Checkpoint

```bash
git add .
git commit -m "Phase 3 complete: Supabase SSR migration"
```

---

## Phase 4: shadcn/ui Setup with Project Builder

**Duration**: 1 day  
**Priority**: High  
**Status**: Pending

### 4.1 shadcn/ui Project Builder Overview

**New Feature**: shadcn/ui now offers a visual project builder at [ui.shadcn.com/create](https://ui.shadcn.com/create)

**Customization Options**:
1. **Base Color**: Neutral, Slate, Gray, Zinc, Stone
2. **Theme**: Light, Dark, or System preference
3. **Icon Library**: Lucide (default), Radix Icons
4. **Font**: Inter, Geist, System, Custom
5. **Radius**: None, Small, Default, Medium, Large, Full
6. **Menu Color**: Default, Sidebar, Custom
7. **Menu Accent**: Subtle, Bold

### 4.2 Recommended Configuration for Oncotrition

Based on your nutrition/healthcare focus, here's the recommended theme:

```yaml
Base Color: Slate
  # Professional, clean, medical-friendly
  # Works well with health/nutrition content

Theme: System
  # Respects user preference
  # Provides both light and dark modes

Icon Library: Lucide
  # Already in your dependencies
  # Comprehensive icon set

Font: Inter
  # Modern, highly readable
  # Excellent for health/medical content
  # Great accessibility

Radius: Medium (0.625rem)
  # Balanced between sharp and rounded
  # Professional appearance

Menu Color: Default
  # Clean, consistent with base color

Menu Accent: Subtle
  # Professional, not distracting
```

### 4.3 Using the Project Builder

#### Option A: Interactive Builder (Recommended)

1. Visit [ui.shadcn.com/create](https://ui.shadcn.com/create)
2. Configure settings as recommended above
3. Preview components in real-time
4. Copy generated configuration
5. Download or copy theme CSS

#### Option B: Manual Configuration

If you prefer manual setup, continue with the steps below.

### 4.4 Installation Steps

#### Step 1: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**Interactive Prompts**:
```
✔ Which style would you like to use? › New York
✔ Which color would you like to use as base color? › Slate
✔ Do you want to use CSS variables for colors? › yes
✔ Where is your global CSS file? › app/globals.css
✔ Would you like to use TypeScript (recommended)? › yes
✔ Where is your tailwind.config.js located? › tailwind.config.js
✔ Configure the import alias for components: › @/components
✔ Configure the import alias for utils: › @/lib/utils
✔ Are you using React Server Components? › yes
```

#### Step 2: Review Generated Files

**Created/Modified Files**:
- ✅ `components.json` - Configuration file
- ✅ `lib/utils.ts` - Utility functions (cn helper)
- ✅ `app/globals.css` - Updated with CSS variables
- ✅ `tailwind.config.js` - Updated with shadcn config

#### Step 3: Verify components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 4.5 Custom Theme Configuration

#### Update app/globals.css

**Add Oncotrition Brand Colors** (if needed):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn/ui Slate theme variables */
    --background: oklch(1 0 0);
    --foreground: oklch(0.141 0.005 285.823);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.141 0.005 285.823);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.141 0.005 285.823);
    --primary: oklch(0.21 0.006 285.885);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.967 0.001 286.375);
    --secondary-foreground: oklch(0.21 0.006 285.885);
    --muted: oklch(0.967 0.001 286.375);
    --muted-foreground: oklch(0.552 0.016 285.938);
    --accent: oklch(0.967 0.001 286.375);
    --accent-foreground: oklch(0.21 0.006 285.885);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.92 0.004 286.32);
    --input: oklch(0.92 0.004 286.32);
    --ring: oklch(0.705 0.015 286.067);
    --radius: 0.625rem;

    /* Chart colors */
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);

    /* Sidebar colors */
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.141 0.005 285.823);
    --sidebar-primary: oklch(0.21 0.006 285.885);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.967 0.001 286.375);
    --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
    --sidebar-border: oklch(0.92 0.004 286.32);
    --sidebar-ring: oklch(0.705 0.015 286.067);

    /* Custom Oncotrition brand colors (optional) */
    --brand-primary: oklch(0.55 0.2 150); /* Nutrition green */
    --brand-secondary: oklch(0.65 0.15 200); /* Health blue */
  }

  .dark {
    --background: oklch(0.141 0.005 285.823);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.21 0.006 285.885);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.21 0.006 285.885);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.92 0.004 286.32);
    --primary-foreground: oklch(0.21 0.006 285.885);
    --secondary: oklch(0.274 0.006 286.033);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.274 0.006 286.033);
    --muted-foreground: oklch(0.705 0.015 286.067);
    --accent: oklch(0.274 0.006 286.033);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.552 0.016 285.938);

    /* Chart colors - dark mode */
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);

    /* Sidebar colors - dark mode */
    --sidebar: oklch(0.21 0.006 285.885);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.274 0.006 286.033);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.552 0.016 285.938);
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }
}
```

#### Update tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 4.6 Install Core Components

```bash
# Essential UI components for admin dashboard
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add switch
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
```

**Components Directory Structure**:
```
components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── select.tsx
│   ├── switch.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── separator.tsx
│   ├── textarea.tsx
│   ├── checkbox.tsx
│   ├── radio-group.tsx
│   ├── alert.tsx
│   └── alert-dialog.tsx
└── ... (existing components)
```

### 4.7 Font Setup (Inter)

#### Option A: Next.js Font Optimization (Recommended)

**Update app/layout.tsx**:
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

#### Option B: Google Fonts CDN

**Update app/layout.tsx** (in metadata):
```typescript
export const metadata: Metadata = {
  // ... existing metadata
  other: {
    'google-fonts': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
}
```

### 4.8 Testing Checklist

- [ ] shadcn/ui components render correctly
- [ ] Theme switching works (light/dark)
- [ ] CSS variables applied correctly
- [ ] Font loads properly
- [ ] No styling conflicts with existing components
- [ ] Tailwind classes work as expected

### 4.9 Commit Checkpoint

```bash
git add .
git commit -m "Phase 4 complete: shadcn/ui setup with Slate theme and Inter font"
```

---

## Phase 5: Component Migration

**Duration**: 4-5 days  
**Priority**: High  
**Status**: Pending

### 5.1 Migration Strategy

**Approach**: Gradual, component-by-component migration

**Priority Order**:
1. Admin Dashboard (controlled environment, easier testing)
2. Forms & Inputs (high reusability)
3. Navigation Components (consistency)
4. Public Site Components (gradual rollout)

### 5.2 Admin Dashboard Migration

#### 5.2.1 Form Components

**Target Components**:
- BlogPostEditor
- CategoryManager
- AuthorManager
- TagManager
- EventEditor
- SettingsForm

**Migration Example: BlogPostEditor**

**Before** (Custom):
```tsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-2">
      Title
    </label>
    <input
      type="text"
      className="w-full px-4 py-2 border rounded-lg"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  </div>
  <button className="px-4 py-2 bg-blue-600 text-white rounded">
    Save
  </button>
</div>
```

**After** (shadcn/ui):
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Edit Blog Post</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
    </div>
    <Button>Save</Button>
  </CardContent>
</Card>
```

**Benefits**:
- ✅ Consistent styling
- ✅ Built-in accessibility
- ✅ Responsive by default
- ✅ Dark mode support
- ✅ Better form validation

#### 5.2.2 Table Components

**Target**: Admin data tables (blog posts, categories, authors, etc.)

**Migration Pattern**:
```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

<Table>
  <TableCaption>A list of your blog posts.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Author</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {posts.map((post) => (
      <TableRow key={post.id}>
        <TableCell className="font-medium">{post.title}</TableCell>
        <TableCell>
          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
            {post.status}
          </Badge>
        </TableCell>
        <TableCell>{post.author}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### 5.2.3 Dialog/Modal Components

**Migration Pattern**:
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Delete Post</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the blog post.
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  </DialogContent>
</Dialog>
```

### 5.3 Navigation Components

#### 5.3.1 Header Navigation

**Current**: Custom DropdownMenu and MegaMenu components

**Migration Strategy**: Keep custom logic, use shadcn/ui primitives

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>About</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px]">
          <li>
            <NavigationMenuLink href="/about">
              Our Story
            </NavigationMenuLink>
          </li>
          {/* More items */}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

**Note**: Preserve existing hover behavior and animations

### 5.4 Public Site Components

#### 5.4.1 Cards (Features, Services, etc.)

**Migration Pattern**:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Personalized Nutrition Plans</CardTitle>
    <CardDescription>
      Tailored to your unique health needs
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Get customized meal plans designed specifically for your health goals...</p>
  </CardContent>
</Card>
```

#### 5.4.2 Buttons (CTAs, Forms, etc.)

**Migration Pattern**:
```tsx
import { Button } from "@/components/ui/button"

{/* Primary CTA */}
<Button size="lg">Get Started</Button>

{/* Secondary */}
<Button variant="outline">Learn More</Button>

{/* Ghost */}
<Button variant="ghost">Read More</Button>

{/* With icon */}
<Button>
  <ArrowRight className="mr-2 h-4 w-4" />
  Continue
</Button>
```

### 5.5 Preserve Custom Animations

**Strategy**: Wrap shadcn/ui components with Framer Motion

**Example**:
```tsx
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

const MotionCard = motion(Card)

<MotionCard
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Card content */}
</MotionCard>
```

### 5.6 Component Migration Checklist

#### Admin Components (Priority 1)
- [ ] BlogPostEditor
- [ ] CategoryManager
- [ ] AuthorManager
- [ ] TagManager
- [ ] EventEditor
- [ ] SettingsForm
- [ ] DocumentsTab
- [ ] PackagesTab
- [ ] All admin data tables
- [ ] Admin modals/dialogs

#### Form Components (Priority 2)
- [ ] Contact form
- [ ] Login form
- [ ] Newsletter signup
- [ ] Search inputs

#### Navigation (Priority 3)
- [ ] Header navigation
- [ ] Footer navigation
- [ ] Mobile menu
- [ ] Breadcrumbs

#### Public Site (Priority 4)
- [ ] Feature cards
- [ ] Service cards
- [ ] Team member cards
- [ ] Testimonial cards
- [ ] Blog post cards
- [ ] CTA buttons
- [ ] Hero sections

### 5.7 Testing Each Component

**Checklist per component**:
- [ ] Visual appearance matches design
- [ ] Responsive on all screen sizes
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Dark mode works correctly
- [ ] Animations preserved
- [ ] No console errors
- [ ] Performance not degraded

### 5.8 Commit Strategy

Commit after each major component group:

```bash
# After admin forms
git add .
git commit -m "Migrate admin form components to shadcn/ui"

# After tables
git add .
git commit -m "Migrate admin tables to shadcn/ui"

# After navigation
git add .
git commit -m "Migrate navigation components to shadcn/ui"

# After public site
git add .
git commit -m "Migrate public site components to shadcn/ui"
```

---

## Phase 6: Testing & Validation

**Duration**: 2 days  
**Priority**: Critical  
**Status**: Pending

### 6.1 Build Testing

```bash
# Clean build
rm -rf .next
npm run build

# Check for errors
# Expected output: ✓ Compiled successfully
```

**Success Criteria**:
- [ ] Zero TypeScript errors
- [ ] Zero build errors
- [ ] All pages generate statically (where expected)
- [ ] Bundle size within acceptable range

### 6.2 Functional Testing

#### Authentication Flow
- [ ] Admin login works
- [ ] Session persists across refreshes
- [ ] Protected routes redirect to login
- [ ] Authenticated users can't access login page
- [ ] Logout works correctly
- [ ] Session timeout handled gracefully

#### Admin Dashboard
- [ ] All CRUD operations work
  - [ ] Create blog posts
  - [ ] Update blog posts
  - [ ] Delete blog posts
  - [ ] Manage categories
  - [ ] Manage authors
  - [ ] Manage tags
- [ ] Image uploads work
- [ ] Real-time updates function
- [ ] Forms validate correctly
- [ ] Tables sort/filter properly
- [ ] Modals open/close correctly

#### Public Site
- [ ] Homepage loads
- [ ] About page loads
- [ ] Features page loads
- [ ] SmartSpoon page loads
- [ ] Mentorship page loads
- [ ] Blog listing page loads
- [ ] Individual blog posts load
- [ ] Contact form submits
- [ ] Navigation works (desktop & mobile)
- [ ] Footer links work

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 6.3 Performance Testing

#### Lighthouse Audit

Run Lighthouse on key pages:

```bash
# Homepage
npx lighthouse http://localhost:3000 --view

# Admin dashboard
npx lighthouse http://localhost:3000/admin --view

# Blog page
npx lighthouse http://localhost:3000/blog --view
```

**Target Scores**:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95

#### Core Web Vitals

**Targets**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

#### Bundle Size Analysis

```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

**Compare**:
- Before upgrade bundle size
- After upgrade bundle size
- Ensure no significant increase (>10%)

### 6.4 Accessibility Testing

#### Automated Testing
```bash
# Install axe
npm install --save-dev @axe-core/react

# Run accessibility tests
```

#### Manual Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (NVDA/JAWS)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Form labels properly associated
- [ ] ARIA attributes correct

### 6.5 Visual Regression Testing

**Manual Checklist**:
- [ ] Compare screenshots before/after
- [ ] Check all responsive breakpoints
- [ ] Verify animations work
- [ ] Check dark mode appearance
- [ ] Verify brand colors maintained

### 6.6 Database & API Testing

- [ ] All database queries work
- [ ] Migrations applied correctly
- [ ] RLS policies function
- [ ] API routes respond correctly
- [ ] Real-time subscriptions work
- [ ] File uploads to Supabase storage work

### 6.7 Final Checklist

#### Code Quality
- [ ] No console.log statements in production
- [ ] No commented-out code
- [ ] No unused imports
- [ ] No TypeScript `any` types (where avoidable)
- [ ] Consistent code formatting

#### Documentation
- [ ] README updated
- [ ] Environment variables documented
- [ ] Deployment instructions updated
- [ ] CHANGELOG created

#### Deployment Preparation
- [ ] Environment variables set in production
- [ ] Database migrations ready
- [ ] Build succeeds in production environment
- [ ] Rollback plan documented

---

## Rollback Plan

### Immediate Rollback (During Development)

```bash
# If issues found during any phase
git checkout backup-before-major-upgrade

# Or rollback to specific phase
git log --oneline
git checkout <commit-hash>
```

### Production Rollback

**If deployed and issues found**:

1. **Immediate**: Revert to previous deployment
   ```bash
   # Vercel/Netlify
   # Use platform's rollback feature
   ```

2. **Database**: Restore from backup
   ```bash
   # Supabase dashboard → Backups → Restore
   ```

3. **Code**: Deploy backup branch
   ```bash
   git checkout backup-before-major-upgrade
   git push origin backup-before-major-upgrade --force
   ```

### Rollback Decision Matrix

| Issue Severity | Action | Timeline |
|---------------|--------|----------|
| Critical (site down) | Immediate rollback | < 5 minutes |
| High (major feature broken) | Rollback within hour | < 1 hour |
| Medium (minor feature broken) | Fix forward or rollback | < 4 hours |
| Low (cosmetic issue) | Fix forward | < 24 hours |

---

## Success Metrics

### Technical Metrics

**Build Performance**:
- Build time: < 5 minutes (target)
- Bundle size: No increase > 10%
- TypeScript errors: 0
- ESLint warnings: < 10

**Runtime Performance**:
- Lighthouse Performance: ≥ 90
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Time to Interactive: < 3.5s

**Code Quality**:
- Test coverage: Maintain current level
- TypeScript strict mode: Enabled
- No `any` types: < 5% of codebase
- Accessibility score: ≥ 95

### User Experience Metrics

**Functionality**:
- All features working: 100%
- Authentication success rate: 100%
- Form submission success: 100%
- Image upload success: 100%

**Design Consistency**:
- Component reusability: ≥ 80%
- Design system adherence: 100%
- Dark mode support: 100%
- Responsive design: 100%

### Business Metrics

**Admin Efficiency**:
- Content update time: Maintained or improved
- Admin task completion: 100%
- Error rate: < 1%

**User Engagement**:
- Page load time: Improved
- Bounce rate: Maintained or improved
- User satisfaction: Maintained or improved

---

## Timeline Summary

### Week 1: Foundation & Core Upgrades

| Day | Phase | Tasks | Duration |
|-----|-------|-------|----------|
| 1 | Phase 1 | Preparation, backup, baseline | 1 day |
| 2-3 | Phase 2 | Next.js 16 upgrade | 2 days |
| 4-5 | Phase 3 | Supabase SSR migration | 2 days |

### Week 2: UI Enhancement & Testing

| Day | Phase | Tasks | Duration |
|-----|-------|-------|----------|
| 6 | Phase 4 | shadcn/ui setup | 1 day |
| 7-10 | Phase 5 | Component migration | 4 days |
| 11-12 | Phase 6 | Testing & validation | 2 days |

**Total Duration**: 12 working days (2.4 weeks)

---

## Risk Assessment

### High Risk Items

1. **Supabase Migration** (47 files)
   - **Risk**: Authentication breaking
   - **Mitigation**: Thorough testing, gradual rollout
   - **Rollback**: Keep old auth helpers until verified

2. **Async API Changes** (~29 files)
   - **Risk**: Runtime errors in production
   - **Mitigation**: Use official codemod, extensive testing
   - **Rollback**: Git revert to Phase 1

3. **Middleware → Proxy**
   - **Risk**: Protected routes not working
   - **Mitigation**: Test all auth flows
   - **Rollback**: Restore middleware.ts

### Medium Risk Items

1. **Component Migration**
   - **Risk**: Visual inconsistencies
   - **Mitigation**: Component-by-component testing
   - **Rollback**: Revert specific components

2. **Theme Configuration**
   - **Risk**: Brand colors not matching
   - **Mitigation**: Use project builder, test thoroughly
   - **Rollback**: Restore old CSS

### Low Risk Items

1. **Font Changes**
   - **Risk**: Loading issues
   - **Mitigation**: Use Next.js font optimization
   - **Rollback**: Revert to system fonts

2. **Bundle Size**
   - **Risk**: Increased load times
   - **Mitigation**: Monitor bundle analyzer
   - **Rollback**: Remove unused components

---

## Post-Upgrade Checklist

### Immediate (Day 1)
- [ ] Monitor error logs
- [ ] Check analytics for anomalies
- [ ] Test critical user flows
- [ ] Verify admin functionality

### Short-term (Week 1)
- [ ] Gather user feedback
- [ ] Monitor performance metrics
- [ ] Check SEO rankings
- [ ] Review error rates

### Long-term (Month 1)
- [ ] Analyze performance improvements
- [ ] Document lessons learned
- [ ] Update team documentation
- [ ] Plan next optimizations

---

## Resources & References

### Documentation
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [shadcn/ui Project Builder](https://ui.shadcn.com/create)
- [shadcn/ui Themes](https://ui.shadcn.com/themes)

### Tools
- Next.js Codemod: `npx @next/codemod@latest upgrade latest`
- shadcn/ui CLI: `npx shadcn@latest`
- Bundle Analyzer: `npx @next/bundle-analyzer`
- Lighthouse: `npx lighthouse`

### Support
- Next.js Discord: [discord.gg/nextjs](https://discord.gg/nextjs)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- shadcn/ui Discord: [discord.gg/shadcn](https://discord.gg/shadcn)

---

## Appendix

### A. Environment Variables Checklist

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### B. Database Migration Notes

No database schema changes required for this upgrade.
All changes are frontend/framework-level.

### C. Deployment Configuration

**Vercel** (if using):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### D. Team Communication

**Stakeholders to notify**:
- Development team
- QA team
- Product owner
- DevOps team
- End users (if downtime expected)

**Communication plan**:
- Pre-upgrade: 1 week notice
- During upgrade: Real-time updates
- Post-upgrade: Summary report

---

## Conclusion

This upgrade plan provides a comprehensive, step-by-step approach to modernizing the Oncotrition website with:

1. **Next.js 16** - Latest features, better performance
2. **Supabase SSR** - Modern authentication, better DX
3. **shadcn/ui** - Consistent design system, accessibility

**Key Success Factors**:
- Thorough testing at each phase
- Git-based rollback strategy
- Component-by-component migration
- Performance monitoring
- User feedback integration

**Expected Outcomes**:
- ✅ Faster build times
- ✅ Better developer experience
- ✅ Consistent UI/UX
- ✅ Improved accessibility
- ✅ Modern codebase
- ✅ Easier maintenance

---

**Document Version**: 1.0  
**Last Updated**: January 9, 2025  
**Next Review**: After Phase 3 completion
