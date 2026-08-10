const MEDIA_TYPES = {
  movies: {
    endpoint: "/api/movies",
    searchEndpoint: "/api/search/movies",
    label: "phim",
    icon: "🎬",
    searchable: true,
    suggestable: true,
    wantedLabel: "Dự định xem",
    doneLabel: "Đã xem xong",
    emptySearch: "Tìm tên phim...",
  },
  books: {
    endpoint: "/api/books",
    searchEndpoint: "/api/search/books",
    label: "sách",
    icon: "📚",
    searchable: true,
    suggestable: true,
    wantedLabel: "Dự định đọc",
    doneLabel: "Đã đọc xong",
    emptySearch: "Tìm tên sách...",
  },
  songs: {
    endpoint: "/api/songs",
    label: "nhạc",
    icon: "🎵",
    searchable: false,
    suggestable: false,
    wantedLabel: "Dự định nghe",
    doneLabel: "Đã nghe xong",
    emptySearch: "Nhập tên bài hát để thêm nhanh...",
  },
};

const mediaState = {
  currentType: "movies",
  itemsByType: {
    movies: [],
    books: [],
    songs: [],
  },
  suggestionsByType: {
    movies: [],
    books: [],
  },
};

const doneSortState = {
  movies: "desc",
  books: "desc",
  songs: "desc",
};

const mediaHubForm = document.getElementById("mediaHubForm");
const mediaHubType = document.getElementById("mediaHubType");
const mediaHubQuery = document.getElementById("mediaHubQuery");
const mediaHubHelp = document.getElementById("mediaHubHelp");
const mediaHubResults = document.getElementById("mediaHubResults");
const mediaHubSuggestionsBlock = document.getElementById("mediaHubSuggestionsBlock");
const mediaHubSuggestionsTitle = document.getElementById("mediaHubSuggestionsTitle");
const mediaHubSuggestions = document.getElementById("mediaHubSuggestions");
const refreshMediaSuggestionsBtn = document.getElementById("refreshMediaSuggestionsBtn");
const mediaHubCollectionTitle = document.getElementById("mediaHubCollectionTitle");
const mediaHubCollectionMeta = document.getElementById("mediaHubCollectionMeta");
const mediaHubCollection = document.getElementById("mediaHubCollection");
const mediaHubSortDoneBtn = document.getElementById("mediaHubSortDoneBtn");

