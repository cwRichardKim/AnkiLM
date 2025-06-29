import { Card } from "../hooks/useCard";

export const cards: Card[] = [
  {
    id: "card-1",
    front: "What does HTML stand for?",
    back: "HyperText Markup Language",
  },
  {
    id: "card-2",
    front: "What is the primary purpose of CSS?",
    back: "Styling and layout of web pages",
  },
  {
    id: "card-3",
    front: "What is a closure in JavaScript?",
    back: "A function that has access to variables in its outer scope",
  },
  {
    id: "card-4",
    front: "What is the difference between let and var in JavaScript?",
    back: "let has block scope, var has function scope",
  },
  {
    id: "card-5",
    front: "What is the purpose of the 'use strict' directive?",
    back: "To enable strict mode which catches common coding mistakes",
  },
  {
    id: "card-6",
    front: "Reverse index",
    back: `\`\`\`ts
{
  term: string;
  postings: Array [{
    score: number; // relevance, tf-idf, boosted by user behavior, etc.
    type: 'help' | 'listing' | 'location';
    id: string; // document ID (or opaque lookup key)
    fields: { 
      /* minimal renderable subset */ 
      title: string; url: string; asset?: string; 
    }
    data: { /* optional type-specific data */ }
  }]
}
\`\`\``,
  },
];
