const progress = document.querySelector("#reading-progress");
const year = document.querySelector("#year");
const railLinks = [...document.querySelectorAll(".rail-link")];
if (year) year.textContent = new Date().getFullYear();

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = `${amount}%`;
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const revealTargets = document.querySelectorAll(
  ".about-heading, .about-body, .work-heading, .work-card, .hobbies-heading, .hobby-card, .photos-heading, .photo-card, .contact-content"
);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  if (window.location.hash !== link.hash) {
    try { history.pushState(null, "", link.hash); } catch { /* file previews can restrict history updates */ }
  }
  target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
});

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeLink = railLinks.find((link) => link.hash === `#${entry.target.id}`);
        if (activeLink) {
          railLinks.forEach((link) => {
            const isActive = link === activeLink;
            link.classList.toggle("active", isActive);
            if (isActive) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      }
    });
  }, { rootMargin: "-25% 0px -60% 0px" });

  document.querySelectorAll("main > section[id]").forEach((section) => sectionObserver.observe(section));

  if (!reducedMotion) {
    revealTargets.forEach((element) => element.classList.add("reveal"));
    const revealObserver = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element) => revealObserver.observe(element));
  }
}
