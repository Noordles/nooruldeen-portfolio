/* Browser preview of my saved results. The Python experiment lives in program/. */
(() => {
  'use strict';
  let data, activePanel='history', latestScenario=[];
  const $=id=>document.getElementById(id);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=(n,digits=2)=>Number(n).toLocaleString('en-GB',{maximumFractionDigits:digits,minimumFractionDigits:digits});
  const finite=n=>n!==null&&n!==undefined&&Number.isFinite(Number(n));
  const periodLabel=period=>new Date(period+'-01T12:00:00Z').toLocaleDateString('en-GB',{month:'short',year:'2-digit'});

  function drawChart(id,x,series,options={}) {
    const target=$(id), width=Math.max(290,Math.round(target.clientWidth)), mobile=width<600;
    const height=mobile?270:350, left=mobile?58:76, right=18, top=46, bottom=49;
    const values=series.flatMap(s=>s.y.filter(finite).map(Number));
    if(options.band)values.push(...options.band.low.filter(finite).map(Number),...options.band.high.filter(finite).map(Number));
    if(!values.length){target.innerHTML='<p class="chart-note">No observations are available in this saved window.</p>';return;}
    let low=Math.min(...values),high=Math.max(...values);if(low===high){low-=1;high+=1;}
    const pad=(high-low)*.12;low-=pad;high+=pad;
    const X=i=>left+(width-left-right)*i/Math.max(1,x.length-1),Y=v=>top+(height-top-bottom)*(high-v)/(high-low);
    const points=values=>values.map((v,i)=>finite(v)?[X(i),Y(Number(v))]:null);
    const path=values=>{let wasValid=false;return points(values).map(p=>{if(!p){wasValid=false;return '';}const cmd=wasValid?'L':'M';wasValid=true;return cmd+p.map(n=>n.toFixed(2)).join(',');}).join(' ');};
    let svg=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(options.title||'My saved data chart')}">`;
    for(let i=0;i<=4;i++){const value=low+(high-low)*i/4,y=Y(value);svg+=`<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#526258" stroke-opacity=".45"/><text x="${left-9}" y="${y+4}" fill="#aaa99c" font-size="${mobile?11:12}" text-anchor="end">${escape(number(value,Math.max(Math.abs(low),Math.abs(high))>1000?0:1))}</text>`;}
    const tickCount=Math.min(x.length,mobile?3:6),indices=[...new Set(Array.from({length:tickCount},(_,i)=>Math.round(i*(x.length-1)/Math.max(1,tickCount-1))))];
    for(const i of indices){svg+=`<text x="${X(i)}" y="${height-17}" fill="#aaa99c" font-size="${mobile?11:12}" text-anchor="middle">${escape(options.periods?periodLabel(x[i]):x[i])}</text>`;}
    if(low<0&&high>0)svg+=`<line x1="${left}" y1="${Y(0)}" x2="${width-right}" y2="${Y(0)}" stroke="#aaa99c" stroke-dasharray="3 4"/>`;
    if(options.band){const upper=points(options.band.high).filter(Boolean),lower=points(options.band.low).filter(Boolean).reverse();svg+=`<polygon points="${upper.concat(lower).map(p=>p.join(',')).join(' ')}" fill="#d18b98" fill-opacity=".18"/>`;}
    let legendX=left;
    const shortNames={'United Arab Emirates':'UAE','Saudi Arabia':'Saudi Arabia','IMF-derived baseline':'IMF baseline','SARIMA(1,0,0)(0,1,1)[12]':'SARIMA'};
    series.forEach(s=>{const name=mobile?(shortNames[s.name]||s.name):s.name;svg+=`<line x1="${legendX}" y1="18" x2="${legendX+19}" y2="18" stroke="${s.color}" stroke-width="3"/><text x="${legendX+25}" y="22" fill="#e9e0cf" font-size="${mobile?11:12}">${escape(name)}</text>`;legendX+=mobile?Math.min(140,40+name.length*6):Math.min(270,48+s.name.length*7);svg+=`<path d="${path(s.y)}" fill="none" stroke="${s.color}" stroke-width="2.7"${s.dash?' stroke-dasharray="7 5"':''}/>`;if(x.length<=6)for(const p of points(s.y).filter(Boolean))svg+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${s.color}"/>`;});
    if(options.band)svg+=`<text x="${width-right}" y="22" fill="#d18b98" font-size="${mobile?10:11}" text-anchor="end">95% interval</text>`;
    svg+='</svg>';target.innerHTML=svg;
  }

  function history(){
    const key=$('indicator').value,country=$('compare-country').value,definition=data.annual.indicators[key];
    const years=data.annual.years;
    const series=[{name:'Iraq',color:'#d18b98',y:years.map(year=>data.annual.rows.find(r=>r.country==='IRQ'&&r.year===year)?.[key]??null)}];
    if(country)series.push({name:data.annual.countries[country],color:'#30c4a0',y:years.map(year=>data.annual.rows.find(r=>r.country===country&&r.year===year)?.[key]??null)});
    drawChart('history-chart',years,series,{title:definition.label+' in '+definition.units});
    const iraqRows=data.annual.rows.filter(r=>r.country==='IRQ'&&finite(r[key]));
    $('history-note').textContent=`${definition.label} · ${definition.units}. Iraq has ${iraqRows.length} available annual values, ${iraqRows[0]?.year}–${iraqRows.at(-1)?.year}. ${definition.note}`;
  }

  function forecasts(){
    const model=$('forecast-model').value,rows=data.monthly_forecasts.filter(r=>r.model===model);
    drawChart('forecast-chart',rows.map(r=>r.period),[{name:model,color:'#d18b98',y:rows.map(r=>r.prediction_trillion_iqd),dash:true}],{title:'Saved monthly revenue forecast in nominal trillion IQD',periods:true,band:{low:rows.map(r=>r.pi95_low),high:rows.map(r=>r.pi95_high)}});
  }

  function scenarios(){
    const price=Number($('oil-price').value)/100,share=Number($('oil-share').value)/100;
    $('price-label').value=number(price*100,0)+'%';$('share-label').value=number(share*100,0)+'%';
    latestScenario=data.scenario_baseline.map(row=>{const revenue=row.revenue_billion_iqd*(share*(1+price)+(1-share)),baseline=100*(row.revenue_billion_iqd-row.expenditure_billion_iqd)/row.gdp_billion_iqd,scenario=100*(revenue-row.expenditure_billion_iqd)/row.gdp_billion_iqd;return {year:row.year,baseline_balance_pct_gdp:baseline,scenario_balance_pct_gdp:scenario,change_percentage_points:scenario-baseline,scenario_revenue_billion_iqd:revenue,fixed_expenditure_billion_iqd:row.expenditure_billion_iqd,fixed_gdp_billion_iqd:row.gdp_billion_iqd};});
    const first=latestScenario[0];
    $('scenario-stats').innerHTML=`<div><small>${first.year} baseline balance</small><strong>${number(first.baseline_balance_pct_gdp)}%</strong><small>of baseline GDP</small></div><div><small>${first.year} scenario balance</small><strong>${number(first.scenario_balance_pct_gdp)}%</strong><small>of fixed baseline GDP</small></div><div><small>Change in balance</small><strong>${number(first.change_percentage_points)}</strong><small>percentage points</small></div>`;
    drawChart('scenario-chart',latestScenario.map(r=>r.year),[{name:'IMF-derived baseline',color:'#aaa99c',y:latestScenario.map(r=>r.baseline_balance_pct_gdp)},{name:'My scenario',color:'#30c4a0',y:latestScenario.map(r=>r.scenario_balance_pct_gdp)}],{title:'Conditional annual fiscal balance as percent of fixed GDP'});
  }

  function peers(){
    const ids=['oil','income','manufacturing'],weights=ids.map(id=>Number($(id+'-weight').value));
    ids.forEach((id,i)=>$(id+'-weight-label').value=String(weights[i]));
    const sum=weights.reduce((a,b)=>a+b,0);
    if(sum===0){$('peer-warning').textContent='Choose at least one positive weight to define similarity.';$('peer-results').innerHTML='';return;}
    $('peer-warning').textContent='I put the three features on a common scale so that their different units do not decide the ranking.';
    const ranked=data.peers.map(row=>({...row,distance:Math.sqrt(ids.reduce((total,id,i)=>total+row.delta_squared[id]*weights[i]/sum,0))})).sort((a,b)=>a.distance-b.distance||a.country.localeCompare(b.country));
    const top=ranked.slice(0,6),max=Math.max(...top.map(r=>r.distance),.001);
    $('peer-results').innerHTML=top.map((row,i)=>`<div class="peer-row"><span class="rank">${String(i+1).padStart(2,'0')}</span><span>${escape(row.country_name)}</span><div class="peer-bar"><span style="width:${Math.max(3,row.distance/max*100)}%"></span></div><span class="distance">${number(row.distance,3)}</span></div>`).join('');
  }

  function render(){if(!data)return;({history,forecasts,scenarios,peers}[activePanel])();}
  const tabs=[...document.querySelectorAll('[role=tab]')];
  tabs.forEach((button,index)=>{
    button.addEventListener('click',()=>{activePanel=button.dataset.panel;tabs.forEach(tab=>{const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;$(tab.getAttribute('aria-controls')).hidden=!selected;});render();});
    button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();});
    button.tabIndex=index===0?0:-1;
  });
  ['indicator','compare-country'].forEach(id=>$(id).addEventListener('change',history));
  $('forecast-model').addEventListener('change',forecasts);
  ['oil-price','oil-share'].forEach(id=>$(id).addEventListener('input',scenarios));
  ['oil-weight','income-weight','manufacturing-weight'].forEach(id=>$(id).addEventListener('input',peers));
  $('export-scenario').addEventListener('click',()=>{
    const result={baseline_vintage:'IMF WEO April 2026',assumptions:{price_change:Number($('oil-price').value)/100,price_sensitive_share:Number($('oil-share').value)/100,volume_change:0,non_oil_change:0,spending_change:0,GDP_and_FX_held_fixed:true},interpretation:'Conditional accounting sensitivity; no assigned probability and no debt dynamics.',results:latestScenario};
    const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-iraq-fiscal-scenario.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,140);});
  fetch('/thesis/data.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('The saved preview could not load.');return response.json();}).then(payload=>{data=payload;render();document.fonts?.ready.then(render);}).catch(error=>{$('demo-error').hidden=false;$('demo-error').textContent=error.message+' The research plan and presentation remain available below.';});
})();
