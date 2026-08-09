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

// Album UI state: collapsed/expanded and current page
const albumUiState = {};
const PHOTOS_PER_PAGE = 9;

function getAlbumState(albumId) {
  if (!albumUiState[albumId]) albumUiState[albumId] = { collapsed: false, page: 0 };
  return albumUiState[albumId];
}

// Render the photo grid with albums and photos
function renderPhotoGrid() {
  const sorted = [...cachedAlbums].sort((a, b) =>
    albumSort === "name" ? a.name.localeCompare(b.name) : new Date(b.created_at) - new Date(a.created_at)
  );
  const grid = document.getElementById("photoGrid");
  if (!grid) return;
  if (!sorted.length) {
    grid.innerHTML = '<p class="photo-empty">Chưa có album nào</p>';
    return;
  }
  grid.innerHTML = sorted.map((album) => {
    // order photos by sort_order if present
    const photos = cachedPhotos.filter((p) => p.album_id === album.id).sort((a, b) => {
      const sa = (typeof a.sort_order === 'number') ? a.sort_order : 1e9;
      const sb = (typeof b.sort_order === 'number') ? b.sort_order : 1e9;
      if (sa !== sb) return sa - sb;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    const state = getAlbumState(album.id);
    const totalPages = Math.max(1, Math.ceil(photos.length / PHOTOS_PER_PAGE));
    if (state.page >= totalPages) state.page = totalPages - 1;
    const pagePhotos = photos.slice(state.page * PHOTOS_PER_PAGE, (state.page + 1) * PHOTOS_PER_PAGE);

    return `
      <div class="album-group" data-album-id="${album.id}">
        <button type="button" class="album-toggle-btn" data-album-id="${album.id}">
          <span class="album-group-title">${escapeHtml(album.name)} · ${photos.length}</span>
          <span class="album-chevron ${state.collapsed ? "collapsed" : ""}">▾</span>
        </button>
        <div class="album-body ${state.collapsed ? "collapsed" : ""}"><div class="album-body-inner">
          <div class="album-photo-grid">
            ${pagePhotos.length
              ? pagePhotos.map((p) => `<figure class="photo-item" draggable="true" data-photo-id="${p.id}"><img src="${p.url}" data-photo-id="${p.id}" alt="${escapeHtml(album.name)}" loading="lazy"></figure>`).join("")
              : '<p class="photo-empty">Chưa có ảnh trong album này</p>'}
          </div>
          ${totalPages > 1 ? `
            <div class="album-pagination">
              <button type="button" class="album-page-prev" data-album-id="${album.id}" ${state.page === 0 ? "disabled" : ""}>‹</button>
              <span class="album-page-label">${state.page + 1}/${totalPages}</span>
              <button type="button" class="album-page-next" data-album-id="${album.id}" ${state.page >= totalPages - 1 ? "disabled" : ""}>›</button>
            </div>` : ""}
        </div></div>
      </div>`;
  }).join("");
  // Attach drag/drop handlers via delegation
  attachPhotoDragHandlers();
}

// Event delegation for album toggle and pagination
document.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest(".album-toggle-btn");
  if (toggleBtn) {
    const state = getAlbumState(toggleBtn.dataset.albumId);
    state.collapsed = !state.collapsed;
    renderPhotoGrid();
    return;
  }
  if (e.target.matches(".album-page-prev")) {
    getAlbumState(e.target.dataset.albumId).page -= 1;
    renderPhotoGrid();
    return;
  }
  if (e.target.matches(".album-page-next")) {
    getAlbumState(e.target.dataset.albumId).page += 1;
    renderPhotoGrid();
  }
});

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


let lightboxPhotos = [];
let lightboxIndex = 0;
let controlsTimeout = null;

function formatBytes(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
}

function showLightboxControls() {
  document.querySelector(".lightbox-controls").classList.remove("hidden-controls");
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    document.querySelector(".lightbox-controls").classList.add("hidden-controls");
  }, 3000);
}

function openLightbox(photos, index) {
  lightboxPhotos = photos;
  lightboxIndex = index;
  document.getElementById("lightboxDetail").hidden = true;
  document.querySelector(".lightbox-menu").hidden = true;
  renderLightbox();
  document.getElementById("lightbox").hidden = false;
  showLightboxControls();
}

