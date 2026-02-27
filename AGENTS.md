# AGENTS.md - Development Guidelines for Norsec.dev

## Build Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 5173 by default)
npm run dev

# Production build (outputs to dist/)
npm run build

# TypeScript type checking
npm run check
```

Note: No test framework is currently configured. To add tests, consider installing Vitest or Jest.

---

## Project Architecture

This project uses **Cloudflare Pages** with **Cloudflare Workers** for the API.

```
client/                 # Frontend React application
├── src/
│   ├── components/    # UI components
│   ├── pages/        # Page components
│   ├── lib/          # Utilities
│   └── hooks/        # Custom hooks
└── index.html

functions/             # Cloudflare Workers API
├── api/              # API handlers (breaches, conferences)
└── middleware/       # Rate limiting
```

---

## Code Style Guidelines

### TypeScript Configuration
- Project uses **strict mode** (`tsconfig.json`)
- **NoEmit** is enabled - no compiled output from tsc
- Use TypeScript for all new code; avoid `any` when possible
- Use type inference; explicit types only when necessary for clarity

### React Patterns
- Use **functional components** with hooks
- Use **TanStack Query** (`@tanstack/react-query`) for data fetching
- Use **`useToast`** hook from `@/hooks/use-toast` for user feedback
- Use **shadcn/ui** components from `@/components/ui/` when available
- Use **`lucide-react`** for icons

### Import Conventions
```typescript
// React/router imports first
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Third-party UI/library imports
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";

// Local component imports (use @ alias)
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

// Local utilities/lib imports
import { queryClient } from "./lib/queryClient";

// Type imports (separate if many)
import type { BreachEvent } from "./types";
```

### Naming Conventions
- **Components**: PascalCase (`BreachTracker.tsx`, `Navigation.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMobile.tsx`, `useToast.ts`)
- **Utilities**: camelCase (`queryClient.ts`, `utils.ts`)
- **Types/Interfaces**: PascalCase (`BreachEvent`, `ConferenceEvent`)
- **Files with components**: PascalCase (`.tsx`)
- **Files with only types/utilities**: camelCase (`.ts`)

### Tailwind CSS Usage
- Use **`cn()`** utility from `@/lib/utils` to merge Tailwind classes
- Follow custom theme colors: `text-norsec-primary`, `text-norsec-secondary`, `bg-norsec-light`, `text-norsec-dark`
- Use responsive prefixes: `md:`, `lg:`, `xl:`

### Error Handling

**Frontend (React)**:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/breaches'],
});

if (error) {
  return <ErrorDisplay />;
}
```

**Cloudflare Workers** (functions/api/*.ts):
```typescript
export async function onRequest(context: any): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    // ... handler code
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown"
    }), { status: 500, headers: corsHeaders });
  }
}
```

### API Response Patterns

All API responses must include CORS headers:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

// Success
return new Response(JSON.stringify(data), { headers: corsHeaders });

// Error
return new Response(JSON.stringify({ error: "..." }), { status: 500, headers: corsHeaders });
```

### Date Handling
- Use **date-fns** library for all date operations
- API data uses **ISO 8601** format (YYYY-MM-DD)
- Parse with `parseISO()` and validate with `isValid()`
- Use `normalizeToISODate()` function in API handlers for date normalization

### Environment Variables
- `GOOGLE_SHEETS_API_KEY` - API key for Google Sheets data fetching
- Configure in Cloudflare Pages dashboard for production

### Rate Limiting
Use the `RateLimiter` class from `functions/middleware/rate-limiter.ts` for API endpoints.

### Caching
- Use KV namespaces for caching API responses
- Available bindings: `BREACH_CACHE`, `CONFERENCE_CACHE`
