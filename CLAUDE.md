# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Promptor** is a React-based web application for generating and improving prompts for AI models using the Google Gemini API. The app is written in French and provides two main modes: generating new prompts from ideas and improving existing prompts.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

The app requires a Gemini API key:
- Set `GEMINI_API_KEY` in [.env.local](.env.local)
- The Vite config ([vite.config.ts](vite.config.ts)) maps `GEMINI_API_KEY` to `process.env.API_KEY` for the application

## Architecture

### Application State Management

The app uses React hooks for state management, with all state centralized in [App.tsx](App.tsx):

- **Mode state**: Toggles between `Mode.Generate` and `Mode.Improve` ([types.ts](types.ts))
- **History**: Stored in localStorage (max 20 items) and managed through `history` state
- **Suggestions**: AI-generated keyword suggestions organized by category (`SuggestionCategory[]`)
- **UI state**: Loading states, errors, sidebar visibility, and clipboard feedback

### Service Layer

[services/geminiService.ts](services/geminiService.ts) contains all Gemini API integration:

- `generatePrompt(topic, constraints, language)`: Generates detailed prompts from user ideas
- `improvePrompt(existingPrompt, constraints, language)`: Enhances existing prompts
- `getPromptSuggestions(context)`: Returns structured JSON suggestions using Gemini's schema-based responses
- `handleGeminiError(error)`: Centralizes error handling with French user-friendly messages

All functions use the `gemini-2.5-flash` model.

### Component Structure

Components in [components/](components/) are organized as:

- **Layout**: [Header.tsx](components/Header.tsx), [Sidebar.tsx](components/Sidebar.tsx)
- **Input**: [PromptInput.tsx](components/PromptInput.tsx), [LanguageSelector.tsx](components/LanguageSelector.tsx), [ModeSelector.tsx](components/ModeSelector.tsx)
- **Output**: [ResultDisplay.tsx](components/ResultDisplay.tsx), [Suggestions.tsx](components/Suggestions.tsx), [History.tsx](components/History.tsx)
- **UI Elements**: [ActionButton.tsx](components/ActionButton.tsx), [icons.tsx](components/icons.tsx)

All components are functional components using TypeScript with explicit prop interfaces.

### Key User Flows

1. **Generate Mode**: User enters topic → optionally adds constraints/language → clicks "Générer le Prompt" → result displayed with copy button
2. **Improve Mode**: User pastes existing prompt → optionally adds constraints/language → clicks "Améliorer le Prompt" → enhanced version displayed
3. **Suggestions**: User clicks "Obtenir des suggestions" → AI returns categorized keywords → user selects/adds them to input
4. **History**: Generated prompts auto-saved to localStorage → accessible via sidebar → click to load into result area

### Styling

- Uses Tailwind CSS (loaded via CDN in [index.html](index.html))
- Design system: Slate color palette with sky/indigo accent gradients
- Fully responsive with mobile-first breakpoints
- Glassmorphism effects with backdrop-blur and gradient borders

## Technical Notes

- **TypeScript**: Strict typing with interfaces for all props and data structures
- **Vite**: Uses path alias `@/*` resolving to project root (configured in both [vite.config.ts](vite.config.ts) and [tsconfig.json](tsconfig.json))
- **React 19**: Uses new `react-dom/client` API with `createRoot`
- **Error Handling**: All API errors are caught and transformed into French messages via `handleGeminiError`
- **Accessibility**: ARIA labels on interactive elements, focus-visible rings, semantic HTML

## AI Studio Integration

This project was created with Google AI Studio and can be viewed/edited at:
https://ai.studio/apps/drive/1neEUEoKoccYfx9-_qw9h55xqjsb5VPhu

Metadata about the app is stored in [metadata.json](metadata.json).
