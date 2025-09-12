# CLAUDE.md - AnkiConnect Integration Strategy

## Project Overview

Building a real-time Anki integration for AnkiLM using AnkiConnect to provide seamless deck access and card management without the complexity of parsing Anki's internal data formats.

**Core Principle**: Use AnkiConnect as a bridge to Anki's data while building our own UI and AI features on top.

---

## Strategy Shift: From APKG Parsing to AnkiConnect

### Why We Changed Approach

**Original Plan**: Parse .apkg files directly using Python + Anki library

- **Problems**: Media validation errors, collection state issues, format complexity
- **Maintenance burden**: Keeping up with Anki's internal format changes
- **User experience**: Complex error handling and edge cases
- **Deployment complexity**: Required Python service alongside Next.js

**New Plan**: Use AnkiConnect for real-time Anki integration

- **Benefits**: No format parsing, real-time data, reliable access
- **Simpler architecture**: No Python service needed
- **Better UX**: Always current data, seamless integration
- **Local-first**: Leverages existing Anki setup

### Key Decision Points

1. **Format Complexity**: Anki's internal format is complex and changes frequently
2. **Media Handling**: APKG parsing had issues with media file validation
3. **Real-time Data**: AnkiConnect provides live data vs. static file parsing
4. **Maintenance**: AnkiConnect is maintained by the Anki community
5. **User Experience**: No file uploads needed, works with existing Anki setup

---

## Current Architecture: Clean Separation of Concerns with AnkiConnect

### Interface: `anki-service.ts`

**File**: `src/lib/anki-service.ts`

**Purpose**: Single source of truth for all AnkiConnect communication

- **`ankiConnectRequest(action, params?)`** - Core function that handles ALL `localhost:8765` calls
- **Types**: AnkiDeck, AnkiCard, AnkiError, AnkiDeckStats
- **No business logic** - pure infrastructure layer

### Business Logic: Server Actions

**File**: `src/lib/actions/anki/index.ts`

**Purpose**: Server actions for mutations and business operations

- **`getDecks()`** - Get all deck names
- **`getNextCard(deckName)`** - Get next card from deck
- **`updateCard(cardId, rating)`** - Update card with rating (includes revalidation)
- **`getDeckStats(deckName)`** - Get deck statistics

### Data Fetching: API Routes

**File**: `src/app/api/decks/route.ts`

**Purpose**: HTTP endpoints for client-side consumption

- **`GET /api/decks`** - Returns deck list via `ankiConnectRequest("deckNames")`

### Server-Side Rendering: Server Components

**File**: `src/app/decks/DecksList.tsx`

**Purpose**: Server Component for initial data fetching with Suspense

- **Calls API route** for data fetching
- **Suspense integration** for loading states
- **Server-side rendering** for better performance

---

## Architectural Decisions

### Why This Architecture?

1. **Single Source of Truth**: All AnkiConnect calls go through `ankiConnectRequest`
2. **Proper Separation**: Infrastructure vs business logic vs API layer
3. **Easy Removal**: When removing AnkiConnect, only update `anki-service.ts`
4. **No Duplication**: Server actions and API routes use the same core functions
5. **Next.js Best Practices**: Server Components for SSR, API routes for client-side

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Server        │    │   anki-service   │    │   AnkiConnect   │
│   Components    │───▶│   (core comm)    │───▶│   (localhost)   │
│   API Routes    │    │                  │    │                 │
│   Server Actions│    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Current API Endpoints

**`GET /api/decks`**

- **Purpose**: Get list of all deck names
- **Implementation**: Calls `ankiConnectRequest("deckNames")`
- **Response**: `{ decks: string[] }` or `{ error: string }`

### Server Actions Available

**`getDecks()`**

- **Purpose**: Get all deck names
- **Returns**: `{ decks: string[] } | AnkiError`

**`getNextCard(deckName: string)`**

