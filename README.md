# AnkiLM

## Product Overview
LLM-powered flashcard application that enhances traditional spaced repetition with AI-driven learning features.

## Core Value Proposition
Traditional flashcard apps with intelligent tutoring capabilities - users can ask questions, get explanations, receive graded feedback, and generate new cards through natural language interaction.

## Target Users
- **Primary**: Individual learners (initially solo developer for personal use, i.e. me)
- **Scale**: Not intended to scale, but should keep potential scalability in mind for architecture decisions. Best case: 1K users/month maximum, optimized for desktop web. ~100 cards/day per user reviewed, O(hundreds) of cards per user total

## Key Features

### LLM Integration (Primary Differentiator)
- **/explain**: Default interaction if no slash command is sent. Chat widget has access to current card content
- **/grade** or **/answer**: Submit free-form answers for AI grading and feedback
  - Example: user sees card: "Which does JS prefer and why: inheritance or composition"
    - User: "/answer composition because everything is objects"
    - LLM: "You've almost got it! Your answer correctly points out __, but misses __. Recommendation: 'Hard'. Would you like a deeper explanation?"
- **/create** or **/add**: Generate new flashcards from conversation context
  - Example: 
    - User: "/create a card about how prototypes work in JS"
    - LLM: [generates front and back of prototype flashcard, opens "add" modal]
- **/update** or **/edit**: Update the current flashcard based on the conversation context
  - Example:
    - User: "/update and add the prototypes explanation to this card"
    - LLM: [generates front and back of prototype flashcard, opens "edit" modal]

### Core Flashcard Functionality
- Traditional spaced repetition algorithm (not reinventing Anki), default is FSRS. Stretch goal is to make this configurable
- Card creation and deck management
- Review sessions with standard grading (Again/Hard/Good/Easy)
- Progress tracking tied to user accounts

### Authentication & Token Management
- Email-based magic link authentication
- User-provided API keys for free LLM usage
- Demo mode with hidden trial key (abuse prevention required)

## Technical Constraints
- Web application (desktop primary, mobile web secondary)
- Offline-first architecture for mobile usage
- Client-side spaced repetition algorithm
- No complex algorithm configuration (keep simple)

## Non-Goals
- Not rebuilding Anki itself
- Not inventing new spaced repetition algorithms
- Not extensive algorithm customization

## Success Metrics
Prototype validation of AI-enhanced learning effectiveness before scaling infrastructure investment.

# Milestones

We'll use a milestone based approach to make sure we're not overbuilding too early.

## Milestone 0 (current milestone)
* Focus on the interaction patterns and chat UI
* Create demo cards baked in code or in a markdown folder (no real storage yet)
* No ability to add or edit cards or decks yet
* No authentication yet
* Small proxy server to handle LLM calls
* Client side state to manage card order
* Focus on implementations for /answer and /explain

## Milestone 0.1
* Build out the demo / landing page which will essentially be the review page built in Mileston 1, but in a constrained way

## Milestone 1
* Focus on building on client side storage and persistent browser sessions so we can implement /create and /update
* Introduce IDB or other browser storage capability
* Add ability to create / edit cards
* Implement /create and /update 

## Milestone 2
* Authentication and backend storage syncing

## Milestone 3
* Abuse prevention and token usage tracking
* Allow people to use their own API keys

# Pages

## Homepage
Decklist, ability to override settings, add cards, import decks, etc. Likely implemented in Milestone 1

## Review Page
Primary UI page and where users will spend most of their time. Card UI on the left, Chat panel on the right. Would be nice to think of a way to make this feel more integrated than just having ChatGPT open next to anki, but fun UI considerations can come later. This should essentially feel like Anki with ChatGPT open in a side by side window

## Browse
Table view of cards, ability to add / edit / search / etc. Likely built in Milestone 1

## Landing page / Demo page
Shows a demo instance of the review page with a premade set of cards. Some abuse prevention concerns, but could just mock the endpoint at first. Built in Milestone 0.1

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

