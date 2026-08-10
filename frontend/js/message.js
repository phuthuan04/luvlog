const API_BASE = (location.hostname === "127.0.0.1" || location.hostname === "localhost")
  ? "http://127.0.0.1:8000"
  : "https://luvlog.vercel.app";
const FETCH_OPTS = { credentials: "include" };
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

function showLogin() {
  loginSection.hidden = false;
  appSection.hidden = true;
}

function showApp(username) {
  loginSection.hidden = true;
  appSection.hidden = false;
  userDisplay.textContent = username;
  loadMessageFeed();
  if (typeof loadJournal === "function") loadJournal();
  if (typeof loadPhotos === "function") loadPhotos();
  if (typeof loadFund === "function") loadFund();
  if (typeof loadActivities === "function") loadActivities();
  if (typeof loadMedia === "function") loadMedia();
  if (typeof initUI === "function") initUI();
  if (typeof initCounter === "function") initCounter();
  if (typeof loadSettings === "function") loadSettings();
  if (typeof loadQuotes === "function") loadQuotes();
}

async function checkSession() {
  const res = await fetch(`${API_BASE}/api/me`, FETCH_OPTS);
  const data = await res.json();
  return data.user;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.hidden = true;

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/api/login`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    loginError.textContent = "Sai tên đăng nhập hoặc mật khẩu";
    loginError.hidden = false;
    return;
  }

  loginForm.reset();
  showApp(username);
});

logoutBtn.addEventListener("click", async () => {
  await fetch(`${API_BASE}/api/logout`, { ...FETCH_OPTS, method: "POST" });
  showLogin();
});

async function loadMessage() {
  const res = await fetch(`${API_BASE}/api/message`, FETCH_OPTS);
  if (res.status === 401) {
    showLogin();
    return;
  }
  const data = await res.json();
  document.getElementById("messageDisplay").textContent = data.content || "(chưa có lời nhắn)";
}

document.getElementById("messageSubmit").addEventListener("click", async () => {
  const content = document.getElementById("messageInput").value.trim();
  if (!content) return;
  const res = await fetch(`${API_BASE}/api/message`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (res.status === 401) { showLogin(); return; }
  document.getElementById("messageInput").value = "";
  loadMessageFeed();
});

function timeAgo(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function messageItemHtml(m, index) {
  const opacity = Math.max(1 - index * 0.15, 0.35);
  return `
    <li class="message-feed-item" data-id="${m.id}" style="opacity:${opacity}">
      <div class="message-feed-header">
        <span class="message-feed-author">${escapeHtml(m.created_by || "?")}</span>
        <span class="message-feed-time">${timeAgo(m.updated_at)}</span>
      </div>
      <p class="message-feed-content">${escapeHtml(m.content)}</p>
      <button type="button" class="toggle-comments-btn" data-id="${m.id}">💬 Bình luận</button>
      <div class="message-comments" hidden>
        <ul class="comment-list"></ul>
        <form class="comment-form" data-id="${m.id}">
          <input type="text" class="comment-input" placeholder="Trả lời...">
          <button type="submit">Gửi</button>
        </form>
      </div>
    </li>`;
}

async function loadMessageFeed() {
  const res = await fetch(`${API_BASE}/api/messages`, FETCH_OPTS);
  if (res.status === 401) { showLogin(); return; }
  const messages = await res.json();
  const feed = document.getElementById("messageFeed");
  feed.innerHTML = messages.length
    ? messages.map((m, i) => messageItemHtml(m, i)).join("")
    : '<li class="message-empty">Chưa có lời nhắn nào</li>';
  if (typeof setCardSummary === "function") {
    setCardSummary("section-message", messages.length ? `"${messages[0].content}"` : "Chưa có lời nhắn nào");
  }
}

async function loadComments(messageId, listEl) {
  const res = await fetch(`${API_BASE}/api/messages/${messageId}/comments`, FETCH_OPTS);
  if (res.status === 401) { showLogin(); return; }
  const comments = await res.json();
  listEl.innerHTML = comments.length
    ? comments.map((c) => `<li><strong>${escapeHtml(c.created_by)}:</strong> ${escapeHtml(c.content)}</li>`).join("")
    : '<li class="message-empty">Chưa có bình luận</li>';
}

document.addEventListener("click", async (e) => {
  if (e.target.matches(".toggle-comments-btn")) {
    const item = e.target.closest(".message-feed-item");
    const box = item.querySelector(".message-comments");
    box.hidden = !box.hidden;
    if (!box.hidden) await loadComments(e.target.dataset.id, box.querySelector(".comment-list"));
  }
});

document.addEventListener("submit", async (e) => {
  if (e.target.matches(".comment-form")) {
    e.preventDefault();
    const messageId = e.target.dataset.id;
    const input = e.target.querySelector(".comment-input");
    const content = input.value.trim();
    if (!content) return;
    await fetch(`${API_BASE}/api/messages/${messageId}/comments`, {
      ...FETCH_OPTS, method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    input.value = "";
    await loadComments(messageId, e.target.closest(".message-comments").querySelector(".comment-list"));
  }
});

(async () => {
  const user = await checkSession();
  if (user) showApp(user);
  else showLogin();
})();
