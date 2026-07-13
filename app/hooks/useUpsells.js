import { useState, useCallback, useEffect } from "react";

export default function useUpsells({ initialUpsells = [], onChange } = {}) {
  const [upsells, setUpsells] = useState(initialUpsells);

  useEffect(() => {
    try {
      if (initialUpsells.length > 0) {
        localStorage.setItem("upsells", JSON.stringify(initialUpsells));
        setUpsells(initialUpsells);
        onChange?.(initialUpsells);
        return;
      }

      const stored = localStorage.getItem("upsells");
      const storedUpsells = stored ? JSON.parse(stored) : [];
      setUpsells(storedUpsells);
      if (storedUpsells.length > 0) {
        onChange?.(storedUpsells);
      }
    } catch {
      setUpsells(initialUpsells);
    }
  }, [initialUpsells, onChange]);

  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem("upsells", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save upsells:", error);
    }

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
    saveToStorage(updated);
    return newUpsell;
  }, [upsells, saveToStorage]);

  const updateUpsell = useCallback((id, updates) => {
    const updated = upsells.map((u) =>
      u.id === id
        ? { ...u, ...updates, updatedAt: new Date().toISOString() }
        : u
    );
    setUpsells(updated);
    saveToStorage(updated);
  }, [upsells, saveToStorage]);

  const deleteUpsell = useCallback((id) => {
    const updated = upsells.filter((u) => u.id !== id);
    setUpsells(updated);
    saveToStorage(updated);
  }, [upsells, saveToStorage]);

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
