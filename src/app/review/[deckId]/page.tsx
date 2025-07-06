"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { use } from "react";
import ReviewLayout from "../../components/ReviewLayout";
import useCard from "../../hooks/useCard";
import { useFileUpload } from "../../hooks/useFileUpload";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const { currentCard, reviewCard, backHidden, setBackHidden } =
    useCard(deckId);
  const { handleFileSelect, isUploading, uploadError, uploadedDecks } =
    useFileUpload();

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading deck...</h2>
          <p className="text-gray-600">Deck ID: {deckId}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Upload UI */}
      <div className="flex flex-row w-full p-4 justify-center gap-4">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload APKG"}
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleFileSelect}>
                From APKG file
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* Show upload status */}
      {uploadError && (
        <div className="text-red-500 text-center p-2 bg-red-50 border border-red-200 rounded">
          {uploadError}
        </div>
      )}

      {uploadedDecks.length > 0 && (
        <div className="text-green-600 text-center p-2 bg-green-50 border border-green-200 rounded">
          Successfully uploaded {uploadedDecks.length} deck(s) with{" "}
          {uploadedDecks.reduce((total, deck) => total + deck.cards.length, 0)}{" "}
          cards. (Note: Currently showing placeholder cards)
        </div>
      )}

      {/* Card Review */}
      <ReviewLayout
        card={currentCard}
        reviewCard={reviewCard}
        backHidden={backHidden}
        revealBack={() => setBackHidden(false)}
      />
    </div>
  );
}
