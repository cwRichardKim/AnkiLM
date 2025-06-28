import { MessageType } from "@/app/components/Message";
import { Card } from "@/app/hooks/useCard";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export interface ChatSession {
  messages: MessageType[];
  context: { card: Card };
  status: "pending" | "streaming" | "complete";
  startedAt: number;
  chunks: OpenAI.Responses.ResponseStreamEvent[];
  processedText: string;
}

// Temporary global store for my purposes, will expand once i introduce auth
const sessions = new Map<string, ChatSession>();

export function createStreamSession(
  session: Pick<ChatSession, "messages" | "context">
) {
  const streamId = crypto.randomUUID();
  const startedAt = Date.now();
  sessions.set(streamId, {
    ...session,
    status: "pending",
    startedAt,
    chunks: [],
    processedText: "",
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
  const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_LOCAL });
  const stream = await openAI.responses.create({
    model: "gpt-4o-mini",
    input,
    stream: true,
  });

  for await (const chunk of stream) {
    session.status = "streaming";
    session.chunks.push(chunk);
  }

  return stream;
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

export async function DELETE(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (sessionId === "*") {
    sessions.clear();
  } else if (sessionId) {
    sessions.delete(sessionId);
  } else {
    return NextResponse.json(
      { error: "No sessionId provided" },
      { status: 400 }
    );
  }
  return NextResponse.json({ message: "Sessions cleared" });
}
