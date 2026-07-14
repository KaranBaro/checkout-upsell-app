import PropTypes from "prop-types";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export default function CollectionSelector({
  onCollectionsSelect,
  initialCollections = [],
}) {
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState(
    Array.isArray(initialCollections) ? initialCollections : [],
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setSelectedCollections(
      Array.isArray(initialCollections) ? initialCollections : [],
    );
  }, [initialCollections]);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await fetch(
        `/api/collections?timestamp=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error ||
            `Failed to load collections (${response.status})`,
        );
      }

      setCollections(
        Array.isArray(result.collections)
          ? result.collections
          : [],
      );
    } catch (error) {
      console.error("Failed to load collections:", error);

      setCollections([]);
      setLoadError(
        error?.message ||
          "Failed to load Shopify collections",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const filteredCollections = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return collections;
    }

    return collections.filter((collection) => {
      const title = String(
        collection.title || "",
      ).toLowerCase();

      const handle = String(
        collection.handle || "",
      ).toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        handle.includes(normalizedSearch)
      );
    });
  }, [collections, search]);

  const handleToggleCollection = (collection) => {
    const isSelected = selectedCollections.some(
      (selectedCollection) =>
        selectedCollection.id === collection.id,
    );

    const updatedCollections = isSelected
      ? selectedCollections.filter(
          (selectedCollection) =>
            selectedCollection.id !== collection.id,
        )
      : [...selectedCollections, collection];

    setSelectedCollections(updatedCollections);
    onCollectionsSelect(updatedCollections);
  };

  const clearSelection = () => {
    setSelectedCollections([]);
    onCollectionsSelect([]);
  };

  const getTotalProducts = () => {
    return selectedCollections.reduce(
      (total, collection) =>
        total + Number(collection.productCount || 0),
      0,
    );
  };

  return (
    <div
      style={{
        padding: "16px",
        background: "#f6f6f7",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Select Collections ({selectedCollections.length})
          </h3>

          <p
            style={{
              margin: 0,
              color: "#6d7175",
              fontSize: "13px",
            }}
          >
            Choose the collections whose cart products should
            trigger this upsell.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={loadCollections}
            disabled={isLoading}
            style={{
              padding: "8px 12px",
              border: "1px solid #c9cccf",
              borderRadius: "8px",
              background: "#fff",
              cursor: isLoading
                ? "not-allowed"
                : "pointer",
              fontSize: "13px",
              fontWeight: 600,
              opacity: isLoading ? 0.65 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {isLoading
              ? "Refreshing..."
              : "Refresh Collections"}
          </button>

          {selectedCollections.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              style={{
                padding: "8px 12px",
                border: "1px solid #c9cccf",
                borderRadius: "8px",
                background: "#fff",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search collections by title or handle"
        style={{
          width: "100%",
          boxSizing: "border-box",
          marginBottom: "16px",
          padding: "11px 12px",
          border: "1px solid #c9cccf",
          borderRadius: "8px",
          background: "#fff",
        }}
      />

      {isLoading && (
        <div
          style={{
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            textAlign: "center",
            color: "#6d7175",
            fontSize: "13px",
          }}
        >
          Loading Shopify collections...
        </div>
      )}

      {!isLoading && loadError && (
        <div
          style={{
            padding: "12px",
            background: "#fff4f4",
            border: "1px solid #f3b7b7",
            borderRadius: "8px",
            color: "#8e1f0b",
            fontSize: "13px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            {loadError}
          </div>

          <button
            type="button"
            onClick={loadCollections}
            style={{
              padding: "8px 12px",
              border: "1px solid #c9cccf",
              borderRadius: "8px",
              background: "#fff",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {!isLoading &&
        !loadError &&
        filteredCollections.length === 0 && (
          <div
            style={{
              padding: "20px",
              background: "#fff",
              borderRadius: "8px",
              textAlign: "center",
              color: "#6d7175",
              fontSize: "13px",
            }}
          >
            {search.trim()
              ? "No collections match your search."
              : "No collections were found in this Shopify store."}
          </div>
        )}

      {!isLoading &&
        !loadError &&
        filteredCollections.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {filteredCollections.map((collection) => {
              const isSelected =
                selectedCollections.some(
                  (selectedCollection) =>
                    selectedCollection.id ===
                    collection.id,
                );

              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() =>
                    handleToggleCollection(collection)
                  }
                  style={{
                    padding: "12px",
                    border: isSelected
                      ? "2px solid #005bd3"
                      : "1px solid #c9cccf",
                    borderRadius: "8px",
                    background: isSelected
                      ? "#f1f8ff"
                      : "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    {isSelected ? "✓ " : ""}
                    {collection.title}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        fontSize: "12px",
                        color: "#6d7175",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {collection.handle || "No handle"}
                    </span>

                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#e4e5e7",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {Number(
                        collection.productCount || 0,
                      )}{" "}
                      items
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      {selectedCollections.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#fff",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                margin: 0,
                minWidth: 0,
                fontSize: "13px",
                color: "#6d7175",
              }}
            >
              Selected:{" "}
              {selectedCollections
                .map(
                  (collection) =>
                    collection.title,
                )
                .join(", ")}
            </p>

            <span
              style={{
                flexShrink: 0,
                fontSize: "12px",
                fontWeight: 600,
                background: "#d4f7dc",
                padding: "4px 8px",
                borderRadius: "4px",
                color: "#216534",
              }}
            >
              Total {getTotalProducts()} products
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

CollectionSelector.propTypes = {
  onCollectionsSelect: PropTypes.func.isRequired,
  initialCollections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      handle: PropTypes.string,
      productCount: PropTypes.number,
    }),
  ),
};
