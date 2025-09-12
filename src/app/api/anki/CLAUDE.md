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

**New Plan**: Use AnkiConnect for real-time Anki integration

- **Benefits**: No format parsing, real-time data, reliable access
- **Simpler architecture**: No Python service needed
- **Better UX**: Always current data, seamless integration

---

## Current Implementation: AnkiConnect API

### API Endpoint: `/api/anki`

**Route**: `src/app/api/anki/route.ts`

**Actions Supported**:

- `getDecks` - Get list of decks with metadata
- `getNextCard` - Get next card due for review from specified deck
- `updateCard` - Update card with rating (1-5 scale)

### Request/Response Format

```typescript
// Request format
POST /api/anki
{
  "action": "getDecks" | "getNextCard" | "updateCard",
  "deckName"?: string,    // For getNextCard
  "cardId"?: number,      // For updateCard
  "rating"?: number       // For updateCard (1-5)
}

// Response format
{
  "decks"?: Array<{
    name: string,
    dueCards: number,
    totalCards: number
  }>,
  "card"?: {
    id: number,
    front: string,
    back: string,
    deck: string,
    due: number,
    interval: number,
    ease: number
  },
  "success"?: boolean,
  "error"?: string
}
```

---

## User Flow Implementation

### 1. Deck Selection

```typescript
// Get deck list with metadata
const response = await fetch("/api/anki", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "getDecks" }),
});

// Response: { decks: [{ name: "Programming", dueCards: 5, totalCards: 150 }] }
```

### 2. Card Review

```typescript
// Get next card from selected deck
const response = await fetch("/api/anki", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "getNextCard",
    deckName: "Programming",
  }),
});

// Response: { card: { id: 123, front: "What is...", back: "A closure is..." } }
```

### 3. Card Rating

```typescript
// Update card with rating
const response = await fetch("/api/anki", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "updateCard",
    cardId: 123,
    rating: 3,
  }),
});

// Response: { success: true }
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

- Basic AnkiConnect integration
- Deck listing with metadata
- Card retrieval from specific decks
- Card rating/updating

### 🔄 In Progress

- Error handling and edge cases
- Data transformation and validation
- Integration with existing UI components

### 📋 TODO

- Add card buffering for performance
- Implement AI chat integration with current card
- Add media file handling
- Error recovery and user feedback
- Production deployment considerations

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

- **Hybrid approach**: AnkiConnect for local users, file upload for others
- **Own database**: Import Anki data to our own format for web deployment
- **Multiple backends**: Support both AnkiConnect and standalone modes

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

## Key Decisions

- **AnkiConnect over APKG parsing**: Simpler, more reliable, real-time data
- **Action-based API**: Consistent interface for all Anki operations
- **Local-first approach**: Leverage existing Anki setup, no data migration
- **Gradual enhancement**: Start simple, add features incrementally

---

## What We're NOT Doing

- **Complex format parsing**: Let Anki handle its own data format
- **Media file management**: Focus on text content first
- **Real-time synchronization**: Manual refresh is sufficient for now
- **Multi-user support**: Single-user local setup initially

---

## Next Steps

1. **Complete current implementation**: Finish error handling and edge cases
2. **Integrate with UI**: Connect API to existing review components
3. **Add AI features**: Integrate chat with current card context
4. **Performance optimization**: Add card buffering and caching
5. **Production planning**: Consider deployment and scalability options