function renderLightbox() {
  const p = lightboxPhotos[lightboxIndex];
  document.getElementById("lightboxImg").src = p.url;
  document.getElementById("lightboxFilename").textContent = p.filename || "(không rõ tên file)";
  document.getElementById("lightboxMeta").textContent =
    `${p.uploaded_by} · ${new Date(p.created_at).toLocaleDateString("vi-VN")} · ${formatBytes(p.file_size)}`;
  document.getElementById("lightboxCaption").value = p.caption || "";
}

const lightboxEl = document.getElementById("lightbox");
lightboxEl.addEventListener("mousemove", showLightboxControls);
lightboxEl.addEventListener("touchstart", showLightboxControls);

document.getElementById("lightboxImg").addEventListener("click", (e) => {
  e.stopPropagation();
  const controls = document.querySelector(".lightbox-controls");
  if (controls.classList.contains("hidden-controls")) showLightboxControls();
  else { clearTimeout(controlsTimeout); controls.classList.add("hidden-controls"); }
});

document.querySelector(".lightbox-fullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) lightboxEl.requestFullscreen?.();
  else document.exitFullscreen?.();
});

document.querySelector(".lightbox-menu-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  document.querySelector(".lightbox-menu").hidden = !document.querySelector(".lightbox-menu").hidden;
});

document.querySelector(".lightbox-info-btn").addEventListener("click", () => {
  document.getElementById("lightboxDetail").hidden = false;
  document.querySelector(".lightbox-menu").hidden = true;
});

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
    if (document.fullscreenElement) document.exitFullscreen?.();
    return;
  }
  if (e.target.matches(".lightbox-prev")) {
    lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
    renderLightbox(); showLightboxControls();
    return;
  }
  if (e.target.matches(".lightbox-next")) {
    lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
    renderLightbox(); showLightboxControls();
    return;
  }
  if (e.target.id === "lightboxSaveCaption") {
    (async () => {
      const btn = e.target;
      const originalText = btn.textContent;
      btn.textContent = "Đang lưu..."; btn.disabled = true;
      try {
        const p = lightboxPhotos[lightboxIndex];
        const caption = document.getElementById("lightboxCaption").value.trim();
        const res = await fetch(`${API_BASE}/api/photos/${p.id}`, {
          ...FETCH_OPTS, method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caption }),
        });
        if (res.ok) {
          p.caption = caption;
          const cached = cachedPhotos.find((cp) => cp.id === p.id);
          if (cached) cached.caption = caption;
          btn.textContent = "Đã lưu";
        } else btn.textContent = "Lỗi khi lưu";
      } catch { btn.textContent = "Lỗi kết nối"; }
      finally { setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1500); }
    })();
  }
});

document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox || lightbox.hidden) return;
  if (e.key === "Escape") lightbox.hidden = true;
  else if (e.key === "ArrowLeft") { lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length; renderLightbox(); showLightboxControls(); }
  else if (e.key === "ArrowRight") { lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length; renderLightbox(); showLightboxControls(); }
});

// Info toggle: show read-only caption / info for 3s when pressing the inline 'i' button
const infoToggleBtn = document.querySelector('.lightbox-info-toggle');
if (infoToggleBtn) {
  infoToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const detailEl = document.getElementById('lightboxDetail');
    if (!detailEl) return;
    // Populate read-only view
    const p = lightboxPhotos[lightboxIndex];
    detailEl.querySelector('.detail-caption')?.remove?.();
    const captionNode = document.createElement('div');
    captionNode.className = 'detail-caption';
    const captionText = p.caption ? p.caption : '(Không có ghi chú)';
    const author = p.caption_author ? ` — ${p.caption_author}` : '';
    captionNode.innerHTML = `<div class="caption-text">${escapeHtml(captionText)}</div><div class="meta">${escapeHtml(p.uploaded_by)} · ${new Date(p.created_at).toLocaleString('vi-VN')}${author}</div>`;
    detailEl.appendChild(captionNode);
    detailEl.hidden = false;
    // hide menu if open
    document.querySelector('.lightbox-menu').hidden = true;
    // auto-hide after 3s
    setTimeout(() => { detailEl.hidden = true; if (captionNode && captionNode.remove) captionNode.remove(); }, 3000);
  });
}

