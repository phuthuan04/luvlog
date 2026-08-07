const MEDIA_SECTIONS = [
  { type: "movies", endpoint: "/api/movies" },
  { type: "books", endpoint: "/api/books" },
  { type: "songs", endpoint: "/api/songs" },
];

function ratingStars(n) {
  if (!n) return "";
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function wantedItemHtml(i, endpoint, isSuggested) {
  return `
        <li class="media-item" data-id="${i.id}" data-external-id="${i.external_id || ""}" data-title="${escapeHtml(i.title)}">
        ${i.cover_url ? `<img src="${i.cover_url}" alt="" class="media-cover-img">` : ""}
        <div class="media-info">
          <span>${escapeHtml(i.title)}${isSuggested ? ' <small class="suggested-badge">🤖 gợi ý</small>' : ""}</span>
          <div>
            <button type="button" class="mark-done-btn">Đánh dấu đã trải nghiệm</button>
            <button type="button" class="delete-btn" data-endpoint="${endpoint}" data-id="${i.id}">Xoá</button>
          </div>
          <div class="media-mark-form" hidden>
            <select class="rating-select">
              <option value="">Đánh giá</option>
              <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
            </select>
            <input type="text" class="review-input" placeholder="Nhận xét ngắn...">
            <input type="date" class="experienced-input">
            <button type="button" class="save-mark-btn" data-endpoint="${endpoint}" data-id="${i.id}">Lưu</button>
          </div>
        </div>
      </li>`;
}

function renderMediaList(container, items, endpoint) {
  const suggested = items.filter((i) => i.status === "muon" && i.added_by === "luvlog-bot");
  const wanted = items.filter((i) => i.status === "muon" && i.added_by !== "luvlog-bot");
  const done = items.filter((i) => i.status === "da");

  const suggestedHtml = suggested.map((i) => wantedItemHtml(i, endpoint, true)).join("");
  const wantedHtml = wanted.length
    ? wanted.map((i) => wantedItemHtml(i, endpoint, false)).join("")
    : '<li class="media-empty">Chưa có gì trong danh sách</li>';
  const doneHtml = done.length
    ? done.map((i) => `
      <li class="media-item done" data-id="${i.id}">
        ${i.cover_url ? `<img src="${i.cover_url}" alt="" class="media-cover-img">` : ""}
        <div class="media-info">
          <span>${escapeHtml(i.title)}</span>
          <span class="media-rating">${ratingStars(i.rating)}</span>
          ${i.review ? `<p class="media-review">${escapeHtml(i.review)}</p>` : ""}
          <button type="button" class="delete-btn" data-endpoint="${endpoint}" data-id="${i.id}">Xoá</button>
        </div>
      </li>`).join("")
    : '<li class="media-empty">Chưa trải nghiệm gì</li>';

  container.innerHTML = `
    ${suggested.length ? `<h4>Gợi ý cho hôm nay</h4><ul class="media-list-suggested">${suggestedHtml}</ul>` : ""}
    <h4>Muốn xem</h4>
    <ul class="media-list-wanted">${wantedHtml}</ul>
    <h4>Đã trải nghiệm</h4>
    <ul class="media-list-done">${doneHtml}</ul>`;
}

async function loadMediaSection(type, endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  const items = await res.json();
  const container = document.querySelector(`[data-media="${type}"] .media-list`);
  renderMediaList(container, items, endpoint);
  if (typeof setCardSummary === "function") {
    const wanted = items.filter((i) => i.status === "muon").length;
    const done = items.filter((i) => i.status === "da").length;
    setCardSummary(`section-${type}`, `${wanted} muốn · ${done} đã trải nghiệm`);
  }
}

function loadMedia() {
  MEDIA_SECTIONS.forEach((s) => {
    loadMediaSection(s.type, s.endpoint);
    loadSuggestions(s.type);
  });
}

MEDIA_SECTIONS.forEach((s) => {
  const section = document.querySelector(`[data-media="${s.type}"]`);
  const form = section.querySelector(".media-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = form.querySelector(".media-title").value.trim();
    const cover_url = form.querySelector(".media-cover").value.trim();
    if (!title) return;
    await fetch(`${API_BASE}${s.endpoint}`, {
      ...FETCH_OPTS,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, cover_url, status: "muon" }),
    });
    form.reset();
    loadMediaSection(s.type, s.endpoint);
  });
});

