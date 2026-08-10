const journalForm = document.getElementById("journalForm");
const journalList = document.getElementById("journalList");

function formatJournalDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatJournalPreviewDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function journalItemHtml(entry) {
  return `
    <li class="timeline-item" data-id="${entry.id}">
      <span class="timeline-node">${entry.mood || "📓"}</span>
      <div class="timeline-card">
        <div class="timeline-view">
          <div class="timeline-header">
            <div>
              <h3>${escapeHtml(entry.title)}</h3>
              <time>${formatJournalDate(entry.created_at)} · ${escapeHtml(entry.author)}</time>
            </div>
            <div class="timeline-actions">
              <button type="button" class="edit-journal-btn">✎</button>
              <button type="button" class="delete-journal-btn" data-id="${entry.id}">🗑</button>
            </div>
          </div>
          <p>${escapeHtml(entry.content)}</p>
        </div>
        <form class="timeline-edit-form" hidden>
          <input type="text" class="edit-title-input" value="${escapeHtml(entry.title)}">
          <select class="edit-mood-select">
            <option value="" ${!entry.mood ? "selected" : ""}>🙂 Bình thường</option>
            <option value="❤️" ${entry.mood === "❤️" ? "selected" : ""}>❤️ Yêu thương</option>
            <option value="🎉" ${entry.mood === "🎉" ? "selected" : ""}>🎉 Vui vẻ</option>
            <option value="😢" ${entry.mood === "😢" ? "selected" : ""}>😢 Buồn</option>
            <option value="✈️" ${entry.mood === "✈️" ? "selected" : ""}>✈️ Đi chơi</option>
            <option value="🍽️" ${entry.mood === "🍽️" ? "selected" : ""}>🍽️ Ăn uống</option>
          </select>
          <textarea class="edit-content-input">${escapeHtml(entry.content)}</textarea>
          <div class="timeline-edit-actions">
            <button type="submit" class="save-journal-btn" data-id="${entry.id}">Lưu</button>
            <button type="button" class="cancel-journal-btn">Huỷ</button>
          </div>
        </form>
      </div>
    </li>`;
}

function renderJournal(entries) {
  journalList.innerHTML = entries.length
    ? entries.map(journalItemHtml).join("")
    : '<li class="journal-empty">Chưa có bài viết nào</li>';
}

function renderJournalPreview(entries) {
  const previewEl = document.getElementById("previewJournal");
  if (!previewEl) return;
  previewEl.innerHTML = entries.slice(0, 2).map((entry) => `
    <li class="preview-entry">
      <span class="preview-entry-title">${entry.mood || "📓"} ${escapeHtml(truncateText(entry.title, 30))}</span>
      <span class="preview-entry-meta">${formatJournalPreviewDate(entry.created_at)}</span>
    </li>`).join("") || '<li class="preview-empty">Chưa có gì</li>';
}

async function loadJournal() {
  const res = await fetch(`${API_BASE}/api/journal`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;

  const entries = await res.json();
  renderJournal(entries);
  renderJournalPreview(entries);

  const journalMeta = document.getElementById("journalMeta");
  if (journalMeta) {
    journalMeta.textContent = entries.length ? `${entries.length} mốc đã lưu` : "Bắt đầu viết mốc đầu tiên của hai bạn.";
  }

  if (typeof setCardSummary === "function") {
    setCardSummary("section-journal", entries.length ? `Mới nhất: "${truncateText(entries[0].title, 40)}"` : "Chưa có bài viết nào");
  }
}

journalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("journalTitle").value.trim();
  const content = document.getElementById("journalContent").value.trim();
  const mood = document.getElementById("journalMood").value;
  if (!title || !content) return;
  const res = await fetch(`${API_BASE}/api/journal`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, mood }),
  });
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;
  journalForm.reset();
  await loadJournal();
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
    fetch(`${API_BASE}/api/journal/${e.target.dataset.id}`, { ...FETCH_OPTS, method: "DELETE" }).then((res) => {
      if (res.ok) loadJournal();
    });
  }
});

document.addEventListener("submit", async (e) => {
  if (!e.target.matches(".timeline-edit-form")) return;
  e.preventDefault();
  const id = e.target.querySelector(".save-journal-btn").dataset.id;
  const title = e.target.querySelector(".edit-title-input").value.trim();
  const content = e.target.querySelector(".edit-content-input").value.trim();
  const mood = e.target.querySelector(".edit-mood-select").value;
  const res = await fetch(`${API_BASE}/api/journal/${id}`, {
    ...FETCH_OPTS,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, mood }),
  });
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;
  await loadJournal();
});