- **Purpose**: Get next card from specified deck
- **Returns**: `{ card: AnkiCard } | AnkiError`

**`updateCard(cardId: string, rating: number)`**

- **Purpose**: Update card with rating (1-5 scale)
- **Features**: Includes `revalidatePath("/review")` for cache invalidation
- **Returns**: `{ card: AnkiCard } | AnkiError`

**`getDeckStats(deckName: string)`**

- **Purpose**: Get deck statistics
- **Returns**: `{ stats: AnkiDeckStats } | AnkiError`

---

## Current Implementation Examples

### 1. Server Component Data Fetching

```typescript
// src/app/decks/DecksList.tsx
export default async function DecksList() {
  // Calls API route for data fetching
  const response = await fetch("/api/decks", { cache: "no-store" });
  const result = await response.json();

  if ("error" in result) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <ul>
      {result.decks.map((deck: string) => (
        <li key={deck}>{deck}</li>
      ))}
    </ul>
  );
}
```

### 2. Server Action Usage

```typescript
// For mutations and business logic
import { getDecks, updateCard } from "@/lib/actions/anki";

// Get decks
const decks = await getDecks();

// Update card with rating
const result = await updateCard("123", 3);
```

### 3. API Route Implementation

```typescript
// src/app/api/decks/route.ts
import { ankiConnectRequest } from "@/lib/anki-service";

export async function GET() {
  try {
    const result = await ankiConnectRequest("deckNames");
    return NextResponse.json({ decks: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 4. Suspense Integration

```typescript
// src/app/decks/page.tsx
export default function DecksPage() {
  return (
    <div>
      <h1>Your Anki Decks</h1>
      <Suspense fallback={<DecksSkeleton />}>
        <DecksList />
      </Suspense>
    </div>
  );
}
```

---

## AnkiConnect Actions Used

### Deck Management

- `deckNames` - Get all deck names
- `findCards` - Find cards by query (e.g., `deck:"Programming" is:due`)

### Card Management

- `cardsInfo` - Get detailed card information
- `answerCard` - Update card with rating/ease

### Query Examples

```typescript
// Get cards due for review in specific deck
{ action: "findCards", params: { query: 'deck:"Programming" is:due' } }

// Get all cards in deck
{ action: "findCards", params: { query: 'deck:"Programming"' } }

// Get cards in learning
{ action: "findCards", params: { query: 'is:learn' } }

// Get cards due today
{ action: "findCards", params: { query: 'is:due prop:due<=1' } }
```

---

## Current Implementation Status

### ✅ Completed

- **Clean Architecture**: Proper separation between infrastructure, business logic, and API layers
- **Single Source of Truth**: All AnkiConnect calls go through `ankiConnectRequest`
- **Server Components**: Initial data fetching with Suspense integration
- **API Routes**: HTTP endpoints for client-side consumption
- **Server Actions**: Business logic with Next.js features (revalidation)
- **Type Safety**: Proper TypeScript interfaces for all operations
- **Error Handling**: Consistent error handling across all layers

### 🔄 In Progress

- **Deck Selection UI**: Basic deck listing implemented
- **Suspense Integration**: Loading states and error boundaries
- **Server-Side Rendering**: Initial page load optimization

### 📋 TODO

- **Card Review Interface**: Implement card display and rating UI
- **AI Chat Integration**: Connect current card context to chat
- **Performance Optimization**: Add caching and buffering
- **Error Recovery**: Better user feedback and retry mechanisms
- **Media Handling**: Support for images and audio in cards
- **Production Deployment**: Consider scalability and deployment options

---

## Technical Considerations

### AnkiConnect Limitations

- **Local only**: Requires Anki desktop running on same machine
- **No real-time queue**: Must manually query for next card
- **No automatic updates**: Changes in Anki don't auto-update our queries

### Workarounds

- **Manual queue management**: Query for next card after each review
- **Error handling**: Graceful fallback when AnkiConnect unavailable
- **User guidance**: Clear instructions for AnkiConnect setup

### Future Scalability

- **Hybrid approach**: AnkiConnect for local users, APKG file upload for others
- **Own database**: Import Anki data to our own format for web deployment
- **Multiple backends**: Support both AnkiConnect and standalone modes
- **Fallback options**: If AnkiConnect fails, fall back to file upload workflow

---

## Development Workflow

### Prerequisites

1. **Anki desktop** installed and running
2. **AnkiConnect plugin** installed (ID: 2055492159)
3. **Next.js dev server** running (`npm run dev`)

### Testing

```bash
# Test deck listing
curl -X POST http://localhost:3000/api/anki \
  -H "Content-Type: application/json" \
  -d '{"action": "getDecks"}'

