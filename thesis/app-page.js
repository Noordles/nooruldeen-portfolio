(() => {
  "use strict";
  const frame = document.querySelector("[data-app-frame]");
  const button = document.querySelector("[data-enter-fullscreen]");
  if (!frame || !button) return;
  const translate = source => window.noorThesisI18n?.t(source) ?? source;
  const update = () => {
    const active = document.fullscreenElement === frame;
    const label = translate(active ? "Exit full screen" : "Full screen");
    button.firstChild.textContent = label;
    button.setAttribute("aria-label", translate(active ? "Exit full screen" : "Enter full screen"));
  };
  button.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement === frame) await document.exitFullscreen();
      else await frame.requestFullscreen();
    } catch (_) {
      button.title = "Use the direct app link if full screen is unavailable in this browser.";
    }
  });
  document.addEventListener("fullscreenchange", update);
  window.addEventListener("noor-thesis-language", update);
  if (!frame.requestFullscreen) button.hidden = true;
})();
