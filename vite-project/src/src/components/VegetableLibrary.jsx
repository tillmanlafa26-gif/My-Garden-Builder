import { useEffect, useState } from "react";

import ApiPlantCard from "./ApiPlantCard";

import { searchPlants } from "../services/plantApi";

function VegetableLibrary({
  gardenPlants = [],
  hardinessZone = "",
  onAddPlant,
  onRemovePlant,
}) {
  /* =========================
       RESULTS
    ========================= */

  const [plants, setPlants] = useState([]);

  /* =========================
       SEARCH
    ========================= */

  const [searchInput, setSearchInput] = useState("");

  const [activeSearch, setActiveSearch] = useState("");

  function retryLoad() {
    setReloadToken((current) => current + 1);
  }

  /* =========================
       PAGINATION
    ========================= */

  const [currentPage, setCurrentPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [total, setTotal] = useState(0);

  /* =========================
       STATUS
    ========================= */

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [dataNotice, setDataNotice] = useState("");

  const [reloadToken, setReloadToken] = useState(0);

  /* =========================
       LOAD API
    ========================= */

  useEffect(() => {
    let cancelled = false;

    async function loadPlants() {
      try {
        setLoading(true);

        setError("");

        setDataNotice("");

        const data = await searchPlants(
          activeSearch,
          currentPage,
          hardinessZone,
        );

        if (cancelled) {
          return;
        }

        setPlants(data.plants);

        setLastPage(data.lastPage);

        setTotal(data.total);

        if (data.cacheMeta?.fromCache) {
          setDataNotice(
            data.cacheMeta.offline
              ? "Offline: showing plant results saved from an earlier search."
              : "Live plant data is unavailable, so saved results are being shown."
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Unable to load plant library:", error);

        setError(error.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlants();

    return () => {
      cancelled = true;
    };
  }, [activeSearch, currentPage, hardinessZone, reloadToken]);

  /* =========================
       SEARCH
    ========================= */

  function handleSearch(event) {
    event.preventDefault();

    setCurrentPage(1);

    setActiveSearch(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");

    setActiveSearch("");

    setCurrentPage(1);
  }

  function quickSearch(plantName) {
    setSearchInput(plantName);

    setActiveSearch(plantName);

    setCurrentPage(1);
  }

  /* =========================
       PAGINATION
    ========================= */

  function previousPage() {
    if (currentPage <= 1) {
      return;
    }

    setCurrentPage((current) => current - 1);
  }

  function nextPage() {
    if (currentPage >= lastPage) {
      return;
    }

    setCurrentPage((current) => current + 1);
  }

  /* =========================
       CHECK MY GARDEN
    ========================= */

  function plantIsInGarden(plantId) {
    const plantKey = `perenual:${plantId}`;

    return gardenPlants.some(
      (gardenPlant) => gardenPlant.plantKey === plantKey,
    );
  }

  /* =========================
       RENDER
    ========================= */

  return (
    <section className="vegetable-library">
      <div className="vegetable-library-header">
        <div>
          <h2>🌿 Plant Library</h2>
          {hardinessZone && (
            <div className="library-zone-filter">
              <span>🌡️</span>

              <div>
                <strong>Showing plants for Zone {hardinessZone}</strong>

                <small>Based on your Garden Profile</small>
              </div>
            </div>
          )}

          <p>Search for edible plants to grow in your garden.</p>
        </div>

        {total > 0 && <span>{total.toLocaleString()} results</span>}
      </div>

      {/* SEARCH */}

      <form className="vegetable-search" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search tomato, broccoli, carrot..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {/* ACTIVE SEARCH */}

      {activeSearch && (
        <div className="vegetable-active-search">
          <span>
            Results for: <strong>{activeSearch}</strong>
          </span>

          <button type="button" onClick={clearSearch}>
            Clear
          </button>
        </div>
      )}

      {/* QUICK SEARCH */}

      <div className="vegetable-quick-search">
        <span>Quick search:</span>

        {[
          "tomato",
          "pepper",
          "lettuce",
          "carrot",
          "cucumber",
          "broccoli",
          "onion",
          "spinach",
        ].map((plantName) => (
          <button
            type="button"
            key={plantName}
            onClick={() => quickSearch(plantName)}
          >
            {plantName}
          </button>
        ))}
      </div>

      {dataNotice && (
        <div className="offline-data-notice plant-library-cache-notice" role="status">
          <span>{dataNotice}</span>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="vegetable-loading">
          <span>🌱</span>

          <p>Loading plants...</p>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="vegetable-error">
          <strong>Unable to load plants.</strong>

          <p>{error}</p>

          <button
            type="button"
            className="vegetable-retry-button"
            onClick={retryLoad}
          >
            Try Again
          </button>
        </div>
      )}

      {/* RESULTS */}

      {!loading && !error && (
        <div className="api-plant-list">
          {plants.length > 0 ? (
            plants.map((plant) => (
              <ApiPlantCard
                key={plant.id}
                plant={plant}
                isInGarden={plantIsInGarden(plant.id)}
                onAddPlant={onAddPlant}
                onRemovePlant={onRemovePlant}
              />
            ))
          ) : (
            <div className="no-plants">No plants found.</div>
          )}
        </div>
      )}

      {/* PAGINATION */}

      {!loading && !error && lastPage > 1 && (
        <div className="vegetable-pagination">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={previousPage}
          >
            ← Previous
          </button>

          <span>
            Page {currentPage}
            {" of "}
            {lastPage}
          </span>

          <button
            type="button"
            disabled={currentPage >= lastPage}
            onClick={nextPage}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}

export default VegetableLibrary;
