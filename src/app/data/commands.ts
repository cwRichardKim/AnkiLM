export interface Command {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  example?: string;
  implemented?: boolean;
}

export const commands: Command[] = [
  {
    id: "explain",
    name: "explain",
    description: "Get an explanation of the current card",
    longDescription:
      "Ask AnkiLM to explain the concept on the current card in detail, with examples and context.",
    example: "/explain how does this work?",
    implemented: true,
  },
  {
    id: "grade",
    name: "grade",
    description: "Submit an answer for AI grading",
    longDescription:
      "Submit your answer to the card question and get AI-powered feedback with a difficulty recommendation.",
    example: "/grade my answer is...",
    implemented: false,
  },
  {
    id: "answer",
    name: "answer",
    description: "Submit an answer for AI grading",
    longDescription:
      "Submit your answer to the card question and get AI-powered feedback with a difficulty recommendation.",
    example: "/answer my answer is...",
    implemented: false,
  },
  {
    id: "answer-code",
    name: "answer-code",
    description: "Submit code for AI grading",
    longDescription:
      "Submit code as your answer and get AI-powered feedback. Enter becomes newline, Shift+Enter to send.",
    example: "/answer-code function example() { ... }",
    implemented: false,
  },
  {
    id: "create",
    name: "create",
    description: "Generate a new flashcard",
    longDescription:
      "Create a new flashcard based on the conversation context or a specific topic you mention.",
    example: "/create a card about JavaScript closures",
    implemented: false,
  },
  {
    id: "update",
    name: "update",
    description: "Update the current card",
    longDescription:
      "Modify the current card based on the conversation context or your specifications.",
    example: "/update add more examples to this card",
    implemented: false,
  },
  {
    id: "check",
    name: "check",
    description: "Verify card accuracy online",
    longDescription:
      "Use web search to verify if the information on the current card is accurate and up-to-date.",
    example: "/check verify this information",
    implemented: false,
  },
];

export function findCommand(input: string): Command | null {
  if (!input.startsWith("/")) return null;

  const commandName = input.slice(1).split(" ")[0].toLowerCase();
  return commands.find((cmd) => cmd.id === commandName) || null;
}

export function getMatchingCommands(input: string): Command[] {
  if (!input.startsWith("/")) return [];

  const query = input.slice(1).toLowerCase();
  return commands.filter(
    (cmd) =>
      cmd.id.includes(query) ||
      cmd.name.includes(query) ||
      cmd.description.toLowerCase().includes(query)
  );
}
