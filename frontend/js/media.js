const MEDIA_SECTIONS = [
  { type: "movies", endpoint: "/api/movies" },
  { type: "books", endpoint: "/api/books" },
  { type: "songs", endpoint: "/api/songs" },
];

function ratingStars(n) {
  if (!n) return "";
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function renderMediaList(container, items, endpoint) {
  const wanted = items.filter((i) => i.status === "muon");
  const done = items.filter((i) => i.status === "da");

  const wantedHtml = wanted.length
    ? wanted.map((i) => `
      <li class="media-item" data-id="${i.id}">
        ${i.cover_url ? `<img src="${i.cover_url}" alt="" class="media-cover-img">` : ""}
        <div class="media-info">
          <span>${escapeHtml(i.title)}</span>
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
      </li>`).join("")
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
}

function loadMedia() {
  MEDIA_SECTIONS.forEach((s) => loadMediaSection(s.type, s.endpoint));
}

MEDIA_SECTIONS.forEach((s) => {
  const section = document.querySelector(`[data-media="${s.type}"]`);
  const form = section.querySelector(".media-form");
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

document.addEventListener("click", async (e) => {
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