let albumSort = "date";
let cachedAlbums = [];
let cachedPhotos = [];

const albumUiState = {};
const PHOTOS_PER_PAGE = 9;
const lightboxEl = document.getElementById("lightbox");
const lightboxDetailEl = document.getElementById("lightboxDetail");
const lightboxInfoView = document.getElementById("lightboxInfoView");
const lightboxEditView = document.getElementById("lightboxEditView");

let lightboxPhotos = [];
let lightboxIndex = 0;
let controlsTimeout = null;
let infoTimeout = null;

function populateAlbumSelect() {
  const select = document.getElementById("photoAlbumSelect");
  const saved = localStorage.getItem("luvlog_last_album");
  const current = select.value || saved;
  select.innerHTML = '<option value="">Chọn album...</option>' +
    cachedAlbums.map((album) => `<option value="${album.id}">${escapeHtml(album.name)} (${album.photo_count})</option>`).join("");
  if (current && cachedAlbums.some((album) => String(album.id) === String(current))) {
    select.value = current;
  }
}

function getAlbumState(albumId) {
  if (!albumUiState[albumId]) {
    albumUiState[albumId] = { collapsed: false, page: 0 };
  }
  return albumUiState[albumId];
}

function sortAlbumPhotos(albumId) {
  return cachedPhotos
    .filter((photo) => photo.album_id === albumId)
    .sort((a, b) => {
      const sortA = typeof a.sort_order === "number" ? a.sort_order : 1e9;
      const sortB = typeof b.sort_order === "number" ? b.sort_order : 1e9;
      if (sortA !== sortB) return sortA - sortB;
      return new Date(b.created_at) - new Date(a.created_at);
    });
}

function renderPhotoGrid() {
  const sortedAlbums = [...cachedAlbums].sort((a, b) =>
    albumSort === "name" ? a.name.localeCompare(b.name) : new Date(b.created_at) - new Date(a.created_at)
  );
  const grid = document.getElementById("photoGrid");
  if (!grid) return;
  if (!sortedAlbums.length) {
    grid.innerHTML = '<p class="photo-empty">Chưa có album nào</p>';
    return;
  }

  grid.innerHTML = sortedAlbums.map((album) => {
    const photos = sortAlbumPhotos(album.id);
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
              ? pagePhotos.map((photo) => `<figure class="photo-item" draggable="true" data-photo-id="${photo.id}"><img src="${photo.url}" data-photo-id="${photo.id}" alt="${escapeHtml(album.name)}" loading="lazy"></figure>`).join("")
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

  attachPhotoDragHandlers();
}

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

async function loadAlbums() {
  const res = await fetch(`${API_BASE}/api/albums`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;
  cachedAlbums = await res.json();
  populateAlbumSelect();
}

async function loadPhotos() {
  const res = await fetch(`${API_BASE}/api/photos`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;
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
  const res = await fetch(`${API_BASE}/api/albums`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) {
    alert("Không thể tạo album lúc này.");
    return;
  }
  document.getElementById("newAlbumForm").reset();
  await loadAlbums();
  renderPhotoGrid();
});

async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

document.getElementById("photoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const albumId = document.getElementById("photoAlbumSelect").value;
  const files = Array.from(document.getElementById("photoFile").files);
  if (!albumId || !files.length) return;
  if (files.length > 30) {
    alert("Chỉ được chọn tối đa 30 ảnh mỗi lượt.");
    return;
  }

  localStorage.setItem("luvlog_last_album", albumId);
  const submitBtn = document.getElementById("photoUploadBtn");
  const originalText = submitBtn.textContent;
  let saved = 0;
  let skipped = 0;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    submitBtn.textContent = `Đang tải ${index + 1}/${files.length}...`;
    const hash = await hashFile(file);
    const formData = new FormData();
    formData.append("album_id", albumId);
    formData.append("file", file);
    formData.append("file_hash", hash);
    const res = await fetch(`${API_BASE}/api/photos`, { credentials: "include", method: "POST", body: formData });
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      submitBtn.textContent = originalText;
      return;
    }
    if (!res.ok) {
      submitBtn.textContent = originalText;
      alert("Có lỗi khi tải ảnh lên. Vui lòng thử lại.");
      return;
    }
    const data = await res.json();
    if (data.status === "skipped_duplicate") skipped += 1;
    else saved += 1;
  }

  submitBtn.textContent = originalText;
  document.getElementById("photoFile").value = "";
  alert(`Đã tải ${saved} ảnh mới${skipped ? `, bỏ qua ${skipped} ảnh trùng` : ""}.`);
  await loadPhotos();
});

document.getElementById("sortAlbumsBtn").addEventListener("click", (e) => {
  albumSort = albumSort === "date" ? "name" : "date";
  e.target.textContent = albumSort === "date" ? "Sắp xếp: Mới nhất" : "Sắp xếp: Theo tên";
  renderPhotoGrid();
});

function formatBytes(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
}

function formatPhotoDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getCurrentLightboxPhoto() {
  return lightboxPhotos[lightboxIndex];
}

function hideLightboxDetail() {
  clearTimeout(infoTimeout);
  lightboxDetailEl.hidden = true;
  lightboxInfoView.hidden = true;
  lightboxEditView.hidden = true;
}

function showLightboxControls() {
  document.querySelector(".lightbox-controls").classList.remove("hidden-controls");
  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    document.querySelector(".lightbox-controls").classList.add("hidden-controls");
  }, 3000);
}

function renderLightboxInfo(photo) {
  document.getElementById("lightboxFilename").textContent = photo.filename || "(không rõ tên file)";
  document.getElementById("lightboxMeta").textContent = `${photo.uploaded_by} · ${formatPhotoDateTime(photo.created_at)} · ${formatBytes(photo.file_size)}`;
  document.getElementById("lightboxCaptionText").textContent = photo.caption || "Không có ghi chú";
  const captionMeta = [];
  if (photo.caption_author) captionMeta.push(`Ghi chú bởi ${photo.caption_author}`);
  if (photo.caption_updated_at) captionMeta.push(`cập nhật ${formatPhotoDateTime(photo.caption_updated_at)}`);
  document.getElementById("lightboxCaptionMeta").textContent = captionMeta.join(" · ");
}

function renderLightboxEdit(photo) {
  document.getElementById("lightboxEditFilename").textContent = photo.filename || "(không rõ tên file)";
  document.getElementById("lightboxEditMeta").textContent = `${photo.uploaded_by} · ${formatPhotoDateTime(photo.created_at)} · ${formatBytes(photo.file_size)}`;
  document.getElementById("lightboxCaption").value = photo.caption || "";
}

function renderLightbox() {
  const photo = getCurrentLightboxPhoto();
  document.getElementById("lightboxImg").src = photo.url;
  renderLightboxInfo(photo);
  renderLightboxEdit(photo);
}

function openLightbox(photos, index) {
  lightboxPhotos = photos;
  lightboxIndex = index;
  document.querySelector(".lightbox-menu").hidden = true;
  hideLightboxDetail();
  renderLightbox();
  lightboxEl.hidden = false;
  showLightboxControls();
}

function showLightboxInfo() {
  const photo = getCurrentLightboxPhoto();
  renderLightboxInfo(photo);
  lightboxEditView.hidden = true;
  lightboxInfoView.hidden = false;
  lightboxDetailEl.hidden = false;
  document.querySelector(".lightbox-menu").hidden = true;
  clearTimeout(infoTimeout);
  infoTimeout = setTimeout(() => {
    hideLightboxDetail();
  }, 3000);
}

function showLightboxEdit() {
  const photo = getCurrentLightboxPhoto();
  renderLightboxEdit(photo);
  clearTimeout(infoTimeout);
  lightboxInfoView.hidden = true;
  lightboxEditView.hidden = false;
  lightboxDetailEl.hidden = false;
  document.querySelector(".lightbox-menu").hidden = true;
}

lightboxEl.addEventListener("mousemove", showLightboxControls);
lightboxEl.addEventListener("touchstart", showLightboxControls);

document.getElementById("lightboxImg").addEventListener("click", (e) => {
  e.stopPropagation();
  const controls = document.querySelector(".lightbox-controls");
  if (controls.classList.contains("hidden-controls")) showLightboxControls();
  else {
    clearTimeout(controlsTimeout);
    controls.classList.add("hidden-controls");
  }
});

document.querySelector(".lightbox-fullscreen").addEventListener("click", () => {
  if (!document.fullscreenElement) lightboxEl.requestFullscreen?.();
  else document.exitFullscreen?.();
});

document.querySelector(".lightbox-menu-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  const menu = document.querySelector(".lightbox-menu");
  menu.hidden = !menu.hidden;
});

document.querySelector(".lightbox-info-btn").addEventListener("click", () => {
  showLightboxEdit();
});

document.querySelector(".lightbox-info-toggle").addEventListener("click", (e) => {
  e.stopPropagation();
  showLightboxInfo();
});

document.addEventListener("click", (e) => {
  if (e.target.matches(".photo-item img")) {
    const photoId = parseInt(e.target.dataset.photoId, 10);
    const clicked = cachedPhotos.find((photo) => photo.id === photoId);
    if (!clicked) return;
    const albumPhotos = sortAlbumPhotos(clicked.album_id);
    openLightbox(albumPhotos, albumPhotos.findIndex((photo) => photo.id === photoId));
    return;
  }

  if (e.target.id === "lightbox" || e.target.matches(".lightbox-close")) {
    lightboxEl.hidden = true;
    hideLightboxDetail();
    if (document.fullscreenElement) document.exitFullscreen?.();
    return;
  }

  if (e.target.matches(".lightbox-prev")) {
    lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
    hideLightboxDetail();
    renderLightbox();
    showLightboxControls();
    return;
  }

  if (e.target.matches(".lightbox-next")) {
    lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
    hideLightboxDetail();
    renderLightbox();
    showLightboxControls();
    return;
  }
});

