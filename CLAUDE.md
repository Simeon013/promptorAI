# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Promptor** is a modern SaaS application built with Next.js 15 for generating and improving prompts for AI models using the Google Gemini API. The app is written in French and is being developed as a complete SaaS platform with authentication, database, and subscription features.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands (Prisma)
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma Client

# Code quality
npm run lint         # Run ESLint
```

## Environment Setup

Create a `.env.local` file based on `.env.example`:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Database (Phase 2+)
DATABASE_URL=postgresql://...

# Auth (Phase 2+)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe (Phase 3+)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Architecture

### Tech Stack

**Frontend:**
- Next.js 15 (App Router, Server Components, API Routes)
- TypeScript (strict mode)
- Tailwind CSS + Shadcn/ui
- TanStack Query (planned for Phase 2)
- Zustand (planned for state management)

**Backend:**
- Next.js API Routes (serverless)
- Prisma ORM
- PostgreSQL (via Supabase, planned)
- Redis (planned for caching)

**External Services:**
- Google Gemini AI
- Clerk (auth, planned)
- Stripe (payments, planned)
- Vercel (hosting)

### Project Structure

```
promptor/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with dark theme
│   ├── globals.css          # Global Tailwind styles
│   ├── page.tsx             # Home page (client component)
│   ├── (auth)/              # Auth routes (planned)
│   ├── (dashboard)/         # Dashboard routes (planned)
│   ├── (marketing)/         # Marketing pages (planned)
│   └── api/                 # API Routes
│       ├── generate/        # Prompt generation & improvement
│       └── suggestions/     # AI suggestions
├── components/
│   ├── ui/                  # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── textarea.tsx
│   │   └── card.tsx
│   ├── prompt/              # Prompt-specific components (planned)
│   ├── workspace/           # Workspace components (planned)
│   └── shared/              # Shared components (planned)
├── lib/
│   ├── ai/
│   │   └── gemini.ts        # Gemini AI service
│   ├── db/
│   │   ├── schema.prisma    # Database schema
│   │   └── prisma.ts        # Prisma client
│   ├── auth/                # Clerk config (planned)
│   ├── stripe/              # Stripe integration (planned)
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript types
├── config/
│   ├── site.ts              # Site configuration
│   └── plans.ts             # Subscription plans
├── hooks/                   # Custom React hooks (planned)
└── public/                  # Static assets
```

### API Routes Architecture

**[app/api/generate/route.ts](app/api/generate/route.ts)**
- Handles both generation and improvement modes
- Validates input on server-side
- Calls Gemini API with proper error handling
- Returns JSON response

**[app/api/suggestions/route.ts](app/api/suggestions/route.ts)**
- Generates contextual keyword suggestions
- Uses Gemini's structured JSON output
- Returns categorized suggestions

### Service Layer

**[lib/ai/gemini.ts](lib/ai/gemini.ts)** contains all Gemini API integration:

- `generatePrompt(topic, constraints, language)`: Generates detailed prompts from user ideas
- `improvePrompt(existingPrompt, constraints, language)`: Enhances existing prompts
- `getPromptSuggestions(context)`: Returns structured JSON suggestions using Gemini's schema-based responses
- `handleGeminiError(error)`: Centralizes error handling with French user-friendly messages

All functions use the `gemini-2.5-flash` model.

### Database Schema

**[lib/db/schema.prisma](lib/db/schema.prisma)** defines the complete data model:

- **User**: Authentication, subscriptions, quotas
- **Prompt**: Generated/improved prompts with versioning
- **Workspace**: Team collaboration (planned)
- **WorkspaceMember**: RBAC permissions
- **ApiKey**: Developer API access
- **UsageHistory**: Analytics tracking

### Key User Flows

1. **Generate Mode**: User enters topic → optionally adds constraints/language → clicks "Générer le Prompt" → API call to `/api/generate` → result displayed with copy button
2. **Improve Mode**: User pastes existing prompt → optionally adds constraints/language → clicks "Améliorer le Prompt" → API call to `/api/generate` → enhanced version displayed
3. **Suggestions**: User clicks "Obtenir des suggestions" → API call to `/api/suggestions` → AI returns categorized keywords → user selects/adds them to input

### Styling

- Tailwind CSS with custom dark theme
- Shadcn/ui component library
- Design system: CSS variables for colors ([app/globals.css](app/globals.css))
- Fully responsive with mobile-first breakpoints
- Consistent spacing and typography

### State Management

**Current (Phase 1):**
- React hooks (useState, useCallback)
- No global state (planned with Zustand)
- No server state caching (planned with TanStack Query)

**Planned (Phase 2+):**
- Zustand for global UI state
- TanStack Query for server state and caching
- Optimistic updates for better UX

## Technical Notes

- **TypeScript**: Strict mode with noUncheckedIndexedAccess
- **Next.js**: App Router with Server/Client Components separation
- **API Security**: API keys never exposed to client (server-side only)
- **Error Handling**: All API errors are caught and transformed into French messages
- **Accessibility**: ARIA labels on interactive elements, focus-visible rings, semantic HTML
- **Path Alias**: `@/*` resolves to project root (configured in [tsconfig.json](tsconfig.json))

## Subscription Plans

Defined in [config/plans.ts](config/plans.ts):

- **Free**: 10 prompts/month, 7 days history, Gemini Flash
- **Starter** (9€/month): 100 prompts/month, 30 days history, API access
- **Pro** (29€/month): Unlimited prompts, all AI models, 5 workspaces
- **Enterprise** (custom): Unlimited everything, custom AI models, SSO, on-premise

## Migration Status

This project was recently migrated from Vite to Next.js 15. See [MIGRATION.md](MIGRATION.md) for details.

**Phase 1**: ✅ Completed
- Next.js 15 setup
- Tailwind CSS + Shadcn/ui
- API Routes for Gemini
- Basic UI components

**Phase 2**: 🔄 Planned (Auth & Database)
**Phase 3**: 🔄 Planned (Stripe Payments)
**Phase 4**: 🔄 Planned (Dashboard)
**Phase 5**: 🔄 Planned (Workspaces)
**Phase 6**: 🔄 Planned (Public API)

## Additional Documentation

- [README.md](README.md) - Project overview and features
- [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start guide
- [MIGRATION.md](MIGRATION.md) - Detailed migration guide
- [.env.example](.env.example) - Environment variables template

## Original AI Studio Integration

This project was originally created with Google AI Studio:
https://ai.studio/apps/drive/1neEUEoKoccYfx9-_qw9h55xqjsb5VPhu

Metadata about the original app is stored in [metadata.json](metadata.json).
