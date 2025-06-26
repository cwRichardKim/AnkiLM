import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { message, cardContext, command } = body;
    const mockResponse = {
      response: `Mock response to "${message} ${cardContext}"`,
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