const SEARCHABLE_TYPES = { movies: "/api/search/movies", books: "/api/search/books" };

function renderSearchResults(container, results, endpoint) {
  if (!results.length) {
    container.innerHTML = '<p class="media-empty">Không tìm thấy kết quả</p>';
    return;
  }
  container.innerHTML = results
    .map((r, idx) => `
      <div class="search-result" data-index="${idx}" data-endpoint="${endpoint}">
        ${r.cover_url ? `<img src="${r.cover_url}" alt="" class="media-cover-img">` : ""}
        <span>${escapeHtml(r.title)}${r.year ? ` (${r.year})` : ""}${r.authors ? ` — ${escapeHtml(r.authors)}` : ""}</span>
      </div>`)
    .join("");
  container.dataset.results = JSON.stringify(results);
}

Object.entries(SEARCHABLE_TYPES).forEach(([type, searchEndpoint]) => {
  const section = document.querySelector(`[data-media="${type}"]`);
  const form = section.querySelector(".media-search-form");
  const resultsBox = section.querySelector(".media-search-results");
  const addEndpoint = MEDIA_SECTIONS.find((s) => s.type === type).endpoint;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = form.querySelector(".media-search-input").value.trim();
    if (!q) return;
    const res = await fetch(`${API_BASE}${searchEndpoint}?q=${encodeURIComponent(q)}`, FETCH_OPTS);
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      return;
    }
    const results = await res.json();
    renderSearchResults(resultsBox, results, addEndpoint);
  });
});

document.addEventListener("click", async (e) => {
  const resultEl = e.target.closest(".search-result");
  if (resultEl) {
    const container = resultEl.parentElement;
    const results = JSON.parse(container.dataset.results || "[]");
    const item = results[resultEl.dataset.index];
    const endpoint = resultEl.dataset.endpoint;
    await fetch(`${API_BASE}${endpoint}`, {
      ...FETCH_OPTS,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title, cover_url: item.cover_url || "", status: "muon",
        external_id: item.external_id || "", category: item.category || "",
      }),
    });
    container.innerHTML = "";
    const type = MEDIA_SECTIONS.find((s) => s.endpoint === endpoint).type;
    loadMediaSection(type, endpoint);
    return;
  }
  if (e.target.matches(".mark-done-btn")) {
    e.target.parentElement.nextElementSibling.hidden = false;
    return;
  }
  if (e.target.matches(".save-mark-btn")) {
    const endpoint = e.target.dataset.endpoint;
    const id = e.target.dataset.id;
    const wrap = e.target.closest(".media-mark-form");
    const rating = wrap.querySelector(".rating-select").value;
    const review = wrap.querySelector(".review-input").value.trim();
    const experienced_at = wrap.querySelector(".experienced-input").value;
    await fetch(`${API_BASE}${endpoint}/${id}`, {
      ...FETCH_OPTS,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "da",
        rating: rating ? parseInt(rating, 10) : null,
        review: review || null,
        experienced_at: experienced_at || null,
      }),
    });
    const type = MEDIA_SECTIONS.find((s) => s.endpoint === endpoint).type;
    loadMediaSection(type, endpoint);
    return;
  }
  if (e.target.matches(".delete-btn[data-endpoint]")) {
    const endpoint = e.target.dataset.endpoint;
    const id = e.target.dataset.id;
    await fetch(`${API_BASE}${endpoint}/${id}`, { ...FETCH_OPTS, method: "DELETE" });
    const type = MEDIA_SECTIONS.find((s) => s.endpoint === endpoint).type;
    loadMediaSection(type, endpoint);
  }
});

