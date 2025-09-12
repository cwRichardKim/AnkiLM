import { useCallback, useState } from "react";
import {
  getDecks,
  getNextCard,
  updateCard,
  getDeckStats,
} from "@/lib/actions/anki";

export interface UseAnkiActionsReturn {
  // State
  decks: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentCard: any | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDecks: () => Promise<void>;
  fetchNextCard: (deckName: string) => Promise<void>;
  updateCardRating: (cardId: string, rating: number) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchDeckStats: (deckName: string) => Promise<any>;
}

export function useAnkiActions(): UseAnkiActionsReturn {
  const [decks, setDecks] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentCard, setCurrentCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDecks();
      if ("error" in result) {
        setError(result.error);
      } else {
        setDecks(result.decks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextCard = useCallback(async (deckName: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getNextCard(deckName);
      if ("error" in result) {
        setError(result.error);
      } else {
        setCurrentCard(result.card);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCardRating = useCallback(
    async (cardId: string, rating: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await updateCard(cardId, rating);
        if ("error" in result) {
          setError(result.error);
        } else {
          // Card updated successfully, you might want to fetch the next card
          console.log("Card updated successfully");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchDeckStats = useCallback(async (deckName: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDeckStats(deckName);
      if ("error" in result) {
        setError(result.error);
        return null;
      } else {
        return result.stats;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    decks,
    currentCard,
    loading,
    error,
    fetchDecks,
    fetchNextCard,
    updateCardRating,
    fetchDeckStats,
  };
}
