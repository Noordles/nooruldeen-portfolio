/* The portfolio presentation transport, using the original thesis slides. */
(() => {
  "use strict";
  const presentation = document.querySelector("[data-thesis-presentation]");
  if (!presentation) return;
  const slides = JSON.parse(document.getElementById("pitch-slides").textContent);
  const t = source => window.noorThesisI18n?.t(source) ?? source;
  const find = name => presentation.querySelector(`[data-slide-${name}]`);
  const image = find("image"), count = find("count"), title = find("title"), copy = find("copy");
  const previous = find("previous"), next = find("next"), progress = find("progress");
  const track = presentation.querySelector(".presentation-progress");
  let active = 0, seeker;
  function show(index) {
    active = Math.max(0, Math.min(slides.length - 1, index));
    const slide = slides[active];
    image.src = slide.image; image.alt = t(slide.title);
    count.textContent = `${String(active + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    title.textContent = t(slide.title); copy.textContent = t(slide.copy);
    previous.disabled = active === 0; next.disabled = active === slides.length - 1;
    progress.style.width = `${100 * (active + 1) / slides.length}%`;
    track.setAttribute("aria-valuenow", String(active + 1));
    track.setAttribute("aria-valuemax", String(slides.length));
    seeker?.update(active);
    const upcoming = slides[active + 1];
    if (upcoming) { const preload = new Image(); preload.src = upcoming.image; }
  }
  previous.addEventListener("click", () => show(active - 1));
  next.addEventListener("click", () => show(active + 1));
  presentation.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = window.noorThesisI18n?.language === "ar" ? -1 : 1;
    show(active + (event.key === "ArrowRight" ? direction : -direction));
  });
  window.addEventListener("noor-thesis-language", () => show(active));
  seeker=window.NoorPresentationSeek?.attach(track,slides.length,show,()=>active,{language:()=>window.noorThesisI18n?.language||"en"});
  show(0);
})();
