import { MessageType } from "@/app/components/Message";
import { Card } from "@/app/hooks/useCard";
import { NextRequest, NextResponse } from "next/server";

export interface ChatRequest {
  messages: MessageType[];
  command: "explain" | "review";
  context: { card: Card };
}

export interface ChatResponse {
  response: string;
  cursor: string;
  id: string;
  timestamp: number;
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

    console.log(
      `Send to OpenAI: ${JSON.stringify(messages)} with context ${JSON.stringify(context)}`
    );

    const mockResponse: ChatResponse = {
      response: `Mock response to ${messages.length} messages`,
      cursor: messages[messages.length - 1].id,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Error: ${error}`,
      },
      {
        status: 400,
      }
    );
  }
}
