const photoForm = document.getElementById("photoForm");
const photoGrid = document.getElementById("photoGrid");

function renderPhotos(photos) {
  if (!photos.length) {
    photoGrid.innerHTML = '<p class="photo-empty">Chưa có ảnh nào</p>';
    return;
  }
  photoGrid.innerHTML = photos
    .map((p) => `
      <figure class="photo-item">
        <img src="${p.url}" alt="${escapeHtml(p.album)}" loading="lazy">
        <figcaption>${escapeHtml(p.album)}</figcaption>
      </figure>`)
    .join("");
}

async function loadPhotos() {
  const res = await fetch(`${API_BASE}/api/photos`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  const photos = await res.json();
  renderPhotos(photos);
}

photoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const album = document.getElementById("photoAlbum").value.trim();
  const file = document.getElementById("photoFile").files[0];
  if (!album || !file) return;

  const formData = new FormData();
  formData.append("album", album);
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/photos`, {
    credentials: "include",
    method: "POST",
    body: formData, // KHÔNG set header Content-Type — trình duyệt tự thêm đúng boundary cho multipart
  });

  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }

  photoForm.reset();
  loadPhotos();
});