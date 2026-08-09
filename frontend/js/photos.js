let albumSort = "date";
let cachedAlbums = [];
let cachedPhotos = [];

function populateAlbumSelect() {
  const select = document.getElementById("photoAlbumSelect");
  const saved = localStorage.getItem("luvlog_last_album");
  const current = select.value || saved;
  select.innerHTML = '<option value="">Chọn album...</option>' +
    cachedAlbums.map((a) => `<option value="${a.id}">${escapeHtml(a.name)} (${a.photo_count})</option>`).join("");
  if (current && cachedAlbums.some((a) => String(a.id) === String(current))) {
    select.value = current;
  }
}

// Render the photo grid with albums and their photos
function renderPhotoGrid() {
  const sorted = [...cachedAlbums].sort((a, b) =>
    albumSort === "name"
      ? a.name.localeCompare(b.name)
      : new Date(b.created_at) - new Date(a.created_at)
  );
// Get the photo grid container
  const grid = document.getElementById("photoGrid");
  if (!grid) return; // Tránh lỗi nếu chưa load xong DOM

  if (!sorted.length) {
    grid.innerHTML = '<p class="photo-empty">Chưa có album nào</p>';
    return;
  }
// Render albums and their photos
  grid.innerHTML = sorted
    .map((album) => {
      const photos = cachedPhotos.filter((p) => p.album_id === album.id);
      return `
        <div class="album-group">
          <p class="album-group-title">${escapeHtml(album.name)} · ${photos.length}</p>
          <div class="album-photo-grid">
            ${
              photos.length
                ? photos
                    .map(
                      (p) => `
                      <figure class="photo-item">
                        <img 
                          src="${p.url}" 
                          data-photo-id="${p.id}" 
                          data-caption="${escapeHtml(p.caption || '')}"
                          data-filename="${escapeHtml(p.filename || '')}"
                          alt="${escapeHtml(album.name)}" 
                          loading="lazy"
                        >
                      </figure>`
                    )
                    .join("")
                : '<p class="photo-empty">Chưa có ảnh trong album này</p>'
            }
          </div>
        </div>`;
    })
    .join("");
}

// Load albums from the backend
async function loadAlbums() {
  const res = await fetch(`${API_BASE}/api/albums`, FETCH_OPTS);
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  cachedAlbums = await res.json();
  populateAlbumSelect();
}

// Load photos from the backend
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

// New album form submission
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

// Hash a file using SHA-256
async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Photo upload form submission
document.getElementById("photoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const albumId = document.getElementById("photoAlbumSelect").value;
  const files = Array.from(document.getElementById("photoFile").files);
  if (!albumId || !files.length) return;
  if (files.length > 30) { alert("Chỉ được chọn tối đa 30 ảnh mỗi lượt."); return; }

  localStorage.setItem("luvlog_last_album", albumId);
// Upload photos one by one to handle duplicates
  const submitBtn = document.getElementById("photoUploadBtn");
  let saved = 0, skipped = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    submitBtn.textContent = `Đang tải ${i + 1}/${files.length}...`;
    const hash = await hashFile(file);
    const formData = new FormData();
    formData.append("album_id", albumId);
    formData.append("file", file);
    formData.append("file_hash", hash);
    const res = await fetch(`${API_BASE}/api/photos`, { credentials: "include", method: "POST", body: formData });
    if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
    const data = await res.json();
    if (data.status === "skipped_duplicate") skipped++; else saved++;
  }
  submitBtn.textContent = "Tải lên";
  document.getElementById("photoFile").value = "";
  alert(`Đã tải ${saved} ảnh mới${skipped ? `, bỏ qua ${skipped} ảnh trùng` : ""}.`);
  loadPhotos();
});

// Album sorting button
document.getElementById("sortAlbumsBtn").addEventListener("click", (e) => {
  albumSort = albumSort === "date" ? "name" : "date";
  e.target.textContent = albumSort === "date" ? "Sắp xếp: Mới nhất" : "Sắp xếp: Theo tên";
  renderPhotoGrid();
});


// Lightbox functionality
let lightboxPhotos = [];
let lightboxIndex = 0;

// Format bytes to KB or MB
function formatBytes(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
}

// Open the lightbox with a specific photo
function openLightbox(photos, index) {
  lightboxPhotos = photos;
  lightboxIndex = index;
  renderLightbox();
  document.getElementById("lightbox").hidden = false;
}

// Render the lightbox with the current photo
function renderLightbox() {
  const p = lightboxPhotos[lightboxIndex];
  document.getElementById("lightboxImg").src = p.url;
  document.getElementById("lightboxFilename").textContent = p.filename || "(không rõ tên file)";
  document.getElementById("lightboxMeta").textContent =
    `${p.uploaded_by} · ${new Date(p.created_at).toLocaleDateString("vi-VN")} · ${formatBytes(p.file_size)}`;
  document.getElementById("lightboxCaption").value = p.caption || "";
}

// Event delegation for photo grid and lightbox
document.addEventListener("click", (e) => {
  if (e.target.matches(".photo-item img")) {
    const photoId = parseInt(e.target.dataset.photoId, 10);
    const clicked = cachedPhotos.find((p) => p.id === photoId);
    const albumPhotos = cachedPhotos.filter((p) => p.album_id === clicked.album_id);
    openLightbox(albumPhotos, albumPhotos.findIndex((p) => p.id === photoId));
    return;
  }
  if (e.target.id === "lightbox" || e.target.matches(".lightbox-close")) {
    document.getElementById("lightbox").hidden = true;
    return;
  }
  if (e.target.matches(".lightbox-prev")) {
    lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
    renderLightbox();
    return;
  }
  if (e.target.matches(".lightbox-next")) {
    lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
    renderLightbox();
    return;
  }
  // Save caption button in lightbox
  if (e.target.id === "lightboxSaveCaption") {
    (async () => {
      const btn = e.target;
      const originalText = btn.textContent;
      btn.textContent = "Đang lưu...";
      btn.disabled = true;

      try {
        const p = lightboxPhotos[lightboxIndex];
        const caption = document.getElementById("lightboxCaption").value.trim();
        const res = await fetch(`${API_BASE}/api/photos/${p.id}`, {
          ...FETCH_OPTS, 
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caption }),
        });

        if (res.ok) {
          p.caption = caption;
          const cached = cachedPhotos.find((cp) => cp.id === p.id);
          if (cached) cached.caption = caption;
          btn.textContent = "Đã lưu";
        } else {
          btn.textContent = "Lỗi khi lưu";
        }
      } catch (err) {
        console.error("Save caption error:", err);
        btn.textContent = "Lỗi kết nối";
      } finally {
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 1500);
      }
    })();
  }
});

// Keyboard navigation for lightbox
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox || lightbox.hidden) return;

  if (e.key === "Escape") {
    lightbox.hidden = true;
  } else if (e.key === "ArrowLeft") {
    lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
    renderLightbox();
  } else if (e.key === "ArrowRight") {
    lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
    renderLightbox();
  }
});