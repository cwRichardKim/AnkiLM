import { NextResponse } from "next/server";
import { getDecks } from "@/lib/actions/anki";

export async function GET() {
  const result = await getDecks();

  if ("error" in result) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