function ratingStars(n) {
  if (!n) return "";
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function formatMediaDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function getMediaTypeConfig(type) {
  return MEDIA_TYPES[type] || MEDIA_TYPES.movies;
}

function getCurrentMediaType() {
  return mediaHubType?.value || mediaState.currentType;
}

function getStatusBadgeLabel(type, status) {
  const config = getMediaTypeConfig(type);
  return status === "da" ? config.doneLabel : config.wantedLabel;
}

function getMediaSummaryText(type, items) {
  const wanted = items.filter((item) => item.status === "muon").length;
  const done = items.filter((item) => item.status === "da").length;
  return `${wanted} dự định · ${done} hoàn thành`;
}

function renderMediaHubCopy(type) {
  const config = getMediaTypeConfig(type);
  mediaState.currentType = type;
  if (mediaHubQuery) mediaHubQuery.placeholder = config.emptySearch;
  if (mediaHubHelp) {
    mediaHubHelp.textContent = config.searchable
      ? `Tìm ${config.label} từ nguồn hiện có, thêm nhanh vào danh sách, rồi quản lý trong cùng một khung.`
      : "Nhập nhanh tên bài hát để thêm vào danh sách muốn nghe. Phần nhạc hiện dùng luồng thêm thủ công để giữ stack hiện tại.";
  }
  if (mediaHubCollectionTitle) {
    mediaHubCollectionTitle.textContent = `${config.icon} Danh sách ${config.label}`;
  }
  if (mediaHubSuggestionsTitle) {
    mediaHubSuggestionsTitle.textContent = `Gợi ý ${config.label} cho hôm nay`;
  }
  if (refreshMediaSuggestionsBtn) {
    refreshMediaSuggestionsBtn.hidden = !config.suggestable;
  }
  if (mediaHubSuggestionsBlock) {
    mediaHubSuggestionsBlock.hidden = !config.suggestable;
  }
}

function renderMediaHubResults(results, type) {
  const config = getMediaTypeConfig(type);
  if (!mediaHubResults) return;
  if (!results.length) {
    mediaHubResults.innerHTML = '<p class="media-empty">Không tìm thấy kết quả phù hợp</p>';
    mediaHubResults.dataset.results = JSON.stringify([]);
    return;
  }
  mediaHubResults.innerHTML = `
    <div class="media-hub-results-list">
      ${results.map((result, index) => `
        <button type="button" class="media-hub-result" data-type="${type}" data-index="${index}">
          <span class="media-hub-result-cover">
            ${result.cover_url ? `<img src="${result.cover_url}" alt="" class="media-cover-img">` : `<span class="media-cover-placeholder">${config.icon}</span>`}
          </span>
          <span class="media-hub-result-copy">
            <strong>${escapeHtml(result.title)}</strong>
            ${result.year ? `<small>${result.year}</small>` : ""}
            ${result.authors ? `<small>${escapeHtml(result.authors)}</small>` : ""}
            ${result.manual ? `<small>Thêm nhanh vào danh sách muốn nghe</small>` : ""}
          </span>
        </button>`).join("")}
    </div>`;
  mediaHubResults.dataset.results = JSON.stringify(results);
}

function renderSuggestions(type) {
  if (!mediaHubSuggestions) return;
  const suggestions = mediaState.suggestionsByType[type] || [];
  mediaHubSuggestions.innerHTML = suggestions.length
    ? suggestions.map((item) => `
      <article class="media-suggestion-card" data-id="${item.id}" data-type="${type}">
        <div class="media-suggestion-cover">
          ${item.cover_url ? `<img src="${item.cover_url}" alt="" class="media-cover-img">` : `<span class="media-cover-placeholder">${getMediaTypeConfig(type).icon}</span>`}
        </div>
        <div class="media-suggestion-copy">
          <strong>${escapeHtml(item.title)}</strong>
          ${item.category ? `<small>${escapeHtml(item.category)}</small>` : ""}
          ${item.based_on ? `<small class="suggestion-based-on">Dựa trên: ${escapeHtml(item.based_on)}</small>` : ""}
        </div>
        <div class="suggestion-actions">
          <button type="button" class="accept-suggestion-btn" data-id="${item.id}" data-type="${type}">+ Thêm</button>
          <button type="button" class="dismiss-suggestion-btn" data-id="${item.id}" data-type="${type}">Bỏ qua</button>
        </div>
      </article>`).join("")
    : '<p class="media-empty">Chưa có gợi ý mới</p>';
}

function mediaEntryHtml(item, type) {
  const isDone = item.status === "da";
  const config = getMediaTypeConfig(type);
  return `
    <article class="media-entry-card ${isDone ? "is-done" : "is-wanted"}" data-id="${item.id}" data-type="${type}" data-title="${escapeHtml(item.title)}" data-external-id="${item.external_id || ""}">
      <button type="button" class="media-entry-open">
        <span class="media-entry-cover">
          ${item.cover_url ? `<img src="${item.cover_url}" alt="" class="media-entry-poster">` : `<span class="media-cover-placeholder">${config.icon}</span>`}
          <span class="media-status-badge">${getStatusBadgeLabel(type, item.status)}</span>
        </span>
        <span class="media-entry-copy">
          <strong>${escapeHtml(item.title)}</strong>
          ${item.category ? `<small>${escapeHtml(item.category)}</small>` : ""}
          ${isDone && item.experienced_at ? `<small>${formatMediaDate(item.experienced_at)}</small>` : ""}
          ${isDone && item.rating ? `<span class="media-rating">${ratingStars(item.rating)}</span>` : ""}
          ${isDone && item.review ? `<p class="media-review">${escapeHtml(item.review)}</p>` : ""}
        </span>
      </button>
      <div class="media-entry-actions">
        ${!isDone ? '<button type="button" class="mark-done-btn">Đánh dấu xong</button>' : ""}
        <button type="button" class="delete-btn" data-endpoint="${config.endpoint}" data-id="${item.id}">Xoá</button>
      </div>
      ${!isDone ? `
        <div class="media-mark-form" hidden>
          <select class="rating-select">
            <option value="">Đánh giá</option>
            <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
          </select>
          <input type="text" class="review-input" placeholder="Nhận xét ngắn...">
          <input type="date" class="experienced-input">
          <button type="button" class="save-mark-btn" data-endpoint="${config.endpoint}" data-id="${item.id}">Lưu</button>
        </div>` : ""}
    </article>`;
}

function renderMediaCollection(type) {
  if (!mediaHubCollection || !mediaHubCollectionMeta) return;
  const items = mediaState.itemsByType[type] || [];
  const wanted = items.filter((item) => item.status === "muon");
  const done = items.filter((item) => item.status === "da");
  const sortDir = doneSortState[type] || "desc";
  const sortedDone = [...done].sort((a, b) => {
    const dateA = a.experienced_at ? new Date(a.experienced_at) : new Date(0);
    const dateB = b.experienced_at ? new Date(b.experienced_at) : new Date(0);
    return sortDir === "asc" ? dateA - dateB : dateB - dateA;
  });

  mediaHubCollectionMeta.textContent = getMediaSummaryText(type, items);
  mediaHubSortDoneBtn.textContent = sortDir === "asc" ? "↑ Cũ nhất" : "↓ Mới nhất";

  mediaHubCollection.innerHTML = `
    <section class="media-collection-group">
      <div class="media-collection-heading">
        <h5>${getMediaTypeConfig(type).wantedLabel}</h5>
        <span>${wanted.length}</span>
      </div>
      <div class="media-entry-grid">
        ${wanted.length ? wanted.map((item) => mediaEntryHtml(item, type)).join("") : '<p class="media-empty">Chưa có mục nào trong danh sách</p>'}
      </div>
    </section>
    <section class="media-collection-group">
      <div class="media-collection-heading">
        <h5>${getMediaTypeConfig(type).doneLabel}</h5>
        <span>${sortedDone.length}</span>
      </div>
      <div class="media-entry-grid">
        ${sortedDone.length ? sortedDone.map((item) => mediaEntryHtml(item, type)).join("") : '<p class="media-empty">Chưa có mục nào hoàn thành</p>'}
      </div>
    </section>`;

  if (typeof setCardSummary === "function") {
    setCardSummary("section-media-hub", `${getMediaTypeConfig(type).icon} ${getMediaTypeConfig(type).label}: ${getMediaSummaryText(type, items)}`);
  }
}

function renderMediaHub() {
  const type = getCurrentMediaType();
  renderMediaHubCopy(type);
  renderSuggestions(type);
  renderMediaCollection(type);
}

async function fetchMediaType(type) {
  const config = getMediaTypeConfig(type);
  const res = await fetch(`${API_BASE}${config.endpoint}`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;
  mediaState.itemsByType[type] = await res.json();
}

async function fetchSuggestions(type) {
  const config = getMediaTypeConfig(type);
  if (!config.suggestable) {
    mediaState.suggestionsByType[type] = [];
    return;
  }
  const res = await fetch(`${API_BASE}/api/suggestions/${type}`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;
  mediaState.suggestionsByType[type] = await res.json();
}

async function loadMedia() {
  const types = Object.keys(MEDIA_TYPES);
  await Promise.all(types.map((type) => fetchMediaType(type)));
  await Promise.all(types.map((type) => fetchSuggestions(type)));
  renderMediaHub();
}

async function reloadMediaType(type) {
  await fetchMediaType(type);
  await fetchSuggestions(type);
  if (type === getCurrentMediaType()) renderMediaHub();
}

async function addMediaItem(type, payload) {
  const config = getMediaTypeConfig(type);
  const res = await fetch(`${API_BASE}${config.endpoint}`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) {
    mediaHubResults.innerHTML = '<p class="media-empty">Không thể thêm mục này lúc này.</p>';
    return;
  }
  mediaHubResults.innerHTML = '<p class="media-empty">Đã thêm vào danh sách.</p>';
  await reloadMediaType(type);
}

async function toggleMovieDetail(card) {
  const type = card.dataset.type;
  if (type !== "movies") return;
  let detailEl = card.querySelector(".media-detail");
  if (detailEl) {
    detailEl.remove();
    return;
  }

  detailEl = document.createElement("div");
  detailEl.className = "media-detail";
  detailEl.textContent = "Đang tải...";
  card.appendChild(detailEl);

  const externalId = card.dataset.externalId;
  const title = card.dataset.title;
  const res = await fetch(`${API_BASE}/api/movies/detail?external_id=${encodeURIComponent(externalId)}&title=${encodeURIComponent(title)}`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) {
    detailEl.textContent = "Không tải được thông tin chi tiết.";
    return;
  }
  const data = await res.json();
  detailEl.innerHTML = `
    <p class="media-overview">${escapeHtml(data.overview || "Chưa có mô tả.")}</p>
    <p class="media-ratings">${data.imdb ? `⭐ IMDb ${data.imdb}` : ""}${data.tomatometer ? ` · 🍅 ${data.tomatometer}` : ""}</p>`;
}

if (mediaHubType) {
  mediaHubType.addEventListener("change", () => {
    renderMediaHub();
    mediaHubResults.innerHTML = "";
  });
}

if (mediaHubSortDoneBtn) {
  mediaHubSortDoneBtn.addEventListener("click", () => {
    const type = getCurrentMediaType();
    doneSortState[type] = doneSortState[type] === "asc" ? "desc" : "asc";
    renderMediaCollection(type);
  });
}

if (refreshMediaSuggestionsBtn) {
  refreshMediaSuggestionsBtn.addEventListener("click", async () => {
    const type = getCurrentMediaType();
    const config = getMediaTypeConfig(type);
    if (!config.suggestable) return;
    const originalText = refreshMediaSuggestionsBtn.textContent;
    refreshMediaSuggestionsBtn.disabled = true;
    refreshMediaSuggestionsBtn.textContent = "Đang tìm...";
    const refreshPath = type === "movies" ? "/api/movies/refresh-suggestions" : "/api/books/refresh-suggestions";
    const res = await fetch(`${API_BASE}${refreshPath}`, { ...FETCH_OPTS, method: "POST" });
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      refreshMediaSuggestionsBtn.disabled = false;
      refreshMediaSuggestionsBtn.textContent = originalText;
      return;
    }
    if (!res.ok) {
      refreshMediaSuggestionsBtn.disabled = false;
      refreshMediaSuggestionsBtn.textContent = originalText;
      return;
    }
    await fetchSuggestions(type);
    renderSuggestions(type);
    refreshMediaSuggestionsBtn.disabled = false;
    refreshMediaSuggestionsBtn.textContent = originalText;
  });
}

if (mediaHubForm) {
  mediaHubForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = getCurrentMediaType();
    const config = getMediaTypeConfig(type);
    const query = mediaHubQuery.value.trim();
    if (!query) return;

    if (!config.searchable) {
      renderMediaHubResults([{ title: query, cover_url: "", manual: true }], type);
      return;
    }

    const res = await fetch(`${API_BASE}${config.searchEndpoint}?q=${encodeURIComponent(query)}`, FETCH_OPTS);
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      return;
    }
    if (!res.ok) {
      renderMediaHubResults([], type);
      return;
    }
    const results = await res.json();
    renderMediaHubResults(results, type);
  });
}

