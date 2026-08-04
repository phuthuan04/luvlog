const API_BASE = "https://luvlog.vercel.app";
const FETCH_OPTS = { credentials: "include" };

const journalForm = document.getElementById("journalForm");
const journalList = document.getElementById("journalList");

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderJournal(entries) {
  if (!entries.length) {
    journalList.innerHTML = '<li class="journal-empty">Chưa có bài viết nào</li>';
    return;
  }

  journalList.innerHTML = entries
    .map(
      (e) => `
      <li class="journal-entry">
        <time>${formatDate(e.created_at)}</time>
        <h3>${escapeHtml(e.title)}</h3>
        <p>${escapeHtml(e.content)}</p>
        <span class="journal-author">${escapeHtml(e.author)}</span>
      </li>`
    )
    .join("");
}

function escapeHtml(text) {
  const el = document.createElement("span");
  el.textContent = text;
  return el.innerHTML;
}

async function loadJournal() {
  const res = await fetch(`${API_BASE}/api/journal`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  const entries = await res.json();
  renderJournal(entries);
}

journalForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("journalTitle").value.trim();
  const content = document.getElementById("journalContent").value.trim();
  if (!title || !content) return;

  const res = await fetch(`${API_BASE}/api/journal`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }

  journalForm.reset();
  loadJournal();
});
