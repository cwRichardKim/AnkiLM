import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { MessageType } from "../app/components/Message";
import type { Card } from "../app/hooks/useCard";

export interface ChatRequest {
  messages: MessageType[];
  command: "explain" | "review";
  context: { card: Card; backHidden: boolean };
}

export type ChatResponseChunk =
  | { type: "metadata"; startedAt: number; cursor: string }
  | { type: "content"; content: string }
  | { type: "done" }
  | { type: "error"; error: string };

function normalizeRealtimeChunk(chunk: OpenAI.Responses.ResponseStreamEvent) {
  switch (chunk.type) {
    case "response.output_text.delta":
      return { content: chunk.delta || "", done: false };
    case "response.completed":
      return { content: "", done: true };
    default:
      return { content: "", done: false };
  }
}

function constructInput(
  messages: MessageType[],
  context: { card: Card; backHidden: boolean },
  command: ChatRequest["command"]
) {
  switch (command) {
    case "explain":
      break;
    case "review":
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }

  const systemPrompt = `You are a helpful assistant that can answer questions about anki cards`;
  const commandPrompt = `You've been asked to help the user understand the card`;
  const contextPrompt = `Context:\nAnki Card:\nFront:\n${context.card.front}\n---\nBack:\n${context.card.back}\n`;
  const hiddenContext = context.backHidden
    ? `The back of the card is currently hidden from the user. Do not reveal the information directly unless the user asks for it.`
    : `The back of the card is currently visible to the user.`;
  const conversation = messages.reduce(
    (acc, message) => acc.concat(`${message.role}: ${message.content}\n`),
    ""
  );
  const messagesPrompt = `Conversation:\n${conversation}`;
  return `${systemPrompt}\n${commandPrompt}\n${contextPrompt}\n${hiddenContext}\n${messagesPrompt}`;
}

export async function handleChat(
  req: NextRequest,
  openAI: OpenAI
): Promise<NextResponse> {
  const body = (await req.json()) as ChatRequest;
  const { messages, command, context } = body;

  if (messages.length === 0) throw new Error("No messages provided");
  if (messages[messages.length - 1].role !== "user") {
    throw new Error("Last message must be from user");
  }

  const input = constructInput(messages, context, command);
  const stream = await openAI.responses.create({
    model: "gpt-4o-mini",
    input,
    stream: true,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const metadata: ChatResponseChunk = {
          type: "metadata",
          startedAt: Date.now(),
          cursor: messages[messages.length - 1].id,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

        for await (const chunk of stream) {
          const normalizedChunk = normalizeRealtimeChunk(chunk);
          if (normalizedChunk.done) {
            const doneEvent: ChatResponseChunk = { type: "done" };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`));
            controller.close();
          } else {
            const contentEvent: ChatResponseChunk = {
              type: "content",
              content: normalizedChunk.content,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentEvent)}\n\n`));
          }
        }
      } catch (error) {
        const errorEvent: ChatResponseChunk = {
          type: "error",
          error: error instanceof Error ? error.message : String(error),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