document.addEventListener("click", async (e) => {
  const hubResultEl = e.target.closest(".media-hub-result");
  if (hubResultEl) {
    const results = JSON.parse(mediaHubResults.dataset.results || "[]");
    const item = results[hubResultEl.dataset.index];
    const type = hubResultEl.dataset.type;
    await addMediaItem(type, {
      title: item.title,
      cover_url: item.cover_url || "",
      status: "muon",
      external_id: item.external_id || "",
      category: item.category || "",
    });
    return;
  }

  if (e.target.matches(".accept-suggestion-btn")) {
    const type = e.target.dataset.type;
    const res = await fetch(`${API_BASE}/api/suggestions/${e.target.dataset.id}/accept`, { ...FETCH_OPTS, method: "POST" });
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      return;
    }
    if (!res.ok) return;
    await reloadMediaType(type);
    return;
  }

  if (e.target.matches(".dismiss-suggestion-btn")) {
    const type = e.target.dataset.type;
    const res = await fetch(`${API_BASE}/api/suggestions/${e.target.dataset.id}`, { ...FETCH_OPTS, method: "DELETE" });
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      return;
    }
    if (!res.ok) return;
    await fetchSuggestions(type);
    if (type === getCurrentMediaType()) renderSuggestions(type);
    return;
  }

  if (e.target.matches(".mark-done-btn")) {
    const card = e.target.closest(".media-entry-card");
    const form = card.querySelector(".media-mark-form");
    if (form) form.hidden = !form.hidden;
    return;
  }

  if (e.target.matches(".save-mark-btn")) {
    const endpoint = e.target.dataset.endpoint;
    const id = e.target.dataset.id;
    const type = Object.keys(MEDIA_TYPES).find((key) => MEDIA_TYPES[key].endpoint === endpoint);
    const wrap = e.target.closest(".media-mark-form");
    const rating = wrap.querySelector(".rating-select").value;
    const review = wrap.querySelector(".review-input").value.trim();
    const experiencedAt = wrap.querySelector(".experienced-input").value;
    const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
      ...FETCH_OPTS,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "da",
        rating: rating ? parseInt(rating, 10) : null,
        review: review || null,
        experienced_at: experiencedAt || null,
      }),
    });
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      return;
    }
    if (!res.ok) return;
    await reloadMediaType(type);
    return;
  }

  if (e.target.matches(".delete-btn[data-endpoint]")) {
    const endpoint = e.target.dataset.endpoint;
    const id = e.target.dataset.id;
    const type = Object.keys(MEDIA_TYPES).find((key) => MEDIA_TYPES[key].endpoint === endpoint);
    const res = await fetch(`${API_BASE}${endpoint}/${id}`, { ...FETCH_OPTS, method: "DELETE" });
    if (res.status === 401) {
      if (typeof showLogin === "function") showLogin();
      return;
    }
    if (!res.ok) return;
    await reloadMediaType(type);
    return;
  }

  const mediaOpenBtn = e.target.closest(".media-entry-open");
  if (mediaOpenBtn) {
    await toggleMovieDetail(mediaOpenBtn.closest(".media-entry-card"));
  }
});
