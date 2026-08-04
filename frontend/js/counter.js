// ⚠️ SỬA NGÀY NÀY THÀNH NGÀY BẮT ĐẦU YÊU NHAU
const startDate = new Date("2025-04-07T00:00:00");

function getElapsed(start, now) {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();
  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += daysInPrevMonth; months--;
  }
  if (months < 0) { months += 12; years--; }
  return { years, months, days, hours, minutes, seconds };
}

function updateCounter() {
  const e = getElapsed(startDate, new Date());
  document.getElementById("years").textContent = e.years;
  document.getElementById("months").textContent = e.months;
  document.getElementById("days").textContent = e.days;
  document.getElementById("hours").textContent = e.hours;
  document.getElementById("minutes").textContent = e.minutes;
  document.getElementById("seconds").textContent = e.seconds;
}

updateCounter();
setInterval(updateCounter, 1000);