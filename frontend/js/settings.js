async function loadSettings() {
  const res = await fetch(`${API_BASE}/api/settings`, FETCH_OPTS);
  if (res.status === 401) { if (typeof showLogin === "function") showLogin(); return; }
  const data = await res.json();
  document.getElementById("settingsStartDate").value = data.start_date || "";
  document.getElementById("settingsName1").value = data.name_1 || "";
  document.getElementById("settingsName2").value = data.name_2 || "";
  if (typeof setCardSummary === "function") {
    setCardSummary("section-settings", `${data.name_1} ❤️ ${data.name_2}`);
  }
}

document.getElementById("settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const start_date = document.getElementById("settingsStartDate").value;
  const name_1 = document.getElementById("settingsName1").value.trim();
  const name_2 = document.getElementById("settingsName2").value.trim();
  await fetch(`${API_BASE}/api/settings`, {
    ...FETCH_OPTS, method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start_date, name_1, name_2 }),
  });
  if (typeof initCounter === "function") initCounter();
  loadSettings();
});

async function loadQuotes() {
  const res = await fetch(`${API_BASE}/api/quotes`, FETCH_OPTS);
  if (res.status === 401) return;
  const quotes = await res.json();
  const list = document.getElementById("quoteList");
  list.innerHTML = quotes.length
    ? quotes.map((q) => `<li>${escapeHtml(q.content)} <button type="button" class="delete-quote-btn" data-id="${q.id}">Xoá</button></li>`).join("")
    : '<li class="quote-empty">Chưa có câu nào</li>';
}

document.getElementById("quoteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = document.getElementById("quoteInput").value.trim();
  if (!content) return;
  await fetch(`${API_BASE}/api/quotes`, {
    ...FETCH_OPTS, method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  document.getElementById("quoteInput").value = "";
  loadQuotes();
});

document.addEventListener("click", async (e) => {
  if (e.target.matches(".delete-quote-btn")) {
    await fetch(`${API_BASE}/api/quotes/${e.target.dataset.id}`, { ...FETCH_OPTS, method: "DELETE" });
    loadQuotes();
  }
});