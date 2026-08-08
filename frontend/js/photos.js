let albumSort = "date";
let cachedAlbums = [];
let cachedPhotos = [];

function populateAlbumSelect() {
  const select = document.getElementById("photoAlbumSelect");
  const current = select.value;
  select.innerHTML = '<option value="">Chọn album...</option>' +
    cachedAlbums.map((a) => `<option value="${a.id}">${escapeHtml(a.name)} (${a.photo_count})</option>`).join("");
  select.value = current;
}

function renderPhotoGrid() {
  const sorted = [...cachedAlbums].sort((a, b) =>
    albumSort === "name" ? a.name.localeCompare(b.name) : new Date(b.created_at) - new Date(a.created_at)
  );
  const grid = document.getElementById("photoGrid");
  if (!sorted.length) {
    grid.innerHTML = '<p class="photo-empty">Chưa có album nào</p>';
    return;
  }
  grid.innerHTML = sorted.map((album) => {
    const photos = cachedPhotos.filter((p) => p.album_id === album.id);
    return `
      <div class="album-group">
        <p class="album-group-title">${escapeHtml(album.name)} · ${photos.length}</p>
        <div class="photo-grid">
          ${photos.length
            ? photos.map((p) => `<figure class="photo-item"><img src="${p.url}" alt="${escapeHtml(album.name)}" loading="lazy"></figure>`).join("")
            : '<p class="photo-empty">Chưa có ảnh</p>'}
        </div>
      </div>`;
  }).join("");
}

async function loadAlbums() {
  const res = await fetch(`${API_BASE}/api/albums`, FETCH_OPTS);
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  cachedAlbums = await res.json();
  populateAlbumSelect();
}

async function loadPhotos() {
  const res = await fetch(`${API_BASE}/api/photos`, FETCH_OPTS);
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  cachedPhotos = await res.json();
  await loadAlbums();
  renderPhotoGrid();
  if (typeof setCardSummary === "function") {
    setCardSummary("section-photos", cachedPhotos.length ? `${cachedPhotos.length} ảnh trong ${cachedAlbums.length} album` : "Chưa có ảnh nào");
  }
}

document.getElementById("newAlbumForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("newAlbumName").value.trim();
  if (!name) return;
  await fetch(`${API_BASE}/api/albums`, {
    ...FETCH_OPTS, method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  document.getElementById("newAlbumForm").reset();
  await loadAlbums();
  renderPhotoGrid();
});

document.getElementById("photoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const albumId = document.getElementById("photoAlbumSelect").value;
  const file = document.getElementById("photoFile").files[0];
  if (!albumId || !file) return;
  const formData = new FormData();
  formData.append("album_id", albumId);
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/photos`, { credentials: "include", method: "POST", body: formData });
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  document.getElementById("photoForm").reset();
  loadPhotos();
});

document.getElementById("sortAlbumsBtn").addEventListener("click", (e) => {
  albumSort = albumSort === "date" ? "name" : "date";
  e.target.textContent = albumSort === "date" ? "Sắp xếp: Mới nhất" : "Sắp xếp: Theo tên";
  renderPhotoGrid();
});