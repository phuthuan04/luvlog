const activityForm = document.getElementById("activityForm");
const activityList = document.getElementById("activityList");
const categoryLabel = { an_uong: "Ăn uống", vui_choi: "Vui chơi", khac: "Khác" };

function renderActivities(items) {
  if (!items.length) {
    activityList.innerHTML = '<li class="activity-empty">Chưa có hoạt động nào</li>';
    return;
  }
  const countByPlace = {};
  items.forEach((a) => { countByPlace[a.place_name] = (countByPlace[a.place_name] || 0) + 1; });

  activityList.innerHTML = items
    .map((a) => `
      <li class="activity-item">
        <div class="activity-header">
          <span class="activity-place">${escapeHtml(a.place_name)}${countByPlace[a.place_name] > 1 ? ` <small>(x${countByPlace[a.place_name]})</small>` : ""}</span>
          <button type="button" class="delete-btn" data-activity-id="${a.id}">Xoá</button>
        </div>
        <span class="activity-meta">${categoryLabel[a.category] || a.category} · ${a.visited_at ? a.visited_at.slice(0, 10) : ""}</span>
        ${a.note ? `<p class="activity-note">${escapeHtml(a.note)}</p>` : ""}
      </li>`)
    .join("");
}

async function loadActivities() {
  const res = await fetch(`${API_BASE}/api/activities`, FETCH_OPTS);
  if (res.status === 401) {
    if (typeof showLogin === "function") showLogin();
    return;
  }
  const items = await res.json();
  renderActivities(items);
}

activityForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const place_name = document.getElementById("activityPlace").value.trim();
  const category = document.getElementById("activityCategory").value;
  const visited_at = document.getElementById("activityDate").value;
  const note = document.getElementById("activityNote").value.trim();
  if (!place_name || !category || !visited_at) return;

  await fetch(`${API_BASE}/api/activities`, {
    ...FETCH_OPTS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ place_name, category, visited_at, note }),
  });
  activityForm.reset();
  loadActivities();
});

document.addEventListener("click", async (e) => {
  if (e.target.matches("[data-activity-id]")) {
    await fetch(`${API_BASE}/api/activities/${e.target.dataset.activityId}`, { ...FETCH_OPTS, method: "DELETE" });
    loadActivities();
  }
});