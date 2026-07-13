import { useCallback, useEffect, useState } from "react";

const defaultDiscounts = [];

export default function useDiscounts({ initialDiscounts = defaultDiscounts, onChange } = {}) {
  const [discounts, setDiscountsState] = useState(initialDiscounts);

  useEffect(() => {
    try {
      if (initialDiscounts.length > 0) {
        localStorage.setItem("discounts", JSON.stringify(initialDiscounts));
        setDiscountsState(initialDiscounts);
        onChange?.(initialDiscounts);
        return;
      }

      const stored = localStorage.getItem("discounts");
      const storedDiscounts = stored ? JSON.parse(stored) : defaultDiscounts;
      setDiscountsState(storedDiscounts);
      if (storedDiscounts.length > 0) {
        onChange?.(storedDiscounts);
      }
    } catch {
      setDiscountsState(initialDiscounts);
    }
  }, [initialDiscounts, onChange]);

  const setDiscounts = useCallback((nextDiscounts) => {
    setDiscountsState((currentDiscounts) => {
      const resolvedDiscounts =
        typeof nextDiscounts === "function"
          ? nextDiscounts(currentDiscounts)
          : nextDiscounts;

      try {
        localStorage.setItem("discounts", JSON.stringify(resolvedDiscounts));
      } catch (error) {
        console.error("Failed to save discounts:", error);
      }

      onChange?.(resolvedDiscounts);
      return resolvedDiscounts;
    });
  }, [onChange]);

  return {
    discounts,
    setDiscounts,
  };
}
