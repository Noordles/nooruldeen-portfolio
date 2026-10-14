/* Browser preview of saved results. New model fits remain in the Python app. */
(() => {
  "use strict";
  let data = null, activePanel = "history", latestScenario = [], loadController, errorMessage = null, peerSelectedCountries = null;
  const selectedCountries = new Set();
  const countryPalette = ["#74263c", "#30c4a0", "#e9e0cf", "#d7aa58", "#659eb5", "#a7b097", "#c87945", "#737ec1", "#b4b4b4", "#557d60", "#ab905a", "#497e8a"];
  const colorForCountry = code => {
    if (!data) return countryPalette[0];
    const ordered = ["IRQ", ...Object.keys(data.annual.countries).filter(country => country !== "IRQ").sort()];
    return countryPalette[Math.max(0, ordered.indexOf(code)) % countryPalette.length];
  };
  const t = (source, values = {}) => window.noorThesisI18n?.t(source,values) ?? source.replace(/\{([a-z_]+)\}/g, (_,key) => String(values[key] ?? "{"+key+"}"));
  const locale = () => window.noorThesisI18n?.locale || "en-GB";
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const number = (value, digits = 2) => Number(value).toLocaleString(locale(), {maximumFractionDigits:digits, minimumFractionDigits:digits});
  const exactNumber = value => value.toLocaleString(locale(), {maximumFractionDigits:12});
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const periodLabel = period => new Date(period + "-01T12:00:00Z").toLocaleDateString(locale(), {month:"short", year:"numeric",timeZone:"UTC"});
  const controls = [...document.querySelectorAll(".demo-shell select, .demo-shell input, [data-v2-control], #export-scenario, #show-all-countries, #reset-scenario, #reset-weights")];
  const ranges = ["oil-price","oil-share","oil-volume","other-revenue","spending-change","oil-weight","income-weight","manufacturing-weight"].map($).filter(input=>input&&input.min!==undefined);
  function syncRanges() {
    ranges.forEach(input => {
      const fill = 100 * (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
      input.style.setProperty("--range-fill", fill + "%");
      input.setAttribute("aria-valuetext", Number(input.value).toLocaleString(locale()) + (input.id.endsWith("-weight") ? "" : "%"));
    });
  }

  function validate(payload) {
    if (!payload?.annual || !Array.isArray(payload.annual.years) || !payload.annual.years.length ||
        !Array.isArray(payload.annual.rows) || !payload.annual.countries || !payload.annual.indicators ||
        !Array.isArray(payload.monthly_forecasts) || !payload.monthly_forecasts.length ||
        !Array.isArray(payload.scenario_baseline) || !payload.scenario_baseline.length ||
        !Array.isArray(payload.peers) || !payload.peers.length) {
      throw new Error("The saved preview has an unexpected data format.");
    }
    const outlook=payload.international;
    if(!outlook || outlook.vintage!=="April 2026" || !Array.isArray(outlook.rows) || outlook.rows.length!==45 ||
      !["NGDP_RPCH","PCPIPCH","GGXWDG_NGDP","GGXCNL_NGDP","BCA_NGDPD"].every(code=>outlook.indicators?.[code]))
      throw new Error("The saved preview has an unexpected data format.");
    const outlookKeys=new Set();
    for(const row of outlook.rows){
      const def=outlook.indicators[row.indicator],key=row.indicator+":"+row.year;
      if(!def||!Number.isInteger(row.year)||row.year<2023||row.year>2031||!finite(row.value)||outlookKeys.has(key)||
        row.status!==(row.year>def.latest_actual_year_as_reported?"IMF_projection":"historical_or_estimate"))
        throw new Error("The saved preview has an unexpected data format.");
      outlookKeys.add(key);
    }
    if(!payload.research_v2||payload.research_v2.schema_version!=="website-v2.0"||!Array.isArray(payload.research_v2.events)||payload.research_v2.events.length!==6||payload.research_v2.outlook?.rows?.length!==30||payload.research_v2.annual_money_flow?.rows?.length!==4)throw Error("The saved preview has an unexpected data format.");
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
    if(options.context){for(const [eventIndex,event] of options.context.entries()){const first=Math.max(x[0],Number(event.period_start.slice(0,4))),last=Math.min(x.at(-1),Number(event.period_end.slice(0,4)));if(first>last)continue;const a=X(x.indexOf(first)),b=X(x.indexOf(last)),markYear=Math.max(first,Math.min(last,Math.round((first+last)/2))),markX=X(x.indexOf(markYear)),markY=top+12+(eventIndex%3)*20,label=String(eventIndex+1).padStart(2,"0"),period=event.period_start===event.period_end?event.period_start:event.period_start+"–"+event.period_end;svg+='<rect x="'+Math.max(left,a-5)+'" y="'+top+'" width="'+Math.max(10,b-a+10)+'" height="'+(height-top-bottom)+'" fill="#74263c" opacity=".08"><title>'+escape(period+" · "+t(event.title))+'</title></rect><g class="chart-event-marker"><title>'+escape(label+" · "+period+" · "+t(event.title)+" · "+t(event.source_publisher))+'</title><circle cx="'+markX+'" cy="'+markY+'" r="9"/><text x="'+markX+'" y="'+(markY+3)+'" text-anchor="middle">'+label+'</text></g>';}}
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
      const selectedSet = options.selectedCountries || selectedCountries;
      svg += '<path data-series-index="' + index + '" class="chart-series' + (item.reference ? ' chart-reference' : '') + (selectedSet.has(item.code) ? ' is-selected' : '') + '" d="' + path(item.y) + '" fill="none" stroke="' + item.color + '"' +
        (item.dash ? ' stroke-dasharray="7 5"' : "") + "/>";
      if (x.length <= 6) for (const point of points(item.y).filter(Boolean)) {
        svg += '<circle cx="' + point[0] + '" cy="' + point[1] + '" r="3.5" fill="' + item.color + '"/>';
      }
    });
    const highlightedIndex=x.indexOf(options.highlightPeriod),highlightedSeries=series.findIndex(item=>finite(item.y[highlightedIndex]));
    if(highlightedIndex>=0&&highlightedSeries>=0){const item=series[highlightedSeries];
      svg+='<g class="chart-selected-period"><title>'+escape(t("Selected projection year: {year}",{year:options.highlightPeriod}))+'</title><line x1="'+X(highlightedIndex)+'" x2="'+X(highlightedIndex)+'" y1="'+top+'" y2="'+(height-bottom)+'" stroke="#e9e0cf" stroke-opacity=".4" stroke-dasharray="3 4"/><circle cx="'+X(highlightedIndex)+'" cy="'+Y(item.y[highlightedIndex])+'" r="5" fill="'+item.color+'" stroke="#e9e0cf" stroke-width="2"/></g>';
    }
    svg += '<g class="chart-focus" hidden><line x1="0" y1="' + top + '" x2="0" y2="' + (height-bottom) + '"/><circle r="5"/></g></svg>';
    const legendSeries = options.legendSeries || series;
    const legend = '<div class="chart-legend">' + [...legendSeries].sort((a,b) => Number(!!b.reference)-Number(!!a.reference)).map(item => options.onCountrySelect
      ? '<button type="button" data-country="'+escape(item.code)+'" aria-pressed="'+String((options.selectedCountries || selectedCountries).has(item.code))+'" aria-label="'+escape(t("Select {country}",{country:item.name}))+'"><i style="--series-color:'+item.color+'"></i>'+escape(item.name)+'</button>'
      : '<span><i style="--series-color:' + item.color + '"></i>' + escape(item.name) + "</span>").join("") +
      (options.band ? '<span class="interval-key"><i></i>'+escape(t("95% prediction interval"))+'</span>' : "") + "</div>";
    const headings = series.map(item => "<th scope=\"col\">" + escape(item.name) + "</th>").join("") +
      (options.band ? '<th scope="col">'+escape(t("95% lower"))+'</th><th scope="col">'+escape(t("95% upper"))+'</th>' : "");
    const cell = value => "<td>" + (finite(value) ? escape(exactNumber(value)) : "—") + "</td>";
    const rows = x.map((value, index) => '<tr><th scope="row">' + escape(options.periods ? periodLabel(value) : value) + "</th>" +
      series.map(item => cell(item.y[index])).join("") + (options.band ? cell(options.band.low[index]) + cell(options.band.high[index]) : "") + "</tr>").join("");
    target.classList.toggle("chart-has-selection",!!options.onCountrySelect && (options.selectedCountries || selectedCountries).size>0);
    target.innerHTML = legend + svg + '<p class="sr-only" id="' + id + '-help">'+escape(t("Hover or tap a line for its saved value. With the chart focused, use left and right arrows for periods, up and down for series, and Escape to close the details."))+'</p><div class="chart-tooltip" role="tooltip" hidden></div><details class="chart-data"><summary>'+escape(t("View chart values"))+'</summary><div class="table-scroll"><table><caption>' +
      escape(title) + '</caption><thead><tr><th scope="col">'+escape(t("Period"))+'</th>' + headings + "</tr></thead><tbody>" + rows + "</tbody></table></div></details>";
    target.querySelectorAll("button[data-country]").forEach(button => button.addEventListener("click",() => options.onCountrySelect(button.dataset.country,false)));
    const dataTable = target.querySelector(".chart-data"), tableSlot = target.closest?.(".demo-panel")?.querySelector("[data-exact-tables]");
    if (dataTable && tableSlot) tableSlot.append(dataTable);
    const chart = target.querySelector("svg"), tooltip = target.querySelector(".chart-tooltip"), focus = chart.querySelector(".chart-focus");
    const focusLine = focus.querySelector("line"), focusPoint = focus.querySelector("circle");
    let selectedIndex = highlightedIndex>=0?highlightedIndex:x.length-1, selectedSeries = highlightedSeries>=0?highlightedSeries:0;
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
      if(event.key==="ArrowLeft" || event.key==="ArrowRight"){
        const step=event.key==="ArrowRight"?1:-1;
        let candidate=index+step;
        while(candidate>=0&&candidate<x.length&&!finite(series[seriesIndex].y[candidate]))candidate+=step;
        if(candidate<0||candidate>=x.length)return;
        index=candidate;
      }else{
        const step=event.key==="ArrowDown"?1:-1;
        for(let attempt=0;attempt<series.length;attempt++){
          seriesIndex=(seriesIndex+step+series.length)%series.length;
          const available=series[seriesIndex].y.map((value,i)=>finite(value)?i:null).filter(i=>i!==null);
          if(available.length){index=available.reduce((a,b)=>Math.abs(b-index)<Math.abs(a-index)?b:a);break;}
        }
      }
      showDetails(index,seriesIndex);
    });
    if(options.initialPointer) inspect({...options.initialPointer,type:"pointermove"});
  }

  function history(initialPointer) {
    if (!data) return;
    const key = $("indicator").value, definition = data.annual.indicators[key];
    if (!definition) return;
    const first=Number($("history-start").value),last=Number($("history-end").value);
    const years = data.annual.years.filter(year=>(data.annual.years.includes(first)?year>=first:true)&&(data.annual.years.includes(last)?year<=last:true));
    const countries = Object.keys(data.annual.countries).filter(country => country!=="IRQ").sort((a,b) => data.annual.countries[a].localeCompare(data.annual.countries[b]));
    countries.push("IRQ");
    const series = countries.map(country => ({code:country,name:t(data.annual.countries[country]),color:colorForCountry(country),reference:country==="IRQ",
      y:years.map(year => data.annual.rows.find(row => row.country===country && row.year===year)?.[key] ?? null)}));
    const selectedOnly = $("selected-only").checked && selectedCountries.size>0;
    const visible = selectedOnly ? series.filter(item => selectedCountries.has(item.code)) : series;
    drawChart("history-chart", years, visible, {title:t("{label} in {units}",{label:t(definition.label),units:t(definition.units)}),units:t(definition.units),
      axisLabel:key==="gdp_per_capita" ? t("USD per person · 2015 prices") : t(definition.units),percent:key!=="gdp_per_capita",nonNegative:key!=="growth",
      legendSeries:series,initialPointer,context:window.noorResearchV2?.events(data,years[0],years.at(-1),selectedCountries.size?[...selectedCountries]:["IRQ"]),onCountrySelect:(country,exclusive,pointer) => {
        if(exclusive) { selectedCountries.clear(); selectedCountries.add(country); }
        else if(selectedCountries.has(country)) selectedCountries.delete(country);
        else selectedCountries.add(country);
        history(pointer && {clientX:pointer.clientX,clientY:pointer.clientY});
        window.noorResearchOverview?.render(data,{selectedCountries,drawChart});
        if(!exclusive) $("history-chart").querySelector('button[data-country="'+country+'"]').focus({preventScroll:true});
      }});
    $("country-selection-status").textContent = selectedCountries.size ? t(selectedOnly ? "Showing only: {countries}." : "Focused: {countries}. All countries remain visible.",
      {countries:series.filter(item => selectedCountries.has(item.code)).map(item => item.name).join(" · ")}) : t($("selected-only").checked ? "Choose countries from the legend to filter the chart." : "All {count} countries are visible.",{count:series.length});
    const rows = data.annual.rows.filter(row => row.country === "IRQ" && finite(row[key]) && years.includes(row.year)).sort((a,b) => a.year - b.year);
    $("history-note").textContent = t("{label} · {units}. Iraq has {count} available annual values{window}. {note}",
      {label:t(definition.label),units:t(definition.units),count:rows.length,window:rows.length ? ", "+rows[0].year+"–"+rows.at(-1).year : "",note:t(definition.note)});
  }

  function forecasts() {
    if (!data) return;
    if(window.noorResearchV2){window.noorResearchV2.forecasts(data,drawChart);return;}
    const model = $("forecast-model").value, rows = data.monthly_forecasts.filter(row => row.model === model);
    drawChart("forecast-chart", rows.map(row => row.period), [{name:model,color:"#74263c",y:rows.map(row => row.prediction_trillion_iqd),dash:true}],
      {title:t("Saved monthly revenue forecast in nominal trillion IQD"),units:t("nominal trillion IQD"),axisLabel:t("Revenue · trillion IQD"),periods:true,band:{low:rows.map(row => row.pi95_low),high:rows.map(row => row.pi95_high)}});
  }

  function scenarios() {
    if (!data) return;
    const price = Number($("oil-price").value) / 100, share = Number($("oil-share").value) / 100;
    $("price-label").value = number(price * 100, 0) + "%"; $("share-label").value = number(share * 100, 0) + "%";
    latestScenario = window.NoorV2Rules?window.NoorV2Rules.scenarioRows(data.scenario_baseline,price,share,Number($("oil-volume").value)/100,Number($("other-revenue").value)/100,Number($("spending-change").value)/100):data.scenario_baseline.map(row => {
      const revenue = row.revenue_billion_iqd * (share * (1 + price) + (1 - share));
      const baseline = 100 * (row.revenue_billion_iqd - row.expenditure_billion_iqd) / row.gdp_billion_iqd;
      const scenario = 100 * (revenue - row.expenditure_billion_iqd) / row.gdp_billion_iqd;
      return {year:row.year,baseline_balance_pct_gdp:baseline,scenario_balance_pct_gdp:scenario,change_percentage_points:scenario-baseline,
        scenario_revenue_billion_iqd:revenue,fixed_expenditure_billion_iqd:row.expenditure_billion_iqd,fixed_gdp_billion_iqd:row.gdp_billion_iqd};
    });
    ["oil-volume","other-revenue","spending-change"].forEach((id,i)=>{if($(id))$( ["volume-label","other-label","spending-label"][i]).value=number(Number($(id).value),0)+"%";});
    const first = latestScenario.find(r=>r.year===Number($("scenario-year").value))||latestScenario[0];
    $("scenario-stats").innerHTML = '<div><small>' + escape(t("{year} baseline balance",{year:first.year})) + '</small><strong>' + number(first.baseline_balance_pct_gdp) +
      '%</strong><small>'+escape(t("of baseline GDP"))+'</small></div><div><small>' + escape(t("{year} scenario balance",{year:first.year})) + '</small><strong>' + number(first.scenario_balance_pct_gdp) +
      '%</strong><small>'+escape(t("of fixed baseline GDP"))+'</small></div><div><small>'+escape(t("Change in balance"))+'</small><strong>' + number(first.change_percentage_points) +
      '</strong><small>'+escape(t("percentage points"))+'</small></div>';
    drawChart("scenario-chart", latestScenario.map(row => row.year),
      [{name:t("IMF baseline"),color:"#aaa99c",y:latestScenario.map(row => row.baseline_balance_pct_gdp)},
       {name:t("My scenario"),color:"#30c4a0",y:latestScenario.map(row => row.scenario_balance_pct_gdp)}],
      {title:t("Conditional annual fiscal balance as percent of fixed GDP"),units:t("% of fixed baseline GDP"),axisLabel:t("Budget balance · % of GDP"),percent:true});
  }

  function peerCodes() { return Object.keys(data.annual.countries).sort((a,b)=>data.annual.countries[a].localeCompare(data.annual.countries[b])); }
  function drawPeerScatter() {
    const target=$("peer-scatter-chart"),profiles=peerCodes().map(code=>{const rows=data.annual.rows.filter(r=>r.country===code&&r.year>=2003&&r.year<=2021&&finite(r.oil_rents)&&finite(r.growth));if(rows.length<3)return null;const mean=rows.reduce((s,r)=>s+r.oil_rents,0)/rows.length,avg=rows.reduce((s,r)=>s+r.growth,0)/rows.length,sd=Math.sqrt(rows.reduce((s,r)=>s+(r.growth-avg)**2,0)/(rows.length-1));return{code,name:t(data.annual.countries[code]),mean,sd,count:rows.length};}).filter(Boolean);
    if(!profiles.length){target.innerHTML='<p class="chart-note">'+escape(t('No countries have enough paired observations for this plot.'))+'</p>';return;}
    const w=Math.max(240,Math.round(target.clientWidth)),h=w<600?300:360,l=w<600?56:74,r=20,top=28,b=58,minX=Math.min(...profiles.map(p=>p.mean)),maxX=Math.max(...profiles.map(p=>p.mean)),minY=Math.min(...profiles.map(p=>p.sd)),maxY=Math.max(...profiles.map(p=>p.sd)),px=(maxX-minX||1)*.08,py=(maxY-minY||1)*.12,x0=Math.max(0,minX-px),x1=maxX+px,y0=Math.max(0,minY-py),y1=maxY+py,X=v=>l+(w-l-r)*(v-x0)/(x1-x0),Y=v=>top+(h-top-b)*(y1-v)/(y1-y0),fmt=v=>number(v,1);
    let svg='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-labelledby="peer-scatter-title peer-scatter-desc"><title id="peer-scatter-title">'+escape(t('Oil-rent exposure and growth volatility'))+'</title><desc id="peer-scatter-desc">'+escape(t('Each point is one country. The horizontal axis is mean oil rents as percent of GDP; the vertical axis is the sample standard deviation of annual real GDP growth, in percentage points.'))+'</desc><text x="'+l+'" y="15" class="chart-axis-title">'+escape(t('Mean oil rents · % of GDP'))+'</text>';
    for(let i=0;i<=4;i++){const xv=x0+(x1-x0)*i/4,yv=y0+(y1-y0)*i/4,xx=X(xv),yy=Y(yv);svg+='<line x1="'+l+'" y1="'+yy+'" x2="'+(w-r)+'" y2="'+yy+'" class="chart-gridline"/><text x="'+(l-8)+'" y="'+(yy+4)+'" text-anchor="end" class="chart-axis-label">'+fmt(yv)+'</text><text x="'+xx+'" y="'+(h-13)+'" text-anchor="middle" class="chart-axis-label">'+fmt(xv)+'</text>';}
    svg+='<text x="'+((l+w-r)/2)+'" y="'+(h-2)+'" text-anchor="middle" class="chart-axis-title">'+escape(t('Mean oil rents · % of GDP'))+'</text>';
    profiles.forEach(p=>{const selected=peerSelectedCountries.has(p.code),xx=X(p.mean),yy=Y(p.sd),label=t('{country}: mean oil rents {oil} percent of GDP; growth volatility {sd} percentage points; {count} years',{country:p.name,oil:fmt(p.mean),sd:fmt(p.sd),count:p.count});svg+='<g class="peer-scatter-point'+(selected?' is-selected':'')+'" data-country="'+escape(p.code)+'" role="button" tabindex="0" aria-pressed="'+selected+'" aria-label="'+escape(label)+'" style="--peer-color:'+colorForCountry(p.code)+'"><title>'+escape(p.name+' · '+fmt(p.mean)+'% · '+fmt(p.sd)+' pp · n='+p.count)+'</title><circle cx="'+xx+'" cy="'+yy+'" r="7"/><text x="'+xx+'" y="'+(yy-10)+'" text-anchor="middle">'+escape(p.name)+'</text></g>';});
    svg+='</svg><details class="chart-data"><summary>'+escape(t('View chart values'))+'</summary><div class="table-scroll"><table><caption>'+escape(t('Oil-rent exposure and growth volatility'))+'</caption><thead><tr><th>'+escape(t('Country'))+'</th><th>'+escape(t('Mean oil rents · % of GDP'))+'</th><th>'+escape(t('Growth volatility · percentage points'))+'</th><th>'+escape(t('Paired years'))+'</th></tr></thead><tbody>'+profiles.map(p=>'<tr><th>'+escape(p.name)+'</th><td>'+exactNumber(p.mean)+'</td><td>'+exactNumber(p.sd)+'</td><td>'+p.count+'</td></tr>').join('')+'</tbody></table></div></details>';
    target.innerHTML=svg;target.querySelectorAll('.peer-scatter-point').forEach(point=>{const toggle=()=>{const code=point.dataset.country;peerSelectedCountries.has(code)?peerSelectedCountries.delete(code):peerSelectedCountries.add(code);render();};point.addEventListener('click',toggle);point.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});});const table=target.querySelector('.chart-data'),slot=target.closest?.('.demo-panel')?.querySelector('[data-exact-tables]');if(table&&slot)slot.append(table);
  }
  function renderPeerPaths() {
    if(!data)return;const codes=peerCodes(),years=data.annual.years;let indicator=$("peer-indicator").value;if(!data.annual.indicators[indicator])indicator="growth";const firstValue=Number($("peer-start").value),lastValue=Number($("peer-end").value),first=years.includes(firstValue)?firstValue:years[0],last=years.includes(lastValue)?lastValue:years.at(-1),shownYears=years.filter(y=>y>=first&&y<=last);
    $("peer-country-list").innerHTML=codes.map(code=>'<label class="peer-country-chip" style="--peer-color:'+colorForCountry(code)+'"><input type="checkbox" value="'+escape(code)+'" '+(peerSelectedCountries.has(code)?'checked':'')+'><i aria-hidden="true"></i><span>'+escape(t(data.annual.countries[code]))+'</span></label>').join('');
    $("peer-country-list").querySelectorAll('input[type="checkbox"]').forEach(input=>input.addEventListener('change',()=>{input.checked?peerSelectedCountries.add(input.value):peerSelectedCountries.delete(input.value);render();}));
    const all=codes.map(code=>({code,name:t(data.annual.countries[code]),color:colorForCountry(code),y:shownYears.map(y=>data.annual.rows.find(row=>row.country===code&&row.year===y)?.[indicator]??null)})),series=all.filter(item=>peerSelectedCountries.has(item.code)),def=data.annual.indicators[indicator],units=indicator==='gdp_per_capita'?t('USD per person · 2015 prices'):t(def.units);
    drawChart('peer-history-chart',shownYears,series,{title:t('{label} by country',{label:t(def.label)}),units,axisLabel:units,percent:indicator!=='gdp_per_capita',nonNegative:indicator!=='growth',legendSeries:all,selectedCountries:peerSelectedCountries,onCountrySelect:(code,exclusive)=>{if(exclusive){peerSelectedCountries.clear();peerSelectedCountries.add(code);}else peerSelectedCountries.has(code)?peerSelectedCountries.delete(code):peerSelectedCountries.add(code);render();}});drawPeerScatter();
  }
  function peers() {
    if (!data) return;
    if(peerSelectedCountries===null)peerSelectedCountries=new Set(peerCodes());
    if(!$('peer-start').options?.length){$('peer-start').innerHTML=data.annual.years.map(y=>'<option>'+y+'</option>').join('');$('peer-end').innerHTML=data.annual.years.map(y=>'<option>'+y+'</option>').join('');$('peer-start').value=String(data.annual.years[0]);$('peer-end').value=String(data.annual.years.at(-1));}
    const ids = ["oil","income","manufacturing"], weights = ids.map(id => Number($(id + "-weight").value));
    ids.forEach((id,index) => $(id + "-weight-label").value = weights[index].toLocaleString(locale()));
    const sum = weights.reduce((a,b) => a+b,0);
    $("peer-warning").textContent = t(sum ? "I put the three features on a common scale so that their different units do not decide the ranking." :
      "Choose at least one positive weight to calculate a ranking. All loaded countries are still listed below.");
    const ranked = data.peers.map(row => ({...row,distance:sum ? Math.sqrt(ids.reduce((total,id,index) => total + row.delta_squared[id] * weights[index] / sum, 0)) : null}))
      .sort((a,b) => sum ? a.distance - b.distance || a.country.localeCompare(b.country) : t(a.country_name).localeCompare(t(b.country_name),locale()));
    const max = Math.max(...ranked.map(row => row.distance ?? 0), .001);
    $("peer-results").innerHTML = '<div class="peer-row peer-reference"><span class="rank">'+escape(t('REF'))+'</span><span>'+escape(t('Iraq'))+' <small>'+escape(t('reference country'))+'</small></span><div class="peer-bar"><span style="width:0%"></span></div><span class="distance">'+number(0,3)+'</span></div>' +
      ranked.map((row,index) => '<div class="peer-row" style="--peer-color:'+colorForCountry(row.country)+'"><span class="rank">' + (sum ? String(index + 1).padStart(2,"0") : "—") +
      '</span><span>' + escape(t(row.country_name)) + '</span><div class="peer-bar"><span style="width:' + (sum ? Math.max(3,row.distance / max * 100) : 0) +
      '%"></span></div><span class="distance">' + (sum ? number(row.distance,3) : "—") + "</span></div>").join("");
    renderPeerPaths();
  }

  function render() {
    if (!data) return;
    syncRanges();
    ({history,forecasts,scenarios,peers}[activePanel])();
    window.noorResearchOverview?.render(data,{selectedCountries,drawChart});
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
  ["indicator","forecast-model","forecast-stage","scenario-year","international-release"].forEach(id => $(id).addEventListener("change", render));
  ["history-start","history-end"].forEach(id=>$(id).addEventListener("change",()=>{
    if(Number($("history-start").value)>Number($("history-end").value)) $(id==="history-start"?"history-end":"history-start").value=$(id).value;
    render();
  }));
  ["oil-price","oil-share","oil-volume","other-revenue","spending-change","oil-weight","income-weight","manufacturing-weight"].forEach(id => $(id)?.addEventListener("input", render));
  $("reset-weights").addEventListener("click", () => {
    ["oil-weight","income-weight","manufacturing-weight"].forEach(id => $(id).value = "1"); render();
  });
  $("peer-select-all")?.addEventListener("click",()=>{if(data)peerSelectedCountries=new Set(peerCodes());render();});
  $("peer-clear-all")?.addEventListener("click",()=>{if(data)peerSelectedCountries.clear();render();});
  ["peer-indicator","peer-start","peer-end"].forEach(id=>$(id)?.addEventListener("change",()=>{if(Number($("peer-start").value)>Number($("peer-end").value))$(id==="peer-start"?"peer-end":"peer-start").value=$(id).value;render();}));
  $("reset-scenario").addEventListener("click", () => {
    $("oil-price").value = "-10"; $("oil-share").value = "90";["oil-volume","other-revenue","spending-change"].forEach(id=>{if($(id))$(id).value="0";});render();
  });
  $("forecast-horizon")?.addEventListener("change",()=>{if(data&&window.noorResearchV2){$("forecast-model").value=data.research_v2.forecasts.selection.find(r=>r.horizon===Number($("forecast-horizon").value)).selected_model;}render();});
  $("export-scenario").addEventListener("click", () => {
    if (!data) return;
    scenarios();
    const result = {baseline_vintage:"IMF WEO April 2026",source_snapshot_dates:data.metadata?.snapshot_dates,source_commit:data.metadata?.source_commit,
      assumptions:{price_change:Number($("oil-price").value)/100,price_sensitive_share:Number($("oil-share").value)/100,volume_change:Number($("oil-volume").value)/100,non_oil_change:Number($("other-revenue").value)/100,spending_change:Number($("spending-change").value)/100,GDP_and_FX_held_fixed:true},
      interpretation:"Conditional accounting sensitivity; no assigned probability and no debt dynamics.",results:latestScenario};
    const blob = new Blob([JSON.stringify(result,null,2)], {type:"application/json"}), url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "my-iraq-fiscal-scenario.json"; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });

  async function loadData() {
    loadController?.abort(); loadController = new AbortController();
    const controller = loadController, timeout = setTimeout(() => controller.abort(), 15000);
    data = null; latestScenario = []; errorMessage = null;
    window.noorResearchOverview?.clear();
    controls.forEach(control => control.disabled = true);
    $("demo-shell").setAttribute("aria-busy","true");
    $("demo-status").hidden = false; $("demo-status").textContent = t("Loading the saved research preview…");
    $("demo-error").hidden = true; $("retry-preview").hidden = true;
    try {
      const response = await fetch("/thesis/data.json", {cache:"no-cache",signal:controller.signal});
      if (!response.ok) throw new Error("The saved preview could not load.");
      data = validate(await response.json());
      window.noorThesisData = data;
      ["history-start","history-end"].forEach(id=>$(id).innerHTML=data.annual.years.map(year=>'<option value="'+year+'">'+year+'</option>').join(""));
      $("history-start").value=String(data.annual.years[0]);$("history-end").value=String(data.annual.years.at(-1));
      if(window.noorResearchV2)$("forecast-model").value=data.research_v2.forecasts.selection.find(r=>r.horizon===Number($("forecast-horizon").value)).selected_model;
      controls.forEach(control => control.disabled = false);
      $("demo-status").hidden = true;
      render();
    } catch (error) {
      if (controller !== loadController) return;
      data=null;latestScenario=[];controls.forEach(control=>control.disabled=true);
      $("demo-status").hidden = true;
      $("demo-error").hidden = false;
      errorMessage = error.name === "AbortError" ? "The saved preview took too long to load." :
        (error.message.startsWith("The saved") ? error.message : "The saved preview could not load.");
      window.noorResearchOverview?.clear(errorMessage);
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
