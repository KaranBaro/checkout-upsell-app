import { useCallback, useEffect, useState } from "react";

const defaultDiscounts = [];

export default function useDiscounts({ onChange } = {}) {
  const [discounts, setDiscountsState] = useState(defaultDiscounts);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("discounts");
      const storedDiscounts = stored ? JSON.parse(stored) : defaultDiscounts;
      setDiscountsState(storedDiscounts);
      onChange?.(storedDiscounts);
    } catch {
      setDiscountsState(defaultDiscounts);
      onChange?.(defaultDiscounts);
    }
  }, [onChange]);

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
