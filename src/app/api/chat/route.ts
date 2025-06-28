import { MessageType } from "@/app/components/Message";
import { NextRequest, NextResponse } from "next/server";

export interface ChatRequest {
  messages: MessageType[];
  command: "explain" | "review";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ChatRequest;
    console.log("Received body", body);
    const { messages, command } = body;
    const mockResponse = {
      response: `Mock response to "${messages}"`,
      command: command || "explain",
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
