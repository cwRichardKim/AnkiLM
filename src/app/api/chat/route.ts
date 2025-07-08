import { MessageType } from "@/app/components/Message";
import { CardType } from "@/app/hooks/useCard";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export interface ChatRequest {
  messages: MessageType[];
  command: "explain" | "grade" | "answer";
  context: { card: CardType; backHidden: boolean };
}

export interface ChatResponse {
  cursor: string;
  streamId: string;
  startedAt: number;
}

export type ChatResponseChunk =
  | {
      type: "metadata";
      startedAt: number;
      cursor: string;
    }
  | {
      type: "content";
      content: string;
    }
  | {
      type: "done";
    }
  | {
      type: "error";
      error: string;
    };

function normalizeRealtimeChunk(chunk: OpenAI.Responses.ResponseStreamEvent) {
  switch (chunk.type) {
    case "response.output_text.delta":
      return { content: chunk.delta || "", done: false };

    // case "response.output_text.done":
    case "response.completed":
      return { content: "", done: true };
    default:
      // Ignore other chunk types (content_part.done, output_item.done, etc.)
      return { content: "", done: false };
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ChatRequest;
    const { messages, command, context } = body;

    if (messages.length === 0) throw new Error("No messages provided");
    if (messages[messages.length - 1].role !== "user") {
      throw new Error("Last message must be from user");
    }

    const input = constructInput(messages, context, command);
    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_LOCAL });
    const stream = await openAI.responses.create({
      model: "gpt-4o-mini",
      input,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send metadata as first SSE event
          const metadata: ChatResponseChunk = {
            type: "metadata",
            startedAt: Date.now(),
            cursor: messages[messages.length - 1].id,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`)
          );

          for await (const chunk of stream) {
            const normalizedChunk = normalizeRealtimeChunk(chunk);
            if (normalizedChunk.done) {
              const doneEvent: ChatResponseChunk = { type: "done" };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`)
              );
              controller.close();
            } else {
              // Send content chunk
              const contentEvent: ChatResponseChunk = {
                type: "content",
                content: normalizedChunk.content,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(contentEvent)}\n\n`)
              );
            }
          }
        } catch (error) {
          // Send error event
          const errorEvent: ChatResponseChunk = {
            type: "error",
            error: error instanceof Error ? error.message : String(error),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
          );
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
  } catch (error) {
    return NextResponse.json({ error: `Error: ${error}` }, { status: 400 });
  }
}

function constructCommandPrompt(
  command: ChatRequest["command"],
  backHidden: boolean
) {
  switch (command) {
    case "explain":
      return `You've been asked to help the user understand the card via the '/explain' command. The back of the card is currently ${backHidden ? "hidden from the user, so avoid referencing it directly unless the user asks for it" : "visible to the user so you may reference it directly"}`;
    case "grade":
    case "answer":
      return `You've been asked to evaluate the user's answer to the card via the '/${command}' command. The back of the card is currently ${backHidden ? "hidden from the user, so avoid directly referencing the answer. Instead, nudge them in the right direction or ask questions that will help them see the gaps." : "visible to the user so you may reference it directly"}`;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
function constructInput(
  messages: MessageType[],
  context: { card: CardType; backHidden: boolean },
  command: ChatRequest["command"]
) {
  const systemPrompt = `You are a helpful assistant that can answer questions about anki cards. Keep your responses concise, no pleasantries are needed. You do not need to mention anki or flashcards unless it is relevant to the user's prompt.`;
  const commandPrompt = constructCommandPrompt(command, context.backHidden);
  const contextPrompt = `Context:\nAnki Card:\nFront:\n${context.card.front}\n---\nBack:\n${context.card.back}\n`;

  const conversation = messages.reduce(
    (acc, message) => acc.concat(`${message.role}: ${message.content}\n`),
    ""
  );
  const messagesPrompt = `Conversation:\n${conversation}`;
  return `${systemPrompt}\n${commandPrompt}\n${contextPrompt}\n${messagesPrompt}`;
}