// Touch swipe implementation for lightbox (7.4.3e)
function setupLightboxTouch(el) {
  let startX = 0, startY = 0, startT = 0, moved = false;
  function onTouchStart(ev) {
    if (!ev.touches || !ev.touches.length) return;
    const t = ev.touches[0];
    startX = t.clientX; startY = t.clientY; startT = Date.now(); moved = false;
  }
  function onTouchMove(ev) {
    moved = true;
  }
  function onTouchEnd(ev) {
    if (!moved) return; // treat as tap
    const t = (ev.changedTouches && ev.changedTouches[0]) || ev;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const dt = Date.now() - startT;
    // require mostly horizontal movement
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        // swipe left -> next
        lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length; renderLightbox(); showLightboxControls();
      } else {
        // swipe right -> prev
        lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length; renderLightbox(); showLightboxControls();
      }
    }
  }
  el.removeEventListener('touchstart', onTouchStart);
  el.removeEventListener('touchmove', onTouchMove);
  el.removeEventListener('touchend', onTouchEnd);
  el.addEventListener('touchstart', onTouchStart, {passive: true});
  el.addEventListener('touchmove', onTouchMove, {passive: true});
  el.addEventListener('touchend', onTouchEnd);
}

// Drag/drop reorder handlers (frontend) for album reordering (7.4.4)
function attachPhotoDragHandlers() {
  document.querySelectorAll('.album-photo-grid').forEach((grid) => {
    if (grid._dragHandlersAttached) return; // idempotent
    grid._dragHandlersAttached = true;
    let dragSrc = null;
    grid.addEventListener('dragstart', (e) => {
      const fig = e.target.closest('.photo-item');
      if (!fig) return;
      dragSrc = fig;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', fig.dataset.photoId); } catch (err) {}
      fig.classList.add('dragging');
    });
    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
      const over = e.target.closest('.photo-item');
      const after = over && (e.clientY > over.getBoundingClientRect().top + over.getBoundingClientRect().height/2);
      const placeholder = grid.querySelector('.drop-placeholder') || (() => { const ph = document.createElement('div'); ph.className='drop-placeholder'; ph.style.height='6px'; return ph; })();
      // remove existing placeholder
      grid.querySelectorAll('.drop-placeholder').forEach(n=>n.remove());
      if (!over) return;
      if (after) over.insertAdjacentElement('afterend', placeholder);
      else over.insertAdjacentElement('beforebegin', placeholder);
    });
    grid.addEventListener('drop', async (e) => {
      e.preventDefault();
      const targetItem = e.target.closest('.photo-item');
      if (!dragSrc) return;
      // remove dragging class
      dragSrc.classList.remove('dragging');
      // find placeholder position
      const placeholder = grid.querySelector('.drop-placeholder');
      if (placeholder) {
        placeholder.insertAdjacentElement('afterend', dragSrc);
        placeholder.remove();
      }
      // compute new order
      const albumEl = grid.closest('.album-group');
      const albumId = parseInt(albumEl.dataset.albumId, 10);
      const newOrder = Array.from(grid.querySelectorAll('.photo-item')).map(f => parseInt(f.dataset.photoId,10));
      // Optimistically update UI and cachedPhotos
      newOrder.forEach((pid, idx) => {
        const p = cachedPhotos.find(cp => cp.id === pid);
        if (p) p.sort_order = idx;
      });
      renderPhotoGrid();
      // Post to backend
      try {
        const res = await fetch(`${API_BASE}/api/photos/reorder`, { ...FETCH_OPTS, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ album_id: albumId, ordered_photo_ids: newOrder }) });
        if (!res.ok) throw new Error('Reorder failed');
      } catch (err) {
        alert('Không thể lưu thứ tự mới. Vui lòng thử lại.');
        // reload from server to be safe
        await loadPhotos();
      }
    });
    grid.addEventListener('dragend', (e) => {
      const fig = e.target.closest('.photo-item');
      if (fig) fig.classList.remove('dragging');
      grid.querySelectorAll('.drop-placeholder').forEach(n=>n.remove());
      dragSrc = null;
    });
  });
}
