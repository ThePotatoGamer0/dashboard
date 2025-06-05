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

// Load + render tiles
window.addEventListener("DOMContentLoaded", () => {
  loadTiles();
  initSortable();
  setupAddTileMenu();
});

function initSortable() {
  Sortable.create(dashboard, {
    animation: 200,
    ghostClass: "dragging",
    handle: ".tile-header",
    onEnd: saveLayout
  });
}

function createTile(id) {
  const tile = document.createElement("div");
  tile.className =
    "bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden relative";
  tile.id = id;

  tile.innerHTML = `
    <div class="tile-header p-4 font-semibold text-lg border-b border-gray-700 flex justify-between items-center text-white">
      <span>${allTiles[id].name}</span>
      <button onclick="removeTile('${id}')" class="ml-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 text-sm rounded-full flex items-center justify-center">×</button>
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
}

function loadTiles() {
  const saved = JSON.parse(localStorage.getItem("tileOrder")) || [];

  saved.forEach(id => {
    if (allTiles[id]) {
      dashboard.appendChild(createTile(id));
    }
  });
}

// Remove tile
function removeTile(id) {
  const tile = document.getElementById(id);
  if (tile) tile.remove();

  // Save updated layout
  saveLayout();
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
          dashboard.appendChild(createTile(id));
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
