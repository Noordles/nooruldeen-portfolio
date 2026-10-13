/* Browser preview of saved results. New model fits remain in the Python app. */
(() => {
  "use strict";
  let data = null, activePanel = "history", latestScenario = [], loadController, errorMessage = null;
  const selectedCountries = new Set();
  const t = (source, values = {}) => window.noorThesisI18n?.t(source,values) ?? source.replace(/\{([a-z_]+)\}/g, (_,key) => String(values[key] ?? "{"+key+"}"));
  const locale = () => window.noorThesisI18n?.locale || "en-GB";
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const number = (value, digits = 2) => Number(value).toLocaleString(locale(), {maximumFractionDigits:digits, minimumFractionDigits:digits});
  const exactNumber = value => value.toLocaleString(locale(), {maximumFractionDigits:12});
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const periodLabel = period => new Date(period + "-01T12:00:00Z").toLocaleDateString(locale(), {month:"short", year:"numeric",timeZone:"UTC"});
  const controls = [...document.querySelectorAll(".demo-shell select, .demo-shell input, #export-scenario, #show-all-countries")];

  function validate(payload) {
    if (!payload?.annual || !Array.isArray(payload.annual.years) || !payload.annual.years.length ||
        !Array.isArray(payload.annual.rows) || !payload.annual.countries || !payload.annual.indicators ||
        !Array.isArray(payload.monthly_forecasts) || !payload.monthly_forecasts.length ||
        !Array.isArray(payload.scenario_baseline) || !payload.scenario_baseline.length ||
        !Array.isArray(payload.peers) || !payload.peers.length) {
      throw new Error("The saved preview has an unexpected data format.");
    }
    for (const row of payload.scenario_baseline) {
      if (!finite(row.year) || !finite(row.revenue_billion_iqd) || !finite(row.expenditure_billion_iqd) ||
          !finite(row.gdp_billion_iqd) || row.gdp_billion_iqd <= 0) {
        throw new Error("The saved scenario contains an incomplete baseline.");
      }
    }
    for (const row of payload.peers) {
      if (typeof row.country !== "string" || typeof row.country_name !== "string" ||
          !["oil","income","manufacturing"].every(key => finite(row.delta_squared?.[key]) && row.delta_squared[key] >= 0)) {
        throw new Error("The saved country comparisons are incomplete.");
      }
    }
    return payload;
  }

  function drawChart(id, x, series, options = {}) {
    const target = $(id);
    if (!target) return;
    target.classList.toggle("chart-many-series",series.length>4);
    const width = Math.max(240, Math.round(target.clientWidth)), mobile = width < 600;
    const height = mobile ? 285 : 360, left = mobile ? 58 : 76, right = 20, top = 38, bottom = 58;
    const values = series.flatMap(item => item.y.filter(finite));
    if (options.band) values.push(...options.band.low.filter(finite), ...options.band.high.filter(finite));
    if (!x.length || !values.length) {
      target.innerHTML = '<p class="chart-note">'+escape(t('No observations are available in this saved window.'))+'</p>';
      return;
    }
    let low = Math.min(...values), high = Math.max(...values);
    if (low === high) { low -= 1; high += 1; }
    const pad = (high - low) * .12;
    low -= pad; high += pad;
    if (options.nonNegative) low = Math.max(0,low);
    const X = index => left + (width - left - right) * index / Math.max(1, x.length - 1);
    const Y = value => top + (height - top - bottom) * (high - value) / (high - low);
    const points = rows => rows.map((value, index) => finite(value) ? [X(index), Y(value)] : null);
    const path = rows => {
      let connected = false;
      return points(rows).map(point => {
        if (!point) { connected = false; return ""; }
        const command = connected ? "L" : "M"; connected = true;
        return command + point.map(value => value.toFixed(2)).join(",");
      }).join(" ");
    };
    const tick = value => (Math.abs(value) >= 10000
      ? new Intl.NumberFormat(locale(), {notation:"compact", maximumFractionDigits:1}).format(value)
      : number(value, Math.max(Math.abs(low), Math.abs(high)) >= 1000 ? 0 : 1)) + (options.percent ? "%" : "");
    const title = options.title || t("Saved research chart");
    let svg = '<svg viewBox="0 0 ' + width + " " + height + '" role="img" tabindex="0" aria-describedby="' + id + '-help" aria-labelledby="' + id + '-title ' + id + '-description">' +
      '<title id="' + id + '-title">' + escape(title) + '</title><desc id="' + id + '-description">' +
      escape(series.map(item => item.name).join(" · ")) + ". " + escape(t("Horizontal axis: {period}. Vertical axis: {unit}. Exact observations are available in the chart data table below.",
        {period:t(options.periods ? "Month" : "Year"),unit:options.axisLabel || options.units || t("Value")})) + "</desc>";
    svg += '<text x="' + left + '" y="15" class="chart-axis-title">' + escape(options.axisLabel || options.units || t("Value")) +
      '</text><text x="' + ((left+width-right)/2) + '" y="' + (height-3) + '" text-anchor="middle" class="chart-axis-title">' +
      escape(t(options.periods ? "Month" : "Year")) + "</text>";
    for (let index = 0; index <= 4; index++) {
      const value = low + (high - low) * index / 4, y = Y(value);
      svg += '<line x1="' + left + '" y1="' + y + '" x2="' + (width - right) + '" y2="' + y + '" class="chart-gridline"/>' +
        '<text x="' + (left - 9) + '" y="' + (y + 4) + '" class="chart-axis-label" text-anchor="end">' + escape(tick(value)) + "</text>";
    }
    const tickCount = Math.min(x.length, mobile ? 3 : 6);
    const indices = [...new Set(Array.from({length:tickCount}, (_, index) => Math.round(index * (x.length - 1) / Math.max(1, tickCount - 1))))];
    for (const index of indices) {
      svg += '<text x="' + X(index) + '" y="' + (height - 13) + '" class="chart-axis-label" text-anchor="middle">' +
        escape(options.periods ? periodLabel(x[index]) : x[index]) + "</text>";
    }
    if (low < 0 && high > 0) svg += '<line x1="' + left + '" y1="' + Y(0) + '" x2="' + (width - right) + '" y2="' + Y(0) + '" class="chart-zero"/>';
    if (options.band) {
      let segment = [];
      const finishBand = () => {
        if (segment.length > 1) {
          const polygon = segment.map(index => [X(index), Y(options.band.high[index])])
            .concat([...segment].reverse().map(index => [X(index), Y(options.band.low[index])]));
          svg += '<polygon points="' + polygon.map(point => point.join(",")).join(" ") + '" class="chart-interval"/>';
        }
        segment = [];
      };
      x.forEach((_, index) => {
        if (finite(options.band.low[index]) && finite(options.band.high[index])) segment.push(index);
        else finishBand();
      });
      finishBand();
    }
    series.forEach((item,index) => {
      svg += '<path data-series-index="' + index + '" class="chart-series' + (item.reference ? ' chart-reference' : '') + (selectedCountries.has(item.code) ? ' is-selected' : '') + '" d="' + path(item.y) + '" fill="none" stroke="' + item.color + '"' +
        (item.dash ? ' stroke-dasharray="7 5"' : "") + "/>";
      if (x.length <= 6) for (const point of points(item.y).filter(Boolean)) {
        svg += '<circle cx="' + point[0] + '" cy="' + point[1] + '" r="3.5" fill="' + item.color + '"/>';
      }
    });
    svg += '<g class="chart-focus" hidden><line x1="0" y1="' + top + '" x2="0" y2="' + (height-bottom) + '"/><circle r="5"/></g></svg>';
    const legendSeries = options.legendSeries || series;
    const legend = '<div class="chart-legend">' + [...legendSeries].sort((a,b) => Number(!!b.reference)-Number(!!a.reference)).map(item => options.onCountrySelect
      ? '<button type="button" data-country="'+escape(item.code)+'" aria-pressed="'+String(selectedCountries.has(item.code))+'" aria-label="'+escape(t("Select {country}",{country:item.name}))+'"><i style="--series-color:'+item.color+'"></i>'+escape(item.name)+'</button>'
      : '<span><i style="--series-color:' + item.color + '"></i>' + escape(item.name) + "</span>").join("") +
      (options.band ? '<span class="interval-key"><i></i>'+escape(t("95% prediction interval"))+'</span>' : "") + "</div>";
    const headings = series.map(item => "<th scope=\"col\">" + escape(item.name) + "</th>").join("") +
      (options.band ? '<th scope="col">'+escape(t("95% lower"))+'</th><th scope="col">'+escape(t("95% upper"))+'</th>' : "");
    const cell = value => "<td>" + (finite(value) ? escape(exactNumber(value)) : "—") + "</td>";
    const rows = x.map((value, index) => '<tr><th scope="row">' + escape(options.periods ? periodLabel(value) : value) + "</th>" +
      series.map(item => cell(item.y[index])).join("") + (options.band ? cell(options.band.low[index]) + cell(options.band.high[index]) : "") + "</tr>").join("");
    target.classList.toggle("chart-has-selection",!!options.onCountrySelect && selectedCountries.size>0);
    target.innerHTML = legend + svg + '<p class="sr-only" id="' + id + '-help">'+escape(t("Hover or tap a line for its saved value. With the chart focused, use left and right arrows for periods, up and down for series, and Escape to close the details."))+'</p><div class="chart-tooltip" role="tooltip" hidden></div><details class="chart-data"><summary>'+escape(t("View chart values"))+'</summary><div class="table-scroll"><table><caption>' +
      escape(title) + '</caption><thead><tr><th scope="col">'+escape(t("Period"))+'</th>' + headings + "</tr></thead><tbody>" + rows + "</tbody></table></div></details>";
    target.querySelectorAll("button[data-country]").forEach(button => button.addEventListener("click",() => options.onCountrySelect(button.dataset.country,false)));
    const chart = target.querySelector("svg"), tooltip = target.querySelector(".chart-tooltip"), focus = chart.querySelector(".chart-focus");
    const focusLine = focus.querySelector("line"), focusPoint = focus.querySelector("circle");
    let selectedIndex = x.length-1, selectedSeries = 0;
    function hideDetails() {
      tooltip.hidden = true; focus.setAttribute("hidden","");
      chart.querySelectorAll(".chart-series").forEach(line => line.classList.remove("is-active"));
    }
    function showDetails(index, seriesIndex, pointer) {
      const item = series[seriesIndex], value = item.y[index];
      if (!finite(value)) { hideDetails(); return; }
      selectedIndex = index; selectedSeries = seriesIndex;
      const label = options.periods ? periodLabel(x[index]) : x[index];
      tooltip.innerHTML = '<span class="tooltip-period">' + escape(label) + '</span><strong>' + escape(item.name) +
        '</strong><span class="tooltip-value">' + escape(exactNumber(value)) + '</span>' +
        (options.units ? '<span class="tooltip-units">' + escape(options.units) + '</span>' : '') +
        (options.band && finite(options.band.low[index]) && finite(options.band.high[index]) ?
          '<span class="tooltip-interval">'+escape(t('95% interval'))+'<br>' + escape(exactNumber(options.band.low[index])) + ' '+escape(t('to'))+' ' + escape(exactNumber(options.band.high[index])) + '</span>' : '');
      tooltip.hidden = false; focus.removeAttribute("hidden");
      focusLine.setAttribute("x1",X(index)); focusLine.setAttribute("x2",X(index));
      focusPoint.setAttribute("cx",X(index)); focusPoint.setAttribute("cy",Y(value)); focusPoint.setAttribute("fill",item.color);
      chart.querySelectorAll(".chart-series").forEach(line => line.classList.toggle("is-active",Number(line.dataset.seriesIndex)===seriesIndex));
      const box = chart.getBoundingClientRect(), container = target.getBoundingClientRect();
      const px = pointer ? pointer.clientX-container.left : box.left-container.left+X(index)*box.width/width;
      const py = pointer ? pointer.clientY-container.top : box.top-container.top+Y(value)*box.height/height;
      tooltip.style.left = Math.max(8,Math.min(px+15,target.clientWidth-tooltip.offsetWidth-8))+"px";
      tooltip.style.top = Math.max(box.top-container.top,Math.min(py+15,box.bottom-container.top-tooltip.offsetHeight-8))+"px";
    }
    function inspect(event) {
      const box = chart.getBoundingClientRect(), px = (event.clientX-box.left)*width/box.width, py = (event.clientY-box.top)*height/box.height;
      if (px<left || px>width-right || py<top || py>height-bottom) { hideDetails(); return; }
      const index = Math.max(0,Math.min(x.length-1,Math.round((px-left)/(width-left-right)*Math.max(1,x.length-1))));
      const candidates = series.map((item,seriesIndex) => ({seriesIndex,value:item.y[index]})).filter(item => finite(item.value));
      candidates.sort((a,b) => Math.abs(Y(a.value)-py)-Math.abs(Y(b.value)-py));
      if (candidates.length) {
        if (event.type === "pointerdown" && options.onCountrySelect) { options.onCountrySelect(series[candidates[0].seriesIndex].code,true,event); return; }
        showDetails(index,candidates[0].seriesIndex,event);
      }
      else hideDetails();
    }
    chart.addEventListener("pointermove",inspect);
    chart.addEventListener("pointerdown",inspect);
    chart.addEventListener("pointerleave",event => { if(event.pointerType!=="touch") hideDetails(); });
    chart.addEventListener("blur",hideDetails);
    chart.addEventListener("keydown",event => {
      if (["Enter"," "].includes(event.key) && options.onCountrySelect) { event.preventDefault(); options.onCountrySelect(series[selectedSeries].code,true); return; }
      if (!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Escape"].includes(event.key)) return;
      event.preventDefault();
      if(event.key==="Escape") { hideDetails(); return; }
      let index=selectedIndex, seriesIndex=selectedSeries;
      if(event.key==="ArrowLeft" || event.key==="ArrowRight") index=Math.max(0,Math.min(x.length-1,index+(event.key==="ArrowRight"?1:-1)));
      else seriesIndex=(seriesIndex+(event.key==="ArrowDown"?1:-1)+series.length)%series.length;
      showDetails(index,seriesIndex);
    });
    if(options.initialPointer) inspect({...options.initialPointer,type:"pointermove"});
  }

  function history(initialPointer) {
    if (!data) return;
    const key = $("indicator").value, definition = data.annual.indicators[key];
    if (!definition) return;
    const years = data.annual.years;
    const countries = Object.keys(data.annual.countries).filter(country => country!=="IRQ").sort((a,b) => data.annual.countries[a].localeCompare(data.annual.countries[b]));
    countries.push("IRQ");
    const series = countries.map(country => ({code:country,name:t(data.annual.countries[country]),color:country==="IRQ"?"#d18b98":"#30c4a0",reference:country==="IRQ",
      y:years.map(year => data.annual.rows.find(row => row.country===country && row.year===year)?.[key] ?? null)}));
    const selectedOnly = $("selected-only").checked && selectedCountries.size>0;
    const visible = selectedOnly ? series.filter(item => selectedCountries.has(item.code)) : series;
    drawChart("history-chart", years, visible, {title:t("{label} in {units}",{label:t(definition.label),units:t(definition.units)}),units:t(definition.units),
      axisLabel:key==="gdp_per_capita" ? t("USD per person · 2015 prices") : t(definition.units),percent:key!=="gdp_per_capita",nonNegative:key!=="growth",
      legendSeries:series,initialPointer,onCountrySelect:(country,exclusive,pointer) => {
        if(exclusive) { selectedCountries.clear(); selectedCountries.add(country); }
        else if(selectedCountries.has(country)) selectedCountries.delete(country);
        else selectedCountries.add(country);
        history(pointer && {clientX:pointer.clientX,clientY:pointer.clientY});
        if(!exclusive) $("history-chart").querySelector('button[data-country="'+country+'"]').focus({preventScroll:true});
      }});
    $("country-selection-status").textContent = selectedCountries.size ? t(selectedOnly ? "Showing only: {countries}." : "Focused: {countries}. All countries remain visible.",
      {countries:series.filter(item => selectedCountries.has(item.code)).map(item => item.name).join(" · ")}) : t($("selected-only").checked ? "Choose countries from the legend to filter the chart." : "All {count} countries are visible.",{count:series.length});
    const rows = data.annual.rows.filter(row => row.country === "IRQ" && finite(row[key])).sort((a,b) => a.year - b.year);
    $("history-note").textContent = t("{label} · {units}. Iraq has {count} available annual values{window}. {note}",
      {label:t(definition.label),units:t(definition.units),count:rows.length,window:rows.length ? ", "+rows[0].year+"–"+rows.at(-1).year : "",note:t(definition.note)});
  }

  function forecasts() {
    if (!data) return;
    const model = $("forecast-model").value, rows = data.monthly_forecasts.filter(row => row.model === model);
    drawChart("forecast-chart", rows.map(row => row.period), [{name:model,color:"#d18b98",y:rows.map(row => row.prediction_trillion_iqd),dash:true}],
      {title:t("Saved monthly revenue forecast in nominal trillion IQD"),units:t("nominal trillion IQD"),axisLabel:t("Revenue · trillion IQD"),periods:true,band:{low:rows.map(row => row.pi95_low),high:rows.map(row => row.pi95_high)}});
  }

  function scenarios() {
    if (!data) return;
    const price = Number($("oil-price").value) / 100, share = Number($("oil-share").value) / 100;
    $("price-label").value = number(price * 100, 0) + "%"; $("share-label").value = number(share * 100, 0) + "%";
    latestScenario = data.scenario_baseline.map(row => {
      const revenue = row.revenue_billion_iqd * (share * (1 + price) + (1 - share));
      const baseline = 100 * (row.revenue_billion_iqd - row.expenditure_billion_iqd) / row.gdp_billion_iqd;
      const scenario = 100 * (revenue - row.expenditure_billion_iqd) / row.gdp_billion_iqd;
      return {year:row.year,baseline_balance_pct_gdp:baseline,scenario_balance_pct_gdp:scenario,change_percentage_points:scenario-baseline,
        scenario_revenue_billion_iqd:revenue,fixed_expenditure_billion_iqd:row.expenditure_billion_iqd,fixed_gdp_billion_iqd:row.gdp_billion_iqd};
    });
    const first = latestScenario[0];
    $("scenario-stats").innerHTML = '<div><small>' + escape(t("{year} baseline balance",{year:first.year})) + '</small><strong>' + number(first.baseline_balance_pct_gdp) +
      '%</strong><small>'+escape(t("of baseline GDP"))+'</small></div><div><small>' + escape(t("{year} scenario balance",{year:first.year})) + '</small><strong>' + number(first.scenario_balance_pct_gdp) +
      '%</strong><small>'+escape(t("of fixed baseline GDP"))+'</small></div><div><small>'+escape(t("Change in balance"))+'</small><strong>' + number(first.change_percentage_points) +
      '</strong><small>'+escape(t("percentage points"))+'</small></div>';
    drawChart("scenario-chart", latestScenario.map(row => row.year),
      [{name:t("IMF baseline"),color:"#aaa99c",y:latestScenario.map(row => row.baseline_balance_pct_gdp)},
       {name:t("My scenario"),color:"#30c4a0",y:latestScenario.map(row => row.scenario_balance_pct_gdp)}],
      {title:t("Conditional annual fiscal balance as percent of fixed GDP"),units:t("% of fixed baseline GDP"),axisLabel:t("Budget balance · % of GDP"),percent:true});
  }

  function peers() {
    if (!data) return;
    const ids = ["oil","income","manufacturing"], weights = ids.map(id => Number($(id + "-weight").value));
    ids.forEach((id,index) => $(id + "-weight-label").value = String(weights[index]));
    const sum = weights.reduce((a,b) => a+b,0);
    $("peer-warning").textContent = t(sum ? "I put the three features on a common scale so that their different units do not decide the ranking." :
      "Choose at least one positive weight to calculate a ranking. All loaded countries are still listed below.");
    const ranked = data.peers.map(row => ({...row,distance:sum ? Math.sqrt(ids.reduce((total,id,index) => total + row.delta_squared[id] * weights[index] / sum, 0)) : null}))
      .sort((a,b) => sum ? a.distance - b.distance || a.country.localeCompare(b.country) : t(a.country_name).localeCompare(t(b.country_name),locale()));
    const max = Math.max(...ranked.map(row => row.distance ?? 0), .001);
    $("peer-results").innerHTML = '<div class="peer-row peer-reference"><span class="rank">'+escape(t('REF'))+'</span><span>'+escape(t('Iraq'))+' <small>'+escape(t('reference country'))+'</small></span><div class="peer-bar"><span style="width:0%"></span></div><span class="distance">'+number(0,3)+'</span></div>' +
      ranked.map((row,index) => '<div class="peer-row"><span class="rank">' + (sum ? String(index + 1).padStart(2,"0") : "—") +
      '</span><span>' + escape(t(row.country_name)) + '</span><div class="peer-bar"><span style="width:' + (sum ? Math.max(3,row.distance / max * 100) : 0) +
      '%"></span></div><span class="distance">' + (sum ? number(row.distance,3) : "—") + "</span></div>").join("");
  }

  function render() {
    if (!data) return;
    ({history,forecasts,scenarios,peers}[activePanel])();
  }
  $("selected-only").addEventListener("change",render);
  $("show-all-countries").addEventListener("click",() => { selectedCountries.clear(); $("selected-only").checked=false; render(); });
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  tabs.forEach((button,index) => {
    button.tabIndex = index ? -1 : 0;
    button.addEventListener("click", () => {
      activePanel = button.dataset.panel;
      tabs.forEach(tab => {
        const selected = tab === button;
        tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1;
        $(tab.getAttribute("aria-controls")).hidden = !selected;
      });
      render();
    });
    button.addEventListener("keydown", event => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 :
        (index + (event.key === "ArrowRight" ? 1 : -1) * (window.noorThesisI18n?.language === "ar" ? -1 : 1) + tabs.length) % tabs.length;
      tabs[next].focus(); tabs[next].click();
    });
  });
  ["indicator","forecast-model"].forEach(id => $(id).addEventListener("change", render));
  ["oil-price","oil-share","oil-weight","income-weight","manufacturing-weight"].forEach(id => $(id).addEventListener("input", render));
  $("export-scenario").addEventListener("click", () => {
    if (!data) return;
    scenarios();
    const result = {baseline_vintage:"IMF WEO April 2026",source_snapshot_dates:data.metadata?.snapshot_dates,source_commit:data.metadata?.source_commit,
      assumptions:{price_change:Number($("oil-price").value)/100,price_sensitive_share:Number($("oil-share").value)/100,volume_change:0,non_oil_change:0,spending_change:0,GDP_and_FX_held_fixed:true},
      interpretation:"Conditional accounting sensitivity; no assigned probability and no debt dynamics.",results:latestScenario};
    const blob = new Blob([JSON.stringify(result,null,2)], {type:"application/json"}), url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "my-iraq-fiscal-scenario.json"; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });

  async function loadData() {
    loadController?.abort(); loadController = new AbortController();
    const controller = loadController, timeout = setTimeout(() => controller.abort(), 15000);
    data = null; latestScenario = []; errorMessage = null;
    controls.forEach(control => control.disabled = true);
    $("demo-shell").setAttribute("aria-busy","true");
    $("demo-status").hidden = false; $("demo-status").textContent = t("Loading the saved research preview…");
    $("demo-error").hidden = true; $("retry-preview").hidden = true;
    try {
      const response = await fetch("/thesis/data.json", {cache:"no-cache",signal:controller.signal});
      if (!response.ok) throw new Error("The saved preview could not load.");
      data = validate(await response.json());
      controls.forEach(control => control.disabled = false);
      $("demo-status").hidden = true;
      render();
    } catch (error) {
      if (controller !== loadController) return;
      $("demo-status").hidden = true;
      $("demo-error").hidden = false;
      errorMessage = error.name === "AbortError" ? "The saved preview took too long to load." :
        (error.message.startsWith("The saved") ? error.message : "The saved preview could not load.");
      $("demo-error").textContent = t(errorMessage) + " " + t("You can retry, or read the research plan below.");
      $("retry-preview").hidden = false;
    } finally {
      clearTimeout(timeout);
      if (controller === loadController) $("demo-shell").setAttribute("aria-busy","false");
    }
  }
  $("retry-preview").addEventListener("click", loadData);
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render,140); });
  window.addEventListener("noor-thesis-language", () => {
    if (!$("demo-status").hidden) $("demo-status").textContent=t("Loading the saved research preview…");
    if (errorMessage) $("demo-error").textContent=t(errorMessage)+" "+t("You can retry, or read the research plan below.");
    render(); document.fonts?.ready.then(render);
  });
  document.fonts?.ready.then(render);
  loadData();
})();
