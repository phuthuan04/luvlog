let settingsState = {
  start_date: "",
  name_1: "",
  name_2: "",
  telegram_webhook_url: "",
  discord_webhook_url: "",
};

function showSettingsStatus(message, isError = false) {
  const statusEl = document.getElementById("notificationTestStatus");
  if (!statusEl) return;
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
}

async function saveSettingsPartial(payload) {
  const res = await fetch(`${API_BASE}/api/settings`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return false;
  }
  return res.ok;
}

async function loadSettings() {
  const res = await fetch(`${API_BASE}/api/settings`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (!res.ok) return;

  const data = await res.json();
  settingsState = { ...settingsState, ...data };
  document.getElementById("settingsStartDate").value = data.start_date || "";
  document.getElementById("settingsName1").value = data.name_1 || "";
  document.getElementById("settingsName2").value = data.name_2 || "";
  document.getElementById("telegramWebhookUrl").value = data.telegram_webhook_url || "";
  document.getElementById("discordWebhookUrl").value = data.discord_webhook_url || "";

  if (typeof setCardSummary === "function") {
    setCardSummary("section-settings", `${data.name_1 || "Bạn"} ❤️ ${data.name_2 || "Người ấy"}`);
  }
}

document.getElementById("settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    start_date: document.getElementById("settingsStartDate").value,
    name_1: document.getElementById("settingsName1").value.trim(),
    name_2: document.getElementById("settingsName2").value.trim(),
  };
  const ok = await saveSettingsPartial(payload);
  if (!ok) return;
  settingsState = { ...settingsState, ...payload };
  if (typeof initCounter === "function") initCounter();
  await loadSettings();
});

document.getElementById("notificationSettingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    telegram_webhook_url: document.getElementById("telegramWebhookUrl").value.trim(),
    discord_webhook_url: document.getElementById("discordWebhookUrl").value.trim(),
  };
  const ok = await saveSettingsPartial(payload);
  if (!ok) {
    showSettingsStatus("Không thể lưu webhook lúc này.", true);
    return;
  }
  settingsState = { ...settingsState, ...payload };
  showSettingsStatus("Đã lưu cấu hình webhook.");
});

async function testWebhook(provider) {
  showSettingsStatus(`Đang gửi thử ${provider}...`);
  const res = await fetch(`${API_BASE}/api/settings/notifications/test`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider }),
  });
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  if (res.ok) {
    showSettingsStatus(`Đã gửi thử ${provider} thành công.`);
    return;
  }
  let message = `Không gửi thử được ${provider}.`;
  try {
    const data = await res.json();
    if (data.detail) message = data.detail;
  } catch (e) {}
  showSettingsStatus(message, true);
}

document.getElementById("testTelegramWebhookBtn").addEventListener("click", async () => {
  await testWebhook("telegram");
});

document.getElementById("testDiscordWebhookBtn").addEventListener("click", async () => {
  await testWebhook("discord");
});

async function loadQuotes() {
  const res = await fetch(`${API_BASE}/api/quotes`, FETCH_OPTS);
  if (res.status === 401) return;
  if (!res.ok) return;
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
  const res = await fetch(`${API_BASE}/api/quotes`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) return;
  document.getElementById("quoteInput").value = "";
  await loadQuotes();
});

document.addEventListener("click", async (e) => {
  if (!e.target.matches(".delete-quote-btn")) return;
  const res = await fetch(`${API_BASE}/api/quotes/${e.target.dataset.id}`, { ...FETCH_OPTS, method: "DELETE" });
  if (!res.ok) return;
  await loadQuotes();
});
