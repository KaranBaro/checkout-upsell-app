import { useState, useCallback, useEffect } from "react";

const LEGACY_STORAGE_KEY = "upsells";

function readLegacyUpsells() {
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clearLegacyUpsells() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures. Store metafields are the source of truth.
  }
}

export default function useUpsells({ initialUpsells = [], onChange } = {}) {
  const [upsells, setUpsells] = useState(initialUpsells);

  useEffect(() => {
    if (initialUpsells.length > 0) {
      setUpsells(initialUpsells);
      clearLegacyUpsells();
      return;
    }

    const legacyUpsells = readLegacyUpsells();
    setUpsells(legacyUpsells);

    if (legacyUpsells.length > 0) {
      Promise.resolve(onChange?.(legacyUpsells))
        .then(clearLegacyUpsells)
        .catch((error) => {
          console.error("Failed to migrate legacy upsells:", error);
        });
    }
  }, [initialUpsells, onChange]);

  const persistUpsells = useCallback((data) => {
    onChange?.(data);
  }, [onChange]);

  const createUpsell = useCallback((upsellData) => {
    const newUpsell = {
      id: Date.now(),
      ...upsellData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...upsells, newUpsell];
    setUpsells(updated);
    persistUpsells(updated);
    return newUpsell;
  }, [upsells, persistUpsells]);

  const updateUpsell = useCallback((id, updates) => {
    const updated = upsells.map((u) =>
      u.id === id
        ? { ...u, ...updates, updatedAt: new Date().toISOString() }
        : u
    );
    setUpsells(updated);
    persistUpsells(updated);
  }, [upsells, persistUpsells]);

  const deleteUpsell = useCallback((id) => {
    const updated = upsells.filter((u) => u.id !== id);
    setUpsells(updated);
    persistUpsells(updated);
  }, [upsells, persistUpsells]);

  const toggleUpsellStatus = useCallback((id, newStatus) => {
    updateUpsell(id, { status: newStatus });
  }, [updateUpsell]);

  const getUpsellById = useCallback((id) => {
    return upsells.find((u) => u.id === id);
  }, [upsells]);

  const getActiveUpsells = useCallback(() => {
    return upsells.filter((u) => u.status === "Active");
  }, [upsells]);

  const getDraftUpsells = useCallback(() => {
    return upsells.filter((u) => u.status === "Draft");
  }, [upsells]);

  return {
    upsells,
    createUpsell,
    updateUpsell,
    deleteUpsell,
    toggleUpsellStatus,
    getUpsellById,
    getActiveUpsells,
    getDraftUpsells,
  };
}
