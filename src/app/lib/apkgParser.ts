import JSZip from "jszip";

export interface AnkiCard {
  id: string;
  front: string;
  back: string;
  deck?: string;
  tags?: string[];
  noteType?: string;
}

export interface AnkiDeck {
  name: string;
  cards: AnkiCard[];
}

/**
 * Parses an APKG (Anki Package) file to extract cards
 *
 * CURRENT STATUS: Placeholder implementation
 * - Extracts APKG as ZIP file to verify it's a valid APKG
 * - Creates dummy cards for testing UI
 * - TODO: Implement proper SQLite database parsing
 *
 * The actual parsing of .apkg files requires:
 * 1. Extracting the SQLite database (collection.anki2) from the ZIP
 * 2. Parsing the SQLite database to extract notes and cards
 * 3. Mapping notes to cards based on card templates
 * 4. Extracting deck information and organization
 */
export async function parseApkgFile(file: File): Promise<AnkiDeck[]> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    const files = Object.keys(zipContent.files);
    console.log("APKG contents:", files);

    // Verify this is a valid APKG by checking for collection.anki2
    const hasCollection = files.includes("collection.anki2");

    if (!hasCollection) {
      throw new Error("Invalid APKG file: missing collection.anki2");
    }

    // TODO: Implement proper SQLite parsing
    // For now, create placeholder cards for testing
    const placeholderCards: AnkiCard[] = [
      {
        id: "placeholder-1",
        front: "APKG Import Successful",
        back: `Successfully loaded ${file.name}. Found ${files.length} files including collection.anki2. SQLite parsing not yet implemented.`,
        deck: "Imported Deck",
        tags: ["placeholder"],
        noteType: "Basic",
      },
      {
        id: "placeholder-2",
        front: "Files Found",
        back: `Files in APKG: ${files.join(", ")}`,
        deck: "Imported Deck",
        tags: ["placeholder"],
        noteType: "Basic",
      },
      {
        id: "placeholder-3",
        front: "Next Steps",
        back: "Need to implement SQLite database parsing to extract actual card content from collection.anki2",
        deck: "Imported Deck",
        tags: ["placeholder"],
        noteType: "Basic",
      },
    ];

    return [
      {
        name: file.name.replace(".apkg", ""),
        cards: placeholderCards,
      },
    ];
  } catch (error) {
    console.error("Error parsing APKG file:", error);
    throw new Error("Failed to parse APKG file");
  }
}
