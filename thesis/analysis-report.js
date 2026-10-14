/* Create a portable HTML snapshot from the currently selected public workbench view. */
(() => {
  "use strict";
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const cleanCss = css => css.replace(/@font-face\s*\{[^}]*\}/g, "").replace(/url\([^)]*\)/g, "none");
  async function makeReport(button) {
    const panel = button.closest(".demo-panel");
    if (!panel) return;
    button.disabled = true;
    try {
      const tab = document.querySelector('[aria-controls="' + panel.id + '"]');
      const copy = panel.cloneNode(true);
      copy.querySelectorAll("[data-download-analysis], .chart-tooltip, .demo-status, .demo-error").forEach(node => node.remove());
      copy.querySelectorAll("details").forEach(node => { node.open = true; });
      copy.querySelectorAll("button").forEach(node => {
        const text = document.createElement("span"); text.className = node.className; text.textContent = node.textContent.trim();
        node.replaceWith(text);
      });
      copy.querySelectorAll("input, select, textarea").forEach(control => {
        const wrapper = document.createElement("span"); wrapper.className = "report-control-value";
        const label = control.closest("label"), title = label?.querySelector(".control-heading, span:first-child")?.textContent || label?.childNodes[0]?.textContent || "Selection";
        const value = control.type === "checkbox" ? (control.checked ? "Yes" : "No") : control.tagName === "SELECT" ? control.selectedOptions[0]?.textContent : (control.value + (control.type === "range" ? "%" : ""));
        wrapper.textContent = String(title).trim() + ": " + String(value || "").trim(); control.replaceWith(wrapper);
      });
      copy.querySelectorAll("[hidden]").forEach(node => { if (node.tagName !== "INPUT") node.remove(); });
      copy.querySelectorAll("a[href^='#']").forEach(link => { const text = document.createElement("span"); text.textContent = link.textContent; link.replaceWith(text); });
      copy.querySelectorAll("a[target]").forEach(link => link.setAttribute("rel", "noopener"));
      copy.querySelectorAll(".chart-data").forEach(details => { details.open = true; });
      const stylesheetPaths = ["/thesis/thesis.css", "/thesis/workbench-ui.css", "/thesis/research-overview.css"];
      const styleSheets = await Promise.all(stylesheetPaths.map(async path => {
        const response = await fetch(path, {credentials:"same-origin"});
        if (!response.ok) throw new Error("Could not include the site styles in the report.");
        return cleanCss(await response.text());
      }));
      const lang = document.documentElement.lang || "en", dir = document.documentElement.dir || "ltr";
      const t = (key, values = {}) => window.noorThesisI18n?.t(key, values) || key;
      const title = t("Iraq’s Economic Outlook — {section}", {section:tab?.textContent.trim() || t("Research analysis")});
      const snapshot = document.getElementById("snapshot-label")?.textContent.trim() || "Saved source snapshots";
      const data = window.noorThesisData || {}, provenance = data.research_v2 || {};
      const metadata = [snapshot, data.metadata?.source_commit ? t("Website source revision: {commit}", {commit:data.metadata.source_commit}) : "", data.metadata?.snapshot_dates ? t("Source snapshot dates: {dates}", {dates:data.metadata.snapshot_dates.join(", ")}) : "", provenance.selected_source_sha256 ? t("Selected source subset SHA-256: {hash}", {hash:provenance.selected_source_sha256}) : ""].filter(Boolean).map(escapeHtml).join(" · ");
      const html = '<!doctype html><html lang="' + escapeHtml(lang) + '" dir="' + escapeHtml(dir) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + escapeHtml(title) + '</title><style>' + styleSheets.join("\n") + '\n:root{color-scheme:dark}body{margin:0;padding:2rem;background:#101714;color:#e9e0cf;font-family:Arial,sans-serif}.report{max-width:1100px;margin:auto}.report-head{border-bottom:1px solid #39413b;padding-bottom:1rem;margin-bottom:1.5rem}.report-head p{color:#30c4a0;font-family:monospace}.report .demo-panel{display:block!important}.report .analysis-download{display:none}.report .optional-data{margin-top:2rem}.report .optional-data details{border:1px solid #39413b;padding:1rem}.report .report-control-value{display:inline-block;margin:.3rem .5rem .3rem 0;padding:.5rem .75rem;border:1px solid #536057;border-radius:.3rem;color:#e9e0cf}.report a{color:#30c4a0}.report svg{max-width:100%}.report footer{color:#aaa99c;border-top:1px solid #39413b;margin-top:2rem;padding-top:1rem}@media(max-width:600px){body{padding:1rem}}</style></head><body><main class="report"><header class="report-head"><p>' + escapeHtml(t("Research analysis · Iraq")) + '</p><h1>' + escapeHtml(title) + '</h1><span>' + metadata + '</span></header>' + copy.outerHTML + '<footer>' + escapeHtml(t("Research browser preview · Explanations and evidence reflect the controls shown in this report. Source links require internet access.")) + '</footer></main></body></html>';
      const blob = new Blob([html], {type:"text/html;charset=utf-8"}), url = URL.createObjectURL(blob), anchor = document.createElement("a");
      anchor.href = url; anchor.download = "iraq-analysis-" + panel.id.replace("panel-", "") + ".html"; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      window.alert(error.message || "The analysis report could not be prepared.");
    } finally { button.disabled = false; }
  }
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-download-analysis]");
    if (button) makeReport(button);
  });
})();
