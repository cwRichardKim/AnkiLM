import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@/lib/openai";
import { handleChat } from "@/lib/chat";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const openAI = createOpenAI();
    return await handleChat(req, openAI);
  } catch (error) {
    return NextResponse.json({ error: `Error: ${error}` }, { status: 400 });
  }
}
