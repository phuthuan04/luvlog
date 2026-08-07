// ⚠️ SỬA NGÀY NÀY THÀNH NGÀY BẮT ĐẦU YÊU NHAU
const startDate = new Date("2025-04-07T00:00:00");

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
  const timeStr = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date());

  // Lọc chỉ lấy đúng phần HH:mm:ss (xóa bỏ chữ GMT+7 nếu có)
  const cleanTime = timeStr.replace(/\s*GMT.*$/, "");
  
  document.getElementById("liveClock").textContent = cleanTime;
}

updateCounter();
updateClock();
setInterval(updateCounter, 60000);
setInterval(updateClock, 1000);