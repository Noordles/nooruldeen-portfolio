/* Country portrait, source outlook and localized calculation notes. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id),finite=v=>typeof v==="number"&&Number.isFinite(v);
  const t=(key,values={})=>window.noorThesisI18n?.t(key,values)??key.replace(/\{([a-z_]+)\}/g,(_,k)=>values[k]??"{"+k+"}");
  const locale=()=>window.noorThesisI18n?.locale??"en-GB";
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const n=(v,d=2)=>finite(v)?v.toLocaleString(locale(),{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
  const ids=["growth","gdp_per_capita","manufacturing","oil_rents"];
  let current=null,currentOptions=null;
  const numeric=new Set(["first","last","change","value","mae","rmse","prediction","low","high","distance","contribution","baseline","scenario","price","share","factor"]);
  function localValues(values) {
    return Object.fromEntries(Object.entries(values).map(([key,value])=>{
      if(numeric.has(key)&&typeof value==="string"&&/^-?[\d,]+\.\d+$/.test(value))return [key,n(Number(value.replaceAll(",","")))];
      if(["origin","target"].includes(key)&&/^\d{4}-\d{2}$/.test(value))return [key,new Date(value+"-01T12:00:00Z").toLocaleDateString(locale(),{month:"short",year:"numeric",timeZone:"UTC"})];
      return [key,typeof value==="string"?(["model","chosen","best_mae","best_rmse"].includes(key)?"\u2068"+value+"\u2069":t(value)):value];
    }));
  }
  function text(note,part) {return t(note[part+"_key"],localValues({...note.values,...note.title_values}));}
  function questions(note){const q=window.NoorV2Rules.decorate(note);return {what_changed:text(q,'body'),meaning:t(q.question_keys.meaning),look_into:t(q.question_keys.look_into),certainty:q.question_keys.certainty.map(s=>t(s)).join(' ')};}
  function finding(value){return esc(value).replace(/[-+]?\d[\d.,]*(?:\s?%|\s+percentage points)?/g,match=>'<strong>'+match+'</strong>');}
  function evidenceNote(note) {
    const q=questions(note);
    return '<article class="insight-note"><span class="insight-kind">'+esc(t({observation:"Reported data",comparison:"Comparison",scenario:"Scenario calculation",uncertainty:"Saved model result",data_quality:"Data availability"}[note.kind]))+'</span><h4>'+esc(text(note,"title"))+'</h4><p class="main-finding-label">'+esc(t('Main finding'))+'</p><p class="main-finding">'+finding(q.what_changed)+'</p><dl class="four-questions"><dt>'+esc(t('What changed?'))+'</dt><dd>'+esc(q.what_changed)+'</dd><dt>'+esc(t('What does it mean?'))+'</dt><dd>'+esc(q.meaning)+'</dd><dt>'+esc(t('What should I look into?'))+'</dt><dd>'+esc(q.look_into)+'</dd><dt>'+esc(t('How certain is this?'))+'</dt><dd>'+esc(q.certainty)+'</dd></dl><details><summary>'+esc(t('Calculation details and exact evidence'))+'</summary><p>'+esc(t('The record below contains the selected values, units, dates and comparison inputs used for this explanation.'))+'</p><p class="evidence-label">'+esc(t("Calculation record (JSON)"))+'</p><pre dir="ltr">'+esc(JSON.stringify(note.evidence,null,2))+'</pre></details></article>';
  }
  function notes(id,list) {
    const target=$(id);if(!target)return;
    target.hidden=!list.length;
    target.dataset.insightsExpanded??='true';
    const first=list.slice(0,2),more=list.slice(2);
    target.innerHTML='<h3 class="insight-heading"><button type="button" class="insight-toggle" aria-expanded="'+target.dataset.insightsExpanded+'" aria-controls="'+esc(id)+'-content"><span>'+esc(t("What this selection shows"))+'</span><span class="insight-toggle-mark" aria-hidden="true">'+(target.dataset.insightsExpanded==='true'?'−':'+')+'</span></button></h3><div class="insight-content" id="'+esc(id)+'-content"'+(target.dataset.insightsExpanded==='true'?'':' hidden')+'><div class="insight-grid">'+first.map(evidenceNote).join("")+'</div>'+(more.length?'<details class="more-insights"><summary>'+esc(t("More notes ({count})",{count:more.length}))+'</summary><div class="insight-grid">'+more.map(evidenceNote).join("")+'</div></details>':'')+'<button type="button" class="insight-export">'+esc(t("Download these notes"))+' ↓</button></div>';
    target.querySelector('.insight-toggle').addEventListener('click',event=>{const button=event.currentTarget,expanded=button.getAttribute('aria-expanded')!=='true';target.dataset.insightsExpanded=String(expanded);button.setAttribute('aria-expanded',String(expanded));target.querySelector('.insight-content').hidden=!expanded;button.querySelector('.insight-toggle-mark').textContent=expanded?'−':'+';});
    target.querySelector('.insight-export').addEventListener('click',()=>{
      const record={rule_version:"2.0",selected_source_sha256:current.research_v2.selected_source_sha256,core_commit:current.research_v2.core_commit,source_commit:current.metadata.source_commit,source_snapshot_dates:current.metadata.snapshot_dates,international_vintage:current.international.vintage,language:window.noorThesisI18n.language,insights:list.map(note=>({...note,title:text(note,"title"),body:text(note,"body"),limits:note.limits.map(limit=>t(limit)),questions:questions(note)}))};
      const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:"application/json"})),link=document.createElement('a');link.href=url;link.download='iraq-'+id+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  function smallHistory(rows,key,label,units) {
    const values=rows.filter(r=>finite(r[key]));if(!values.length)return "";
    let min=Math.min(...values.map(r=>r[key])),max=Math.max(...values.map(r=>r[key]));if(min===max){min--;max++;}
    const start=rows[0].year,end=rows.at(-1).year;let connected=false;
    const path=rows.map(r=>{if(!finite(r[key])){connected=false;return "";}const x=8+304*(r.year-start)/Math.max(1,end-start),y=76-64*(r[key]-min)/(max-min),command=connected?'L':'M';connected=true;return command+x.toFixed(2)+','+y.toFixed(2);}).join(' ');
    const title=t("{label}, {start}–{end}, {units}",{label:t(label),start,end,units:t(units)});
    return '<svg viewBox="0 0 320 88" role="img" aria-label="'+esc(title)+'"><path d="M8 12H312M8 44H312M8 76H312" class="spark-grid"/><path d="'+path+'" class="spark-line"/></svg><div class="spark-years" dir="ltr"><span>'+start+'</span><span>'+end+'</span></div>';
  }
  function portrait(data) {
    const rows=data.annual.rows.filter(r=>r.country==="IRQ").sort((a,b)=>a.year-b.year);
    $("portrait-cards").innerHTML=ids.map(key=>{
      const def=data.annual.indicators[key],valid=rows.filter(r=>finite(r[key])),last=valid.at(-1);if(!last)return '';
      const units=key==="gdp_per_capita"?'USD per person · 2015 prices':def.units;
      return '<article class="indicator-card"><div class="indicator-card-top"><h3>'+esc(t(def.label))+'</h3><span>'+last.year+'</span></div><strong class="indicator-number" dir="ltr">'+n(last[key])+(key!=="gdp_per_capita"?'%':'')+'</strong><p class="indicator-unit">'+esc(t(units))+'</p>'+smallHistory(rows.filter(r=>r.year<=last.year),key,def.label,def.units)+'<div class="indicator-card-bottom"><span>'+esc(t("Reported / estimated"))+' · WDI</span><a href="#prototype" data-open-panel="history" data-indicator="'+key+'">'+esc(t("Inspect history"))+' ↗</a></div></article>';
    }).join('');
  }
  function route(panel,label) {return '<a href="#prototype" data-open-panel="'+panel+'">'+esc(t(label))+' ↗</a>';}
  function card(kind,title,value,units,body,link) {return '<article class="result-card"><span class="insight-kind">'+esc(t(kind))+'</span><h3>'+esc(t(title))+'</h3><strong dir="ltr" class="'+(/[\u0600-\u06ff]/.test(value)?'result-text-value':'')+'">'+esc(value)+'</strong><p class="result-unit">'+esc(units)+'</p><p>'+esc(body)+'</p>'+link+'</article>';}
  function render(data,options) {
    current=data;currentOptions=options;
    $("overview-status").hidden=true;
    ["international-indicator","international-year"].forEach(id=>$(id).disabled=false);
    portrait(data);
    const countries=options.selectedCountries.size?[...options.selectedCountries]:["IRQ"],first=Number($("history-start").value),last=Number($("history-end").value);
    const start=data.annual.years.includes(first)?first:data.annual.years[0],end=data.annual.years.includes(last)?last:data.annual.years.at(-1);
    notes('history-insights',window.NoorInsights.annual(data.annual,$('indicator').value,start,end,countries));
    const model=$('forecast-model').value,forecastNotes=window.noorResearchV2?window.NoorV2Rules.forecast(data.research_v2.forecasts,model,Number($('forecast-horizon').value),$('forecast-stage').value):window.NoorInsights.forecast(data.metrics,data.monthly_forecasts,model,data.metadata.forecast_origin);
    notes('forecast-insights',forecastNotes);
    const price=Number($('oil-price').value)/100,share=Number($('oil-share').value)/100,volume=Number($('oil-volume').value)/100,other=Number($('other-revenue').value)/100,spending=Number($('spending-change').value)/100,baseline=data.scenario_baseline.filter(r=>r.year===Number($('scenario-year').value)),scenarioNotes=window.NoorV2Rules.scenario(baseline,price,share,volume,other,spending);
    notes('scenario-insights',scenarioNotes);
    const weights=['oil','income','manufacturing'].map(id=>Number($(id+'-weight').value)),peerNotes=window.NoorInsights.peers(data.peers,weights);
    notes('peer-insights',peerNotes);
    const f=window.noorResearchV2.forecastSelection(data),metric=f.metric,prediction=f.point,s=scenarioNotes[0]?.evidence,p=peerNotes[0]?.evidence;
    $("result-cards").innerHTML=
      card('Saved model result','Monthly revenue forecast',n(prediction.prediction_trillion_iqd),t('trillion IQD')+' · '+new Date(prediction.period+'-01T12:00:00Z').toLocaleDateString(locale(),{month:'short',year:'numeric',timeZone:'UTC'}),t("Saved {model} · MAE {mae} over {months} test months. History ends in {origin}.",{model,mae:n(metric.MAE_trillion_iqd),months:metric.successful_forecasts,origin:data.research_v2.forecasts.origin}),route('forecasts','Inspect the saved models'))+
      card('Scenario calculation','Budget balance under my assumptions',n(s.scenario_balance_pct_gdp)+'%',t('% of fixed baseline GDP')+' · '+s.year,t("Price {price}%; quantity {volume}%; other revenue {other}%; spending {spending}%. Baseline balance {baseline}%.",{price:n(price*100,0),volume:n(volume*100,0),other:n(other*100,0),spending:n(spending*100,0),baseline:n(s.baseline_balance_pct_gdp)}),route('scenarios','Change the assumptions'))+
      card('Comparison','Nearest baseline match',p.country_name?t(p.country_name):'—',p.country_name?t("Distance {distance} · unitless",{distance:n(p.distance,3)}):t('Choose at least one positive weight'),t('The comparison uses the fixed 2003–2007 baseline and the weights currently selected.'),route('peers','Inspect the comparison'))+
      card('Saved model result','Annual GDP growth model',n(data.research_v2.growth.summary.next_year.growth_percent)+'%',t('Saved 2026 estimate · conditional'),t('Revised 2025 inputs, saved October 2026; new 2026 developments are not included. Conditional 95% interval {low}% to {high}%. The model did not beat the mean benchmark.',{low:n(data.research_v2.growth.summary.next_year.pi95_low),high:n(data.research_v2.growth.summary.next_year.pi95_high)}),'<a href="#growth-model">'+esc(t('Inspect the growth model'))+' ↗</a>');
    window.noorResearchV2.international(data,options.drawChart);
    document.querySelectorAll('[data-v2-control]').forEach(e=>e.disabled=false);
    window.noorResearchV2.render(data,options);
    document.querySelectorAll('[data-open-panel]').forEach(link=>link.addEventListener('click',()=>{
      if(link.dataset.indicator){options.selectedCountries.clear();options.selectedCountries.add('IRQ');$('selected-only').checked=false;$('indicator').value=link.dataset.indicator;$('history-start').value=String(data.annual.years[0]);$('history-end').value=String(data.annual.years.at(-1));}
      $('tab-'+link.dataset.openPanel).click();
    },{once:true}));
  }
  function clear(error) {
    current=null;currentOptions=null;window.noorResearchV2?.clear();
    ['portrait-cards','result-cards','international-value','international-chart','history-insights','forecast-insights','scenario-insights','peer-insights'].forEach(id=>{if($(id)){$(id).innerHTML='';if(id.endsWith('-insights'))$(id).hidden=true;}});
    ['international-indicator','international-year'].forEach(id=>{if($(id))$(id).disabled=true;});
    if($('overview-status')){$('overview-status').hidden=false;$('overview-status').textContent=t(error??'Loading the saved research preview…');}
  }
  ['international-indicator','international-year','international-release'].forEach(id=>$(id)?.addEventListener('change',()=>{if(current)render(current,currentOptions);}));
  window.noorResearchOverview={render,clear,notes};
  clear();
})();
