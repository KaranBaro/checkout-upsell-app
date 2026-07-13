import { useState, useCallback, useEffect } from "react";

export default function useUpsells({ initialUpsells = [], onChange } = {}) {
  const [upsells, setUpsells] = useState(initialUpsells);
  const [isSavingUpsells, setIsSavingUpsells] = useState(false);
  const [upsellSaveError, setUpsellSaveError] = useState("");

  useEffect(() => {
    setUpsells(Array.isArray(initialUpsells) ? initialUpsells : []);
  }, [initialUpsells]);

  const persistUpsells = useCallback(
    async (nextUpsells, previousUpsells) => {
      if (!onChange) return;

      setIsSavingUpsells(true);
      setUpsellSaveError("");

      try {
        await onChange(nextUpsells);
      } catch (error) {
        setUpsells(previousUpsells);

        const message =
          error?.message || "Failed to save upsells";

        setUpsellSaveError(message);

        console.error("Failed to save upsells:", error);

        throw error;
      } finally {
        setIsSavingUpsells(false);
      }
    },
    [onChange],
  );

  const createUpsell = useCallback(
    async (upsellData) => {
      const previousUpsells = upsells;
      const now = new Date().toISOString();

      const newUpsell = {
        id: `${Date.now()}-${Math.random()}`,
        ...upsellData,
        createdAt: now,
        updatedAt: now,
      };

      const nextUpsells = [...previousUpsells, newUpsell];

      setUpsells(nextUpsells);

      await persistUpsells(nextUpsells, previousUpsells);

      return newUpsell;
    },
    [upsells, persistUpsells],
  );

  const updateUpsell = useCallback(
    async (id, updates) => {
      const previousUpsells = upsells;

      const nextUpsells = previousUpsells.map((upsell) =>
        upsell.id === id
          ? {
              ...upsell,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : upsell,
      );

      setUpsells(nextUpsells);

      await persistUpsells(nextUpsells, previousUpsells);
    },
    [upsells, persistUpsells],
  );

  const deleteUpsell = useCallback(
    async (id) => {
      const previousUpsells = upsells;

      const nextUpsells = previousUpsells.filter(
        (upsell) => upsell.id !== id,
      );

      setUpsells(nextUpsells);

      await persistUpsells(nextUpsells, previousUpsells);
    },
    [upsells, persistUpsells],
  );

  const toggleUpsellStatus = useCallback(
    async (id, newStatus) => {
      await updateUpsell(id, {
        status: newStatus,
      });
    },
    [updateUpsell],
  );

  const getUpsellById = useCallback(
    (id) => {
      return upsells.find((upsell) => upsell.id === id);
    },
    [upsells],
  );

  const getActiveUpsells = useCallback(() => {
    return upsells.filter(
      (upsell) => upsell.status === "Active",
    );
  }, [upsells]);

  const getDraftUpsells = useCallback(() => {
    return upsells.filter(
      (upsell) => upsell.status === "Draft",
    );
  }, [upsells]);

  return {
    upsells,
    isSavingUpsells,
    upsellSaveError,
    createUpsell,
    updateUpsell,
    deleteUpsell,
    toggleUpsellStatus,
    getUpsellById,
    getActiveUpsells,
    getDraftUpsells,
  };
}