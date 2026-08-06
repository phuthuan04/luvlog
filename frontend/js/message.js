const API_BASE = "https://luvlog.vercel.app";
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
  loadMessage();
  if (typeof loadJournal === "function") loadJournal();
  if (typeof loadPhotos === "function") loadPhotos();
  if (typeof loadFund === "function") loadFund();
  if (typeof loadActivities === "function") loadActivities();
  if (typeof loadMedia === "function") loadMedia();
  if (typeof initUI === "function") initUI();
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

  if (res.status === 401) {
    showLogin();
    return;
  }

  document.getElementById("messageInput").value = "";
  loadMessage();
});

(async () => {
  const user = await checkSession();
  if (user) showApp(user);
  else showLogin();
})();
