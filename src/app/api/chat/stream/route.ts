import { MessageType } from "@/app/components/Message";
import { Card } from "@/app/hooks/useCard";
import OpenAI from "openai";

export interface ChatSession {
  messages: MessageType[];
  context: { card: Card };
  status: "pending" | "streaming" | "complete";
  startedAt: number;
}

// Temporary global store for my purposes, will expand once i introduce auth
const sessions = new Map<string, ChatSession>();

export function createStreamSession(
  session: Omit<ChatSession, "status" | "startedAt">
) {
  const streamId = crypto.randomUUID();
  const startedAt = Date.now();
  sessions.set(streamId, {
    ...session,
    status: "pending",
    startedAt,
  });

  processSession(streamId);

  return { streamId, startedAt };
}

// export async function GET(req: NextRequest): Promise<NextResponse> {}

async function processSession(streamId: string) {
  const session = sessions.get(streamId);
  if (!session) throw new Error(`Session not found: ${streamId}`);

  const { messages, context } = session;

  const input = constructInput(messages, context);

  const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY_LOCAL,
  });
  const response = await openAI.responses.create({
    model: "gpt-4o-mini",
    input,
  });

  console.log(response);
  return response;
}

function constructInput(messages: MessageType[], context: { card: Card }) {
  const systemPrompt = `You are a helpful assistant that can answer questions about anki cards`;
  // TODO: make this dynamic
  const commandPrompt = `You've been asked to help the user understand the card`;
  const contextPrompt = `Context:\nAnki Card:\nFront:\n${context.card.front}\n---\nBack:\n${context.card.back}\n`;
  const conversation = messages.reduce(
    (acc, message) => acc.concat(`${message.role}: ${message.content}\n`),
    ""
  );
  const messagesPrompt = `Conversation:\n${conversation}`;
  return `${systemPrompt}\n${commandPrompt}\n${contextPrompt}\n${messagesPrompt}`;
}
