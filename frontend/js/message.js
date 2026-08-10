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

function escapeHtml(text) {
  const el = document.createElement("span");
  el.textContent = text || "";
  return el.innerHTML;
}

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

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageSummary(text) {
  if (!text) return "Chưa có lời nhắn nào";
  return text.length > 72 ? `${text.slice(0, 72)}...` : text;
}

function renderMessageSpotlight(message) {
  const spotlight = document.getElementById("messageSpotlight");
  if (!spotlight) return;
  if (!message) {
    spotlight.innerHTML = '<p class="message-empty">Chưa có lời nhắn nào.</p>';
    return;
  }

  spotlight.innerHTML = `
    <div class="message-spotlight-mark">💌</div>
    <div class="message-spotlight-copy">
      <p class="message-spotlight-label">Lời nhắn mới nhất</p>
      <p class="message-spotlight-text">${escapeHtml(message.content)}</p>
      <p class="message-spotlight-meta">${escapeHtml(message.created_by || "?")} · ${formatDateTime(message.updated_at)}${message.comment_count ? ` · ${message.comment_count} phản hồi` : ""}</p>
    </div>`;
}

function commentToggleLabel(count, open) {
  if (!count) return open ? "Ẩn phản hồi" : "💬 Bình luận";
  return open ? `Ẩn ${count} phản hồi` : `💬 ${count} phản hồi`;
}

function messageItemHtml(message, index) {
  const opacity = Math.max(1 - index * 0.14, 0.38);
  return `
    <li class="message-feed-item" data-id="${message.id}" style="opacity:${opacity}">
      <div class="message-feed-header">
        <span class="message-feed-author">${escapeHtml(message.created_by || "?")}</span>
        <span class="message-feed-time">${formatDateTime(message.updated_at)}</span>
      </div>
      <p class="message-feed-content">${escapeHtml(message.content)}</p>
      <div class="message-feed-footer">
        <button type="button" class="toggle-comments-btn" data-id="${message.id}" data-count="${message.comment_count || 0}">
          ${commentToggleLabel(message.comment_count || 0, false)}
        </button>
      </div>
      <div class="message-comments" hidden>
        <ul class="comment-list"></ul>
        <form class="comment-form" data-id="${message.id}">
          <input type="text" class="comment-input" placeholder="Trả lời...">
          <button type="submit">Gửi</button>
        </form>
      </div>
    </li>`;
}

async function loadMessageFeed() {
  const res = await fetch(`${API_BASE}/api/messages`, FETCH_OPTS);
  if (res.status === 401) {
    showLogin();
    return;
  }
  if (!res.ok) return;

  const messages = await res.json();
  const feed = document.getElementById("messageFeed");
  const meta = document.getElementById("messageFeedMeta");
  feed.innerHTML = messages.length
    ? messages.map((message, index) => messageItemHtml(message, index)).join("")
    : '<li class="message-empty">Chưa có lời nhắn nào</li>';

  if (meta) {
    meta.textContent = messages.length ? `${messages.length} lời nhắn gần đây` : "Bắt đầu viết lời nhắn đầu tiên cho nhau.";
  }

  renderMessageSpotlight(messages[0] || null);

  if (typeof setCardSummary === "function") {
    setCardSummary("section-message", messages.length ? `"${formatMessageSummary(messages[0].content)}"` : "Chưa có lời nhắn nào");
  }
}

async function loadComments(messageId, listEl, toggleBtn) {
  const res = await fetch(`${API_BASE}/api/messages/${messageId}/comments`, FETCH_OPTS);
  if (res.status === 401) {
    showLogin();
    return;
  }
  if (!res.ok) return;

  const comments = await res.json();
  listEl.innerHTML = comments.length
    ? comments.map((comment) => `
      <li class="comment-item">
        <div class="comment-header">
          <strong>${escapeHtml(comment.created_by)}</strong>
          <span>${formatDateTime(comment.created_at)}</span>
        </div>
        <p>${escapeHtml(comment.content)}</p>
      </li>`).join("")
    : '<li class="message-empty">Chưa có phản hồi nào</li>';

  if (toggleBtn) {
    toggleBtn.dataset.count = comments.length;
    toggleBtn.textContent = commentToggleLabel(comments.length, true);
  }
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
  if (res.status === 401) {
    showLogin();
    return;
  }
  if (!res.ok) return;
  document.getElementById("messageInput").value = "";
  await loadMessageFeed();
});

document.addEventListener("click", async (e) => {
  if (!e.target.matches(".toggle-comments-btn")) return;
  const item = e.target.closest(".message-feed-item");
  const box = item.querySelector(".message-comments");
  box.hidden = !box.hidden;
  const count = parseInt(e.target.dataset.count || "0", 10);
  e.target.textContent = commentToggleLabel(count, !box.hidden);
  if (!box.hidden) {
    await loadComments(e.target.dataset.id, box.querySelector(".comment-list"), e.target);
  }
});

document.addEventListener("submit", async (e) => {
  if (!e.target.matches(".comment-form")) return;
  e.preventDefault();
  const messageId = e.target.dataset.id;
  const input = e.target.querySelector(".comment-input");
  const content = input.value.trim();
  if (!content) return;
  const res = await fetch(`${API_BASE}/api/messages/${messageId}/comments`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (res.status === 401) {
    showLogin();
    return;
  }
  if (!res.ok) return;
  input.value = "";
  const wrapper = e.target.closest(".message-comments");
  const item = e.target.closest(".message-feed-item");
  const toggleBtn = item.querySelector(".toggle-comments-btn");
  await loadComments(messageId, wrapper.querySelector(".comment-list"), toggleBtn);
  await loadMessageFeed();
});

document.addEventListener("DOMContentLoaded", async () => {
  const user = await checkSession();
  if (user) showApp(user);
  else showLogin();
});
