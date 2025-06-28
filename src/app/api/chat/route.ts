import { MessageType } from "@/app/components/Message";
import { Card } from "@/app/hooks/useCard";
import { NextRequest, NextResponse } from "next/server";
import { createStreamSession } from "./stream/route";

export interface ChatRequest {
  messages: MessageType[];
  command: "explain" | "review";
  context: { card: Card };
}

export interface ChatResponse {
  cursor: string;
  streamId: string;
  startedAt: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ChatRequest;
    const { messages, command, context } = body;

    if (messages.length === 0) throw new Error("No messages provided");
    if (messages[messages.length - 1].role !== "user") {
      throw new Error("Last message must be from user");
    }

    // TODO: do something with command (pull from prompt registry or something)
    switch (command) {
      case "explain":
        //TODO:
        break;
      case "review":
        //TODO:
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    const { streamId, startedAt } = createStreamSession({ messages, context });

    const mockResponse: ChatResponse = {
      cursor: messages[messages.length - 1].id,
      streamId,
      startedAt,
    };
    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json({ error: `Error: ${error}` }, { status: 400 });
  }
}
