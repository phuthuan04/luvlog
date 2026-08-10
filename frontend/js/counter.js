// Ngày bắt đầu yêu nhau, mặc định là 7/4/2025 nếu chưa cài Settings
let startDate = new Date("2025-04-07T00:00:00"); // fallback nếu chưa cài Settings

async function initCounter() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, FETCH_OPTS);
    if (res.ok) {
      const data = await res.json();
      if (data.start_date) startDate = new Date(data.start_date + "T00:00:00");
      const el = document.getElementById("avatarInitials");
      if (el) el.textContent = `${(data.name_1 || "B")[0]}❤️${(data.name_2 || "N")[0]}`;
    }
  } catch (e) {}
  updateCounter();
}

function formatDMY(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function getElapsedYMD(start, now) {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) {
    const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += daysInPrevMonth;
    months--;
  }
  if (months < 0) { months += 12; years--; }
  return { years, months, days };
}

function updateCounter() {
  const now = new Date();
  const e = getElapsedYMD(startDate, now);
  const totalDays = Math.floor((now - startDate) / 86400000);
  document.getElementById("totalDays").textContent = totalDays;
  document.getElementById("years").textContent = e.years;
  document.getElementById("months").textContent = e.months;
  document.getElementById("days").textContent = e.days;
  document.getElementById("sinceLabel").textContent = `${formatDMY(startDate)} – ${formatDMY(now)}`;
}

function updateClock() {
  const now = new Date();
  
  // Lấy các giá trị giờ, phút, giây định dạng 2 chữ số
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Ghép lại chỉ còn HH:mm:ss
  document.getElementById("liveClock").textContent = `${hours}:${minutes}:${seconds}`;
}

updateClock();
setInterval(updateCounter, 60000);
setInterval(updateClock, 1000);