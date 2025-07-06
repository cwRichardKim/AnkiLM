import { useState } from "react";
import { AnkiDeck, parseApkgFile } from "../lib/apkgParser";

/**
 * Hook for handling APKG file uploads
 * Simple implementation with placeholder parsing
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDecks, setUploadedDecks] = useState<AnkiDeck[]>([]);

  const uploadApkgFile = async (file: File) => {
    if (!file.name.endsWith(".apkg")) {
      setUploadError("Please select a valid .apkg file");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const decks = await parseApkgFile(file);
      setUploadedDecks(decks);

      console.log("Successfully uploaded:", decks);
      return decks;
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".apkg";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadApkgFile(file);
      }
    };
    input.click();
  };

  return {
    handleFileSelect,
    isUploading,
    uploadError,
    uploadedDecks,
  };
}
