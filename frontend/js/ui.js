function initUI() {
  initCollapsibleCards();
  loadDailyQuote();
  const sections = document.querySelectorAll(".reveal");
  const tabs = document.querySelectorAll(".tab-link");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );
  sections.forEach((s) => revealObserver.observe(s));

  const tabObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          tabs.forEach((t) => t.classList.toggle("active", t.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => { if (s.id) tabObserver.observe(s); });
}

function initCollapsibleCards() {
  document.querySelectorAll(".card[data-collapsible]").forEach((card) => {
    const header = card.querySelector(".card-header");
    if (!header) return;
    header.addEventListener("click", () => card.classList.toggle("collapsed"));
  });
}

function setCardSummary(sectionId, text) {
  const el = document.querySelector(`#${sectionId} .card-summary`);
  if (el) el.textContent = text;
}

async function loadDailyQuote() {
  const el = document.getElementById("dailyQuoteText");
  if (!el) return;
  try {
    const res = await fetch(`${API_BASE}/api/quotes/random`, FETCH_OPTS);
    if (res.ok) {
      const data = await res.json();
      el.textContent = data.content;
    }
  } catch (e) {}
}