document.getElementById("lightboxSaveCaption").addEventListener("click", async (e) => {
  const button = e.target;
  const originalText = button.textContent;
  const photo = getCurrentLightboxPhoto();
  const caption = document.getElementById("lightboxCaption").value.trim();

  button.textContent = "Đang lưu...";
  button.disabled = true;
  const res = await fetch(`${API_BASE}/api/photos/${photo.id}`, {
    ...FETCH_OPTS,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caption }),
  });
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    button.textContent = originalText;
    button.disabled = false;
    return;
  }
  if (!res.ok) {
    button.textContent = "Lưu thất bại";
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1500);
    return;
  }

  const payload = await res.json();
  const updatedPhoto = payload.photo;
  lightboxPhotos = lightboxPhotos.map((item) => (item.id === updatedPhoto.id ? updatedPhoto : item));
  cachedPhotos = cachedPhotos.map((item) => (item.id === updatedPhoto.id ? updatedPhoto : item));
  renderLightbox();
  showLightboxInfo();
  button.textContent = "Đã lưu";
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 1500);
});

document.addEventListener("keydown", (e) => {
  if (!lightboxEl || lightboxEl.hidden) return;
  if (e.key === "Escape") {
    lightboxEl.hidden = true;
    hideLightboxDetail();
  } else if (e.key === "ArrowLeft") {
    lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
    hideLightboxDetail();
    renderLightbox();
    showLightboxControls();
  } else if (e.key === "ArrowRight") {
    lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
    hideLightboxDetail();
    renderLightbox();
    showLightboxControls();
  }
});

function setupLightboxTouch(element) {
  let startX = 0;
  let startY = 0;
  let moved = false;

  element.addEventListener("touchstart", (event) => {
    if (!event.touches || !event.touches.length) return;
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    moved = false;
  }, { passive: true });

  element.addEventListener("touchmove", () => {
    moved = true;
  }, { passive: true });

  element.addEventListener("touchend", (event) => {
    if (!moved || !lightboxPhotos.length) return;
    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
      else lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
      hideLightboxDetail();
      renderLightbox();
      showLightboxControls();
    }
  });
}

setupLightboxTouch(lightboxEl);

function attachPhotoDragHandlers() {
  document.querySelectorAll(".album-photo-grid").forEach((grid) => {
    if (grid.dataset.dragReady === "true") return;
    grid.dataset.dragReady = "true";
    let dragSource = null;

    grid.addEventListener("dragstart", (e) => {
      const item = e.target.closest(".photo-item");
      if (!item) return;
      dragSource = item;
      e.dataTransfer.effectAllowed = "move";
      item.classList.add("dragging");
    });

    grid.addEventListener("dragover", (e) => {
      e.preventDefault();
      const over = e.target.closest(".photo-item");
      if (!over || !dragSource || over === dragSource) return;
      const placeholder = grid.querySelector(".drop-placeholder") || (() => {
        const node = document.createElement("div");
        node.className = "drop-placeholder";
        return node;
      })();
      grid.querySelectorAll(".drop-placeholder").forEach((node) => node.remove());
      const midpoint = over.getBoundingClientRect().left + over.getBoundingClientRect().width / 2;
      if (e.clientX > midpoint) over.insertAdjacentElement("afterend", placeholder);
      else over.insertAdjacentElement("beforebegin", placeholder);
    });

    grid.addEventListener("drop", async (e) => {
      e.preventDefault();
      if (!dragSource) return;
      dragSource.classList.remove("dragging");
      const placeholder = grid.querySelector(".drop-placeholder");
      if (placeholder) {
        placeholder.insertAdjacentElement("afterend", dragSource);
        placeholder.remove();
      }

      const albumId = parseInt(grid.closest(".album-group").dataset.albumId, 10);
      const orderedPhotoIds = Array.from(grid.querySelectorAll(".photo-item")).map((node) => parseInt(node.dataset.photoId, 10));
      orderedPhotoIds.forEach((photoId, index) => {
        const photo = cachedPhotos.find((item) => item.id === photoId);
        if (photo) photo.sort_order = index;
      });
      renderPhotoGrid();

      const res = await fetch(`${API_BASE}/api/photos/reorder`, {
        ...FETCH_OPTS,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ album_id: albumId, ordered_photo_ids: orderedPhotoIds }),
      });
      if (res.status === 401) {
        if (typeof showLogin === "function") showLogin();
        await loadPhotos();
        return;
      }
      if (!res.ok) {
        alert("Không thể lưu thứ tự mới. Vui lòng thử lại.");
        await loadPhotos();
      }
    });

    grid.addEventListener("dragend", (e) => {
      const item = e.target.closest(".photo-item");
      if (item) item.classList.remove("dragging");
      grid.querySelectorAll(".drop-placeholder").forEach((node) => node.remove());
      dragSource = null;
    });
  });
}
