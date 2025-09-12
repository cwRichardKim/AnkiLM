import { NextResponse } from "next/server";
import { ankiConnectRequest } from "@/lib/anki-service";

export async function GET() {
  try {
    const result = await ankiConnectRequest("deckNames");
    return NextResponse.json({ decks: result });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching decks: ${error}` },
      { status: 500 }
    );
  }
}
