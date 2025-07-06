import { useEffect, useState } from "react";

export type FormFactor = "WIDE" | "COMPACT";

export function useFormFactor(): FormFactor {
  const [formFactor, setFormFactor] = useState<FormFactor>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 500px)").matches
      ? "COMPACT"
      : "WIDE"
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 500px)");
    const update = () => setFormFactor(media.matches ? "COMPACT" : "WIDE");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return formFactor;
}
