const dashboard = document.getElementById("dashboard");
const allTiles = {
  tileexample1: {
    name: "Tile Example 1",
    src: "tiles/tileexample1/index.html"
  },
  tileexample2: {
    name: "Tile Example 2",
    src: "tiles/tileexample2/index.html"
  },
  // Add more here as you create them
};

let currentSettingsTileId = null;

// Load + render tiles
window.addEventListener("DOMContentLoaded", () => {
  loadTiles();
  initSortable();
  setupAddTileMenu();
  setupSettingsModal();
});

function initSortable() {
  Sortable.create(dashboard, {
    animation: 200,
    ghostClass: "opacity-50",
    handle: ".tile-header",
    onEnd: saveLayout
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
          class="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 text-sm rounded-full flex items-center justify-center"
          title="Settings"
          type="button"
        >⚙️</button>
        <button
          onclick="removeTile('${id}')"
          class="bg-red-600 hover:bg-red-700 text-white w-6 h-6 text-sm rounded-full flex items-center justify-center"
          title="Close"
          type="button"
        >×</button>
      </div>
    </div>
    <div class="m-4 p-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <iframe src="${allTiles[id].src}" class="w-full h-60 border-none rounded-xl"></iframe>
    </div>
  `;

  return tile;
}

function saveLayout() {
  const ids = [...dashboard.children].map(tile => tile.id);
  localStorage.setItem("tileOrder", JSON.stringify(ids));

  // Also save tile URLs in case they changed in settings
  const tileSettings = {};
  for (const tile of dashboard.children) {
    const iframe = tile.querySelector("iframe");
    if (iframe) {
      tileSettings[tile.id] = iframe.src;
    }
  }
  localStorage.setItem("tileSettings", JSON.stringify(tileSettings));
}

function loadTiles() {
  const savedOrder = JSON.parse(localStorage.getItem("tileOrder")) || [];
  const savedSettings = JSON.parse(localStorage.getItem("tileSettings")) || {};

  if (savedOrder.length) {
    savedOrder.forEach(id => {
      if (allTiles[id]) {
        const tile = createTile(id);
        // Override iframe src if saved
        if (savedSettings[id]) {
          tile.querySelector("iframe").src = savedSettings[id];
          allTiles[id].src = savedSettings[id];
        }
        dashboard.appendChild(tile);
      }
    });
  } else {
    // Load all tiles if no saved order (optional)
    for (const id in allTiles) {
      dashboard.appendChild(createTile(id));
    }
    saveLayout();
  }
}

// Remove tile with fade out animation
function removeTile(id) {
  const tile = document.getElementById(id);
  if (!tile) return;

  tile.style.opacity = "0";
  setTimeout(() => {
    tile.remove();
    saveLayout();
  }, 300);
}


// Tile Picker UI
function setupAddTileMenu() {
  const addBtn = document.getElementById("addTileBtn");
  const picker = document.getElementById("tilePicker");
  const closePicker = document.getElementById("closePicker");
  const tileList = document.getElementById("tileList");

  // Show Picker
  addBtn.onclick = () => {
    tileList.innerHTML = "";

    const current = new Set([...dashboard.children].map(t => t.id));

    for (const id in allTiles) {
      if (!current.has(id)) {
        const btn = document.createElement("button");
        btn.className = "w-full bg-gray-700 hover:bg-gray-600 p-2 rounded text-left";
        btn.textContent = allTiles[id].name;
        btn.onclick = () => {
          const newTile = createTile(id);
          newTile.style.opacity = "0";
          dashboard.appendChild(newTile);
          // Trigger fade in
          requestAnimationFrame(() => {
            newTile.style.opacity = "1";
          });
          saveLayout();
          picker.classList.add("hidden");
        };
        tileList.appendChild(btn);
      }
    }

    picker.classList.remove("hidden");
  };

  // Close Picker
  closePicker.onclick = () => picker.classList.add("hidden");
}

// Settings Modal logic
function setupSettingsModal() {
  const modal = document.getElementById("settingsModal");
  const urlInput = document.getElementById("settingsUrlInput");
  const cancelBtn = document.getElementById("cancelSettingsBtn");
  const saveBtn = document.getElementById("saveSettingsBtn");

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    currentSettingsTileId = null;
  };

  saveBtn.onclick = () => {
    const newUrl = urlInput.value.trim();
    if (newUrl && currentSettingsTileId) {
      const tile = document.getElementById(currentSettingsTileId);
      const iframe = tile.querySelector("iframe");
      iframe.src = newUrl;
      allTiles[currentSettingsTileId].src = newUrl;
      saveLayout();
    }
    modal.classList.add("hidden");
    currentSettingsTileId = null;
  };
}

// Open settings modal for a tile
function openSettings(id) {
  const modal = document.getElementById("settingsModal");
  const urlInput = document.getElementById("settingsUrlInput");
  const tile = document.getElementById(id);
  if (!tile) return;

  const iframe = tile.querySelector("iframe");
  urlInput.value = iframe.src || allTiles[id].src;
  currentSettingsTileId = id;
  modal.classList.remove("hidden");
}

// Expose removeTile and openSettings to global scope for inline handlers
window.removeTile = removeTile;
window.openSettings = openSettings;
