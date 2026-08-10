// Ngày bắt đầu yêu nhau (Default: 07/04/2025)
let startDate = new Date(2025, 3, 7); // Tháng trong JS bắt đầu từ 0 (Tháng 4 = 3)

// Hàm parse chuỗi ngày an toàn cho mọi trình duyệt
function parseSafeDate(dateStr) {
  if (!dateStr) return null;
  // Xử lý các định dạng YYYY-MM-DD hoặc YYYY/MM/DD
  const cleanStr = dateStr.split("T")[0].replace(/\//g, "-");
  const parts = cleanStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // Tháng 0-11
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

async function initCounter() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`, FETCH_OPTS);
    if (res.ok) {
      const data = await res.json();
      
      // Parse ngày an toàn tránh lỗi Invalid Date
      if (data.start_date) {
        const parsed = parseSafeDate(data.start_date);
        if (parsed) startDate = parsed;
      }

      const el = document.getElementById("avatarInitials");
      if (el) {
        const name1 = (data.name_1 || "B").trim()[0];
        const name2 = (data.name_2 || "N").trim()[0];
        el.textContent = `${name1}❤️${name2}`;
      }
    }
  } catch (e) {
    console.warn("Lỗi fetch API settings, dùng cấu hình mặc định:", e);
  } finally {
    // Luôn cập nhật lại giao diện dù API thành công hay thất bại
    updateCounter();
  }
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
  if (months < 0) {
    months += 12;
    years--;
  }
  return { years, months, days };
}

function updateCounter() {
  if (isNaN(startDate.getTime())) return; // Tránh crash nếu ngày lỗi

  const now = new Date();
  
  // Reset giờ về 00:00:00 để tính chính xác số ngày trọn vẹn
  const startZero = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowZero - startZero;
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const e = getElapsedYMD(startZero, nowZero);

  // Cập nhật DOM an toàn (chỉ gán nếu Element tồn tại)
  const setElText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setElText("totalDays", totalDays);
  setElText("years", e.years);
  setElText("months", e.months);
  setElText("days", e.days);
  setElText("sinceLabel", `${formatDMY(startDate)} – ${formatDMY(now)}`);
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const el = document.getElementById("liveClock");
  if (el) el.textContent = `${hours}:${minutes}:${seconds}`;
}

// KHỞI CHẠY LẦN ĐẦU
updateClock();
updateCounter(); // Gọi đếm ngày ngay lập tức
initCounter();   // Lấy dữ liệu API và cập nhật lại

// THIẾT LẬP VÒNG LẶP
setInterval(updateClock, 1000);
setInterval(updateCounter, 60000);