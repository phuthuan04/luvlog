function initUI() {
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