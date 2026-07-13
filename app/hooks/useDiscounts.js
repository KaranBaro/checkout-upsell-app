import { useCallback, useEffect, useState } from "react";

const defaultDiscounts = [];
const LEGACY_STORAGE_KEY = "discounts";

function readLegacyDiscounts() {
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : defaultDiscounts;
    return Array.isArray(parsed) ? parsed : defaultDiscounts;
  } catch {
    return defaultDiscounts;
  }
}

function clearLegacyDiscounts() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures. Store metafields are the source of truth.
  }
}

export default function useDiscounts({ initialDiscounts = defaultDiscounts, onChange } = {}) {
  const [discounts, setDiscountsState] = useState(initialDiscounts);

  useEffect(() => {
    if (initialDiscounts.length > 0) {
      setDiscountsState(initialDiscounts);
      clearLegacyDiscounts();
      return;
    }

    const legacyDiscounts = readLegacyDiscounts();
    setDiscountsState(legacyDiscounts);

    if (legacyDiscounts.length > 0) {
      Promise.resolve(onChange?.(legacyDiscounts))
        .then(clearLegacyDiscounts)
        .catch((error) => {
          console.error("Failed to migrate legacy discounts:", error);
        });
    }
  }, [initialDiscounts, onChange]);

  const setDiscounts = useCallback((nextDiscounts) => {
    setDiscountsState((currentDiscounts) => {
      const resolvedDiscounts =
        typeof nextDiscounts === "function"
          ? nextDiscounts(currentDiscounts)
          : nextDiscounts;

      onChange?.(resolvedDiscounts);
      return resolvedDiscounts;
    });
  }, [onChange]);

  return {
    discounts,
    setDiscounts,
  };
}