const SUGGESTABLE_TYPES = ["movies", "books"];
const REFRESH_ENDPOINTS = { movies: "/api/movies/refresh-suggestions", books: "/api/books/refresh-suggestions" };

function renderSuggestions(listEl, suggestions) {
  listEl.innerHTML = suggestions.length
    ? suggestions.map((s) => `
      <li class="media-item suggestion-item" data-id="${s.id}" data-external-id="${s.external_id || ""}" data-title="${escapeHtml(s.title)}">
        ${s.cover_url ? `<img src="${s.cover_url}" alt="" class="media-cover-img">` : ""}
        <div class="media-info">
          <span>${escapeHtml(s.title)}</span>
          <div class="suggestion-actions">
            <button type="button" class="accept-suggestion-btn" data-id="${s.id}">+ Thêm</button>
            <button type="button" class="dismiss-suggestion-btn" data-id="${s.id}">Bỏ qua</button>
          </div>
        </div>
      </li>`).join("")
    : '<li class="media-empty">Chưa có gợi ý mới</li>';
}

async function loadSuggestions(type) {
  if (!SUGGESTABLE_TYPES.includes(type)) return;
  const res = await fetch(`${API_BASE}/api/suggestions/${type}`, FETCH_OPTS);
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  const suggestions = await res.json();
  const listEl = document.querySelector(`[data-media="${type}"] .media-list-suggested`);
  if (listEl) renderSuggestions(listEl, suggestions);
}

document.querySelectorAll(".refresh-suggestions-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const type = btn.closest("[data-media]").dataset.media;
    btn.disabled = true;
    btn.textContent = "Đang tìm...";
    await fetch(`${API_BASE}${REFRESH_ENDPOINTS[type]}`, { ...FETCH_OPTS, method: "POST" });
    await loadSuggestions(type);
    btn.disabled = false;
    btn.textContent = "🔄 Làm mới";
  });
});

document.addEventListener("click", async (e) => {
  document.addEventListener("click", async (e) => {
  const clickedItem = e.target.closest(".media-item");
  if (clickedItem && !e.target.closest("button")) {
    const type = clickedItem.closest("[data-media]")?.dataset.media;
    if (type === "movies") { toggleMovieDetail(clickedItem); }
    return;
  }
  if (e.target.matches(".accept-suggestion-btn")) {
  if (e.target.matches(".accept-suggestion-btn")) {
    const type = e.target.closest("[data-media]").dataset.media;
    await fetch(`${API_BASE}/api/suggestions/${e.target.dataset.id}/accept`, { ...FETCH_OPTS, method: "POST" });
    loadSuggestions(type);
    loadMediaSection(type, MEDIA_SECTIONS.find((s) => s.type === type).endpoint);
    return;
  }
  if (e.target.matches(".dismiss-suggestion-btn")) {
    const type = e.target.closest("[data-media]").dataset.media;
    await fetch(`${API_BASE}/api/suggestions/${e.target.dataset.id}`, { ...FETCH_OPTS, method: "DELETE" });
    loadSuggestions(type);
  }
});

async function toggleMovieDetail(item) {
  let detailEl = item.querySelector(".media-detail");
  if (detailEl) { detailEl.remove(); return; }

  detailEl = document.createElement("div");
  detailEl.className = "media-detail";
  detailEl.textContent = "Đang tải...";
  item.querySelector(".media-info").appendChild(detailEl);

  const externalId = item.dataset.externalId;
  const title = item.dataset.title;
  const res = await fetch(`${API_BASE}/api/movies/detail?external_id=${encodeURIComponent(externalId)}&title=${encodeURIComponent(title)}`, FETCH_OPTS);
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  const data = await res.json();
  detailEl.innerHTML = `
    <p class="media-overview">${escapeHtml(data.overview)}</p>
    <p class="media-ratings">${data.imdb ? `⭐ IMDb ${data.imdb}` : ""}${data.tomatometer ? ` · 🍅 ${data.tomatometer}` : ""}</p>`;
}