# Test getting next card
curl -X POST http://localhost:3000/api/anki \
  -H "Content-Type: application/json" \
  -d '{"action": "getNextCard", "deckName": "Programming"}'

# Test updating card
curl -X POST http://localhost:3000/api/anki \
  -H "Content-Type: application/json" \
  -d '{"action": "updateCard", "cardId": 123, "rating": 3}'
```

---

## Integration with Existing Features

### AI Chat Integration

- **Current card context**: Pass current card data to chat API
- **Card modification**: Use AnkiConnect to update cards based on AI suggestions
- **Deck management**: Allow AI to create/modify deck structure

### Review System

- **Spaced repetition**: Leverage Anki's existing scheduling
- **Progress tracking**: Use Anki's built-in statistics
- **Custom review modes**: Add AI-enhanced review options

---

## Production Considerations

### Deployment Options

1. **Local-only**: Users run Anki desktop + our web app
2. **Hybrid**: AnkiConnect for local users, file upload for remote users
3. **Standalone**: Import Anki data to our own database

### User Experience

- **Setup instructions**: Clear AnkiConnect installation guide
- **Fallback options**: Alternative workflows when AnkiConnect unavailable
- **Error messages**: User-friendly error handling and recovery

### Security

- **Local access only**: AnkiConnect only accepts localhost connections
- **No data exposure**: All data stays on user's machine
- **User control**: Users maintain full control over their Anki data

---

## Key Architectural Decisions

### 1. **Single Source of Truth for AnkiConnect**

- **Decision**: All `localhost:8765` calls go through `ankiConnectRequest` in `anki-service.ts`
- **Rationale**: Easy to remove AnkiConnect later, no duplication, consistent error handling

### 2. **Proper Separation of Concerns**

- **Infrastructure**: `anki-service.ts` - pure communication layer
- **Business Logic**: `actions/anki/index.ts` - server actions with Next.js features
- **API Layer**: `api/decks/route.ts` - HTTP endpoints for client consumption
- **UI Layer**: Server Components with Suspense for optimal performance

### 3. **Server Components + Suspense Pattern**

- **Decision**: Use Server Components for initial data fetching with Suspense boundaries
- **Rationale**: Better performance, SEO-friendly, proper loading states

### 4. **API Routes for Client-Side Consumption**

- **Decision**: API routes call `anki-service` directly, not through server actions
- **Rationale**: Server actions are for mutations, API routes are for data fetching

---

## What We're NOT Doing

- **APKG file parsing**: Avoided due to format complexity and maintenance burden
- **Python service**: No need for separate Python backend
- **Complex format parsing**: Let Anki handle its own data format
- **Media file management**: Focus on text content first
- **Real-time synchronization**: Manual refresh is sufficient for now
- **Multi-user support**: Single-user local setup initially
- **Client-side AnkiConnect calls**: All external calls stay server-side

---

## Next Steps

1. **Complete Card Review UI**: Implement card display and rating interface
2. **AI Chat Integration**: Connect current card context to chat system
3. **Performance Optimization**: Add caching and error recovery
4. **Production Planning**: Consider deployment and scalability options
5. **Testing**: Add comprehensive error handling and edge case testing
