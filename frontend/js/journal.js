const journalForm = document.getElementById("journalForm");
const journalList = document.getElementById("journalList");

function formatJournalDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(text) {
  const el = document.createElement("span");
  el.textContent = text;
  return el.innerHTML;
}

function journalItemHtml(e) {
  return `
    <li class="timeline-item" data-id="${e.id}">
      <span class="timeline-node">${e.mood || "📓"}</span>
      <div class="timeline-card">
        <div class="timeline-view">
          <div class="timeline-header">
            <h3>${escapeHtml(e.title)}</h3>
            <div class="timeline-actions">
              <button type="button" class="edit-journal-btn">✎</button>
              <button type="button" class="delete-journal-btn" data-id="${e.id}">🗑</button>
            </div>
          </div>
          <time>${formatJournalDate(e.created_at)} · ${escapeHtml(e.author)}</time>
          <p>${escapeHtml(e.content)}</p>
        </div>
        <form class="timeline-edit-form" hidden>
          <input type="text" class="edit-title-input" value="${escapeHtml(e.title)}">
          <select class="edit-mood-select">
            <option value="" ${!e.mood ? "selected" : ""}>🙂 Bình thường</option>
            <option value="❤️" ${e.mood === "❤️" ? "selected" : ""}>❤️ Yêu thương</option>
            <option value="🎉" ${e.mood === "🎉" ? "selected" : ""}>🎉 Vui vẻ</option>
            <option value="😢" ${e.mood === "😢" ? "selected" : ""}>😢 Buồn</option>
            <option value="✈️" ${e.mood === "✈️" ? "selected" : ""}>✈️ Đi chơi</option>
            <option value="🍽️" ${e.mood === "🍽️" ? "selected" : ""}>🍽️ Ăn uống</option>
          </select>
          <textarea class="edit-content-input">${escapeHtml(e.content)}</textarea>
          <div class="timeline-edit-actions">
            <button type="submit" class="save-journal-btn" data-id="${e.id}">Lưu</button>
            <button type="button" class="cancel-journal-btn">Huỷ</button>
          </div>
        </form>
      </div>
    </li>`;
}

function renderJournal(entries) {
  journalList.innerHTML = entries.length ? entries.map(journalItemHtml).join("") : '<li class="journal-empty">Chưa có bài viết nào</li>';
}

// Load journal entries on page load
async function loadJournal() {
  const res = await fetch(`${API_BASE}/api/journal`, FETCH_OPTS);
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  const entries = await res.json();
  renderJournal(entries);
  const previewEl = document.getElementById("previewJournal");
  if (previewEl) {
    previewEl.innerHTML = entries.slice(0, 2).map((e) => `<li>${escapeHtml(e.title)}</li>`).join("") || '<li class="preview-empty">Chưa có gì</li>';
  }
  if (typeof setCardSummary === "function") {
    setCardSummary("section-journal", entries.length ? `Mới nhất: "${entries[0].title}"` : "Chưa có bài viết nào");
  }
}

// Handle journal form submission
journalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("journalTitle").value.trim();
  const content = document.getElementById("journalContent").value.trim();
  const mood = document.getElementById("journalMood").value;
  if (!title || !content) return;
  const res = await fetch(`${API_BASE}/api/journal`, {
    ...FETCH_OPTS, method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, mood }),
  });
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  journalForm.reset();
  loadJournal();
});

document.addEventListener("click", (e) => {
  if (e.target.matches(".edit-journal-btn")) {
    const item = e.target.closest(".timeline-item");
    item.querySelector(".timeline-view").hidden = true;
    item.querySelector(".timeline-edit-form").hidden = false;
    return;
  }
  if (e.target.matches(".cancel-journal-btn")) {
    const item = e.target.closest(".timeline-item");
    item.querySelector(".timeline-view").hidden = false;
    item.querySelector(".timeline-edit-form").hidden = true;
    return;
  }
  if (e.target.matches(".delete-journal-btn")) {
    if (!confirm("Xoá bài viết này?")) return;
    fetch(`${API_BASE}/api/journal/${e.target.dataset.id}`, { ...FETCH_OPTS, method: "DELETE" }).then(loadJournal);
  }
});

document.addEventListener("submit", async (e) => {
  if (e.target.matches(".timeline-edit-form")) {
    e.preventDefault();
    const id = e.target.querySelector(".save-journal-btn").dataset.id;
    const title = e.target.querySelector(".edit-title-input").value.trim();
    const content = e.target.querySelector(".edit-content-input").value.trim();
    const mood = e.target.querySelector(".edit-mood-select").value;
    await fetch(`${API_BASE}/api/journal/${id}`, {
      ...FETCH_OPTS, method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, mood }),
    });
    loadJournal();
  }
});