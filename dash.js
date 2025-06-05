const dashboard = document.getElementById("dashboard");
let currentSettingsTileId = null;

// Load default + custom tiles
let allTiles = {
  tileexample1: {
    name: "Tile Example 1",
    src: "tiles/tileexample1/index.html"
  },
  tileexample2: {
    name: "Tile Example 2",
    src: "tiles/tileexample2/index.html"
  },
};

window.addEventListener("DOMContentLoaded", () => {
  loadCustomTiles();
  loadTiles();
  initSortable();
  setupAddTileMenu();
  setupSettingsModal();
  setupAddCustomTileModal();
});

// 🧩 Load custom tiles from localStorage
function loadCustomTiles() {
  const savedCustom = JSON.parse(localStorage.getItem("customTiles")) || {};
  Object.assign(allTiles, savedCustom);
}

// 🧩 Save custom tiles to localStorage
function saveCustomTiles() {
  const customOnly = Object.fromEntries(
    Object.entries(allTiles).filter(([id]) => id.startsWith("custom_"))
  );
  localStorage.setItem("customTiles", JSON.stringify(customOnly));
}

function initSortable() {
  Sortable.create(dashboard, {
    animation: 200,
    ghostClass: "opacity-50",
    handle: ".tile-header",
    onEnd: saveLayout,
  });
}

function createTile(id) {
  const tile = document.createElement("div");
  tile.className =
    "bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden relative transition-opacity duration-300";
  tile.id = id;

  tile.innerHTML = `
    <div class="tile-header p-4 font-semibold text-lg border-b border-gray-700 flex justify-between items-center text-white cursor-move select-none">
      <span>${allTiles[id].name}</span>
      <div class="flex space-x-2">
        <button
          onclick="openSettings('${id}')"
          class="bg-gray-600 hover:bg-gray-500 text-white w-7 h-7 text-sm rounded-full flex items-center justify-center"
          title="Settings"
          type="button"
        >⚙️</button>
        <button
          onclick="removeTile('${id}')"
          class="bg-red-600 hover:bg-red-700 text-white w-7 h-7 text-sm rounded-full flex items-center justify-center"
          title="Close"
          type="button"
        >×</button>
      </div>
    </div>
    <div class="m-4 p-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <iframe src="${allTiles[id].src}" allow="fullscreen;" class="w-full h-60 border-none rounded-xl"></iframe>
    </div>
  `;
  return tile;
}

function saveLayout() {
  const ids = [...dashboard.children].map((tile) => tile.id);
  localStorage.setItem("tileOrder", JSON.stringify(ids));

  const tileSettings = {};
  for (const tile of dashboard.children) {
    const iframe = tile.querySelector("iframe");
    if (iframe) {
      tileSettings[tile.id] = iframe.src;
    }
  }
  localStorage.setItem("tileSettings", JSON.stringify(tileSettings));
  saveCustomTiles(); // Also save custom tiles
}

function loadTiles() {
  const savedOrder = JSON.parse(localStorage.getItem("tileOrder")) || [];
  const savedSettings = JSON.parse(localStorage.getItem("tileSettings")) || {};

  if (savedOrder.length) {
    savedOrder.forEach((id) => {
      if (allTiles[id]) {
        const tile = createTile(id);
        if (savedSettings[id]) {
          tile.querySelector("iframe").src = savedSettings[id];
          allTiles[id].src = savedSettings[id];
        }
        dashboard.appendChild(tile);
      }
    });
  } else {
    for (const id in allTiles) {
      dashboard.appendChild(createTile(id));
    }
    saveLayout();
  }
}

function removeTile(id) {
  const tile = document.getElementById(id);
  if (!tile) return;

  tile.style.opacity = "0";
  tile.style.scale = "0.95";
  tile.style.pointerEvents = "none";
  tile.style.transition = "scale 0.3s, opacity 0.3s";
  setTimeout(() => {
    tile.remove();
    saveLayout();
  }, 300);
}

function setupAddTileMenu() {
  const addBtn = document.getElementById("addTileBtn");
  const picker = document.getElementById("tilePicker");
  const closePicker = document.getElementById("closePicker");
  const tileList = document.getElementById("tileList");

  addBtn.onclick = () => {
    tileList.innerHTML = "";
    const current = new Set([...dashboard.children].map(t => t.id));

    for (const id in allTiles) {
      if (!current.has(id)) {
        const container = document.createElement("div");
        container.className = "flex items-center justify-between space-x-2";

        const btn = document.createElement("button");
        btn.className = "flex-1 bg-gray-700 hover:bg-gray-600 p-2 rounded text-left";
        btn.textContent = allTiles[id].name;
        btn.onclick = () => {
          const newTile = createTile(id);
          newTile.style.opacity = "0";
          newTile.style.scale = "0.95";
          newTile.style.pointerEvents = "none";
          newTile.style.transition = "scale 0.3s, opacity 0.3s";
          dashboard.appendChild(newTile);
          requestAnimationFrame(() => {
            newTile.style.opacity = "1";
            newTile.style.scale = "1";
            newTile.style.pointerEvents = "auto";
          });
          saveLayout();
          picker.classList.add("hidden");
        };

        container.appendChild(btn);

        // Add delete button for custom tiles
        if (id.startsWith("custom_")) {
          const delBtn = document.createElement("button");
          delBtn.className = "bg-red-600 hover:bg-red-700 text-white w-7 h-7 text-sm rounded-full flex items-center justify-center";
          delBtn.title = "Delete Custom Tile";
          delBtn.type = "button";
          delBtn.textContent = "×";
          delBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Delete custom tile "${allTiles[id].name}" permanently?`)) {
              delete allTiles[id];
              saveCustomTiles();
              const tileElem = document.getElementById(id);
              if (tileElem) tileElem.remove();
              saveLayout();
              setupAddTileMenu(); // Re-render the modal
            }
          };
          container.appendChild(delBtn);
        }

        tileList.appendChild(container);
      }
    }

    // ➕ Custom Tile button - now opens modal
    const customBtn = document.createElement("button");
    customBtn.className =
      "w-full bg-blue-700 hover:bg-blue-600 p-2 rounded text-left font-semibold mt-4";
    customBtn.textContent = "➕ Add Custom Tile";
    customBtn.onclick = () => {
      picker.classList.add("hidden");
      openAddCustomTileModal();
    };
    tileList.appendChild(customBtn);

    picker.classList.remove("hidden");
  };

  closePicker.onclick = () => picker.classList.add("hidden");
}


// --- New Add Custom Tile Modal Logic ---

function setupAddCustomTileModal() {
  const modal = document.getElementById("addCustomTileModal");
  const nameInput = document.getElementById("customTileNameInput");
  const urlInput = document.getElementById("customTileUrlInput");
  const cancelBtn = document.getElementById("cancelAddCustomTileBtn");
  const saveBtn = document.getElementById("saveAddCustomTileBtn");

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    nameInput.value = "";
    urlInput.value = "";
  };

  saveBtn.onclick = () => {
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name) {
      alert("Please enter a tile name.");
      return;
    }
    if (!url) {
      alert("Please enter an iframe URL.");
      return;
    }

    // Create new custom tile
    const id = "custom_" + Date.now();
    allTiles[id] = { name, src: url };

    const tile = createTile(id);
    dashboard.appendChild(tile);
    saveLayout();

    modal.classList.add("hidden");
    nameInput.value = "";
    urlInput.value = "";
  };
}

function openAddCustomTileModal() {
  const modal = document.getElementById("addCustomTileModal");
  modal.classList.remove("hidden");
}

// --- Settings Modal changes ---

function setupSettingsModal() {
  const modal = document.getElementById("settingsModal");
  const urlInput = document.getElementById("settingsUrlInput");
  const nameInput = document.getElementById("settingsNameInput");
  const nameLabel = document.getElementById("settingsNameLabel");
  const cancelBtn = document.getElementById("cancelSettingsBtn");
  const saveBtn = document.getElementById("saveSettingsBtn");

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    currentSettingsTileId = null;
  };

  saveBtn.onclick = () => {
    if (!currentSettingsTileId) return;

    const tile = document.getElementById(currentSettingsTileId);
    const newUrl = urlInput.value.trim();

    // Update iframe src
    if (newUrl) {
      const iframe = tile.querySelector("iframe");
      iframe.src = newUrl;
      allTiles[currentSettingsTileId].src = newUrl;
    }

    // If custom tile, update name
    if (currentSettingsTileId.startsWith("custom_")) {
      const newName = nameInput.value.trim();
      if (newName) {
        allTiles[currentSettingsTileId].name = newName;
        // Update the header title
        const titleSpan = tile.querySelector(".tile-header > span");
        if (titleSpan) titleSpan.textContent = newName;
      }
    }

    saveLayout();
    modal.classList.add("hidden");
    currentSettingsTileId = null;
  };
}

function openSettings(id) {
  const modal = document.getElementById("settingsModal");
  const urlInput = document.getElementById("settingsUrlInput");
  const nameInput = document.getElementById("settingsNameInput");
  const nameLabel = document.getElementById("settingsNameLabel");
  const tile = document.getElementById(id);
  if (!tile) return;

  const iframe = tile.querySelector("iframe");
  urlInput.value = iframe?.src || allTiles[id].src;
  currentSettingsTileId = id;

  if (id.startsWith("custom_")) {
    // Show and populate name input for custom tiles
    nameInput.value = allTiles[id].name;
    nameLabel.classList.remove("hidden");
  } else {
    // Hide name input for default tiles
    nameLabel.classList.add("hidden");
    nameInput.value = "";
  }

  modal.classList.remove("hidden");
}

// Make globally accessible
window.removeTile = removeTile;
window.openSettings = openSettings;
