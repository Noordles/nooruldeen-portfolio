/* Numeric, inspectable rules shared with the Python Insight contract. */
(() => {
  "use strict";
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const fmt = value => Number(value).toLocaleString("en-GB", {minimumFractionDigits:2,maximumFractionDigits:2});
  const direction = value => Math.abs(value)<1e-10 ? "was unchanged" : value>0 ? "rose" : "fell";
  const meanings = {
    growth:"A positive growth rate means output grew in that year; a falling positive rate means slower growth, not necessarily falling output.",
    gdp_per_capita:"This is output per person after allowing for price changes. It is not the income of a typical household.",
    manufacturing:"This is a share of GDP. A falling share does not by itself establish that manufacturing output fell.",
    oil_rents:"Oil rents estimate the value of oil production after production costs. They are not government oil revenue or the oil sector’s share of GDP."
  };
  const descriptive = "This describes the selected data. It does not establish a cause or a statistically significant difference.";
  function note(rule,kind,title,body,evidence,limits=[],values={},titleValues={}) {
    const substitute = text => text.replace(/\{([a-z_]+)\}/g,(_,key)=>String(values[key]??titleValues[key]??"{"+key+"}"));
    return {rule,kind,title:substitute(title),body:substitute(body),evidence,limits,
      title_key:title,body_key:body,values,title_values:titleValues};
  }
  function annual(data,field,start,end,countries) {
    if(!meanings[field]||!Number.isInteger(start)||!Number.isInteger(end)||start>end)throw Error("Invalid annual selection");
    const notes=[],series=[]; const def=data.indicators[field],units=def.units;
    for(const country of [...new Set(countries)]) {
      const rows=data.rows.filter(r=>r.country===country&&r.year>=start&&r.year<=end).sort((a,b)=>a.year-b.year);
      if(new Set(rows.map(r=>r.year)).size!==rows.length)throw Error("Duplicate annual values");
      const valid=rows.filter(r=>finite(r[field])),name=data.countries[country]??country;
      const evidence={country,country_name:name,indicator:field,units,selected_start:start,selected_end:end,available_values:valid.length,expected_annual_values:end-start+1};
      const titleValues={country:name,label:def.label};
      if(!valid.length){notes.push(note("annual.no_data","data_quality","No {label} values for {country}","No values are available for {start}–{end}. Choose another period or indicator.",evidence,[meanings[field]],{start,end},titleValues));continue;}
      const first=valid[0],last=valid.at(-1);Object.assign(evidence,{first_year:first.year,last_year:last.year,first_value:first[field],last_value:last[field]});
      series.push({country,name,valid});
      const limits=[meanings[field],descriptive];
      if(valid.length!==end-start+1)limits.push("Missing years stay missing. The dates in this note are the available endpoints.");
      if(valid.length===1){notes.push(note("annual.single_value","observation","One value for {country}","{label} was {value} {units} in {year}. One value cannot show a change over time.",evidence,limits,{label:def.label,value:fmt(first[field]),units,year:first.year},titleValues));continue;}
      const change=last[field]-first[field],changeUnits=field==="gdp_per_capita"?units:"percentage points";
      Object.assign(evidence,{change,change_units:changeUnits,relative_change_pct:field==="gdp_per_capita"&&first[field]>0?100*change/first[field]:null});
      notes.push(note("annual.endpoints","observation","{country}: {label} {direction}","From {start} to {end}, the value went from {first} to {last} {units}. The change is {change} {change_units}. {count} of {expected} selected annual values are available.",evidence,limits,{start:first.year,end:last.year,first:fmt(first[field]),last:fmt(last[field]),units,change:fmt(change),change_units:changeUnits,count:valid.length,expected:end-start+1},{...titleValues,direction:direction(change)}));
      if(field==="growth"&&last[field]<0)notes.at(-1).limits.push("The final growth rate is negative: output contracted in that year, even if the rate improved.");
      const steps=valid.slice(1).map((r,i)=>({r,previous:valid[i],change:r[field]-valid[i][field]})).filter(s=>s.r.year===s.previous.year+1).sort((a,b)=>Math.abs(b.change)-Math.abs(a.change));
      if(valid.length>=3&&steps.length&&Math.abs(steps[0].change)>1e-10){const s=steps[0];notes.push(note("annual.largest_step","observation","{country}: the largest available one-year move","Between {start} and {end}, the change was {change} {change_units}. This compares consecutive available years within your selection.",{country,indicator:field,from_year:s.previous.year,to_year:s.r.year,change:s.change,previous_value:s.previous[field],new_value:s.r[field]},[descriptive],{start:s.previous.year,end:s.r.year,change:fmt(s.change),change_units:changeUnits},titleValues));}
    }
    let opposite=null;
    for(let a=0;a<series.length;a++)for(let b=a+1;b<series.length;b++){
      const one=series[a],two=series[b],common=one.valid.filter(r=>two.valid.some(s=>s.year===r.year));
      if(common.length<2)continue;
      const first=common[0],last=common.at(-1),otherFirst=two.valid.find(r=>r.year===first.year),otherLast=two.valid.find(r=>r.year===last.year);
      const da=last[field]-first[field],db=otherLast[field]-otherFirst[field];
      if(da*db<0&&Math.abs(da)>1e-10&&Math.abs(db)>1e-10&&(!opposite||Math.abs(da-db)>opposite.score))opposite={one,two,first,last,da,db,n:common.length,score:Math.abs(da-db)};
    }
    if(opposite){const s=opposite;notes.unshift(note("annual.opposite_directions","comparison","These two countries moved in different directions","Using the same available endpoint years, {start}–{end}, {label} {first_direction} in {first_country} and {second_direction} in {second_country}. This is a difference to investigate, not an explanation of its cause.",{indicator:field,countries:[s.one.country,s.two.country],common_start:s.first.year,common_end:s.last.year,common_values:s.n,first_change:s.da,second_change:s.db,change_units:field==="gdp_per_capita"?units:"percentage points"},[meanings[field],descriptive],{start:s.first.year,end:s.last.year,label:def.label,first_direction:direction(s.da),second_direction:direction(s.db),first_country:s.one.name,second_country:s.two.name}));}
    return notes;
  }
  function scenarioRows(baseline,price,share) {
    if(!finite(price)||!finite(share)||price<=-1||share<0||share>1)throw Error("Invalid scenario controls");
    return baseline.map(r=>{if(![r.revenue_billion_iqd,r.expenditure_billion_iqd,r.gdp_billion_iqd].every(finite)||r.gdp_billion_iqd<=0)throw Error("Invalid baseline");const factor=share*(1+price)+(1-share),revenue=r.revenue_billion_iqd*factor,base=100*(r.revenue_billion_iqd-r.expenditure_billion_iqd)/r.gdp_billion_iqd,value=100*(revenue-r.expenditure_billion_iqd)/r.gdp_billion_iqd;return {year:r.year,baseline_balance_pct_gdp:base,scenario_balance_pct_gdp:value,change_percentage_points:value-base,scenario_revenue_billion_iqd:revenue,fixed_expenditure_billion_iqd:r.expenditure_billion_iqd,fixed_gdp_billion_iqd:r.gdp_billion_iqd};});
  }
  function scenario(baseline,price,share) {
    const rows=scenarioRows(baseline,price,share).sort((a,b)=>a.year-b.year);if(!rows.length)return [];
    const r=rows[0],base=baseline.find(b=>b.year===r.year),factor=share*(1+price)+(1-share);
    const evidence={year:r.year,baseline_balance_pct_gdp:r.baseline_balance_pct_gdp,scenario_balance_pct_gdp:r.scenario_balance_pct_gdp,change_pp:r.change_percentage_points,revenue_factor:factor,revenue_change_billion_iqd:r.scenario_revenue_billion_iqd-base.revenue_billion_iqd,expenditure_change_billion_iqd:0,price_change:price,volume_change:0,non_oil_change:0,spending_change:0,price_sensitive_share:share};
    const limits=["This is a calculation under the selected assumptions, not a forecast or an assigned probability.","Baseline GDP and the exchange rate stay fixed. This model does not simulate government responses, financing or debt dynamics."];
    const notes=[note("scenario.balance","scenario","How this selection changes the budget balance","In {year}, the baseline balance is {baseline}% of GDP and the scenario balance is {scenario}%. The difference is {change} percentage points.",evidence,limits,{year:r.year,baseline:fmt(r.baseline_balance_pct_gdp),scenario:fmt(r.scenario_balance_pct_gdp),change:fmt(r.change_percentage_points)})];
    notes.push(note("scenario.mechanism","scenario","Why the number changes",share===0&&price!==0?"The oil-price control has no effect because the selected price-sensitive revenue share is zero.":"Oil prices change by {price}%, and the assumed sensitive revenue share is {share}%. These assumptions multiply baseline revenue by {factor}; spending stays fixed.",evidence,limits,{price:fmt(price*100),share:fmt(share*100),factor:fmt(factor)}));return notes;
  }
  function forecast(metrics,forecasts,model,origin) {
    const selected=metrics.filter(r=>r.model===model);if(selected.length!==1)throw Error("A unique saved method is required");
    if(!metrics.every(r=>[r.MAE_trillion_iqd,r.RMSE_trillion_iqd,r.successful_forecasts,r.expected_forecasts].every(v=>finite(v)&&v>=0)))throw Error("Invalid forecast scores");
    const r=selected[0],comparable=metrics.every(x=>x.successful_forecasts===x.expected_forecasts&&x.expected_forecasts===metrics[0].expected_forecasts)&&metrics[0].expected_forecasts>0,notes=[];
    if(comparable){const mae=[...metrics].sort((a,b)=>a.MAE_trillion_iqd-b.MAE_trillion_iqd)[0].model,rmse=[...metrics].sort((a,b)=>a.RMSE_trillion_iqd-b.RMSE_trillion_iqd)[0].model;notes.push(note("forecast.errors","uncertainty","How this method performed in the saved experiment","{model} has MAE {mae} and RMSE {rmse} trillion IQD across {months} test months. {best_mae} has the lowest MAE; {best_rmse} has the lowest RMSE in this saved comparison.",{model,mae_trillion_iqd:r.MAE_trillion_iqd,rmse_trillion_iqd:r.RMSE_trillion_iqd,test_months:r.successful_forecasts,best_mae:mae,best_rmse:rmse},["These are revised-data test results. They do not establish the best method for future unseen data."],{model,mae:fmt(r.MAE_trillion_iqd),rmse:fmt(r.RMSE_trillion_iqd),months:r.successful_forecasts,best_mae:mae,best_rmse:rmse}));}
    else notes.push(note("forecast.incomplete_comparison","data_quality","These error scores need a comparability check","The methods do not all have complete forecasts for the same number of targets. I will not declare a winner from this table.",{model}));
    const f=forecasts.filter(r=>r.model===model).sort((a,b)=>a.period.localeCompare(b.period));
    if(f.some(r=>![r.prediction_trillion_iqd,r.pi95_low,r.pi95_high].every(finite)||r.pi95_low>r.pi95_high))throw Error("Invalid prediction interval");
    if(f.length){const r=f[0],limits=["This is a saved model prediction, not an observed result or a freshly updated forecast.","The interval depends on model assumptions and does not capture every structural shock or source revision."];if(r.pi95_low<0)limits.push("The interval extends below zero because this model is unconstrained.");notes.push(note("forecast.interval","uncertainty","Read the prediction together with its uncertainty","The saved {model} prediction for {target} is {prediction} trillion IQD, with a conditional 95% interval from {low} to {high}. Its history ends in {origin}.",{model,origin,target:r.period,prediction_trillion_iqd:r.prediction_trillion_iqd,pi95_low:r.pi95_low,pi95_high:r.pi95_high},limits,{model,target:r.period,prediction:fmt(r.prediction_trillion_iqd),low:fmt(r.pi95_low),high:fmt(r.pi95_high),origin}));}return notes;
  }
  function peers(rows,weights) {
    if(weights.length!==3||!weights.every(w=>finite(w)&&w>=0))throw Error("Invalid peer weights");
    const sum=weights.reduce((a,b)=>a+b,0),ids=["oil","income","manufacturing"];
    if(!sum||!rows.length)return [note("peers.undefined","data_quality","Choose what similarity should mean","At least one feature needs a positive weight before I can rank the countries.",{weights})];
    const ranked=rows.filter(r=>r.country!=="IRQ").map(r=>{const terms=Object.fromEntries(ids.map((id,i)=>[id,r.delta_squared[id]*weights[i]/sum]));if(!Object.values(terms).every(v=>finite(v)&&v>=0))throw Error("Invalid peer contributions");return {...r,terms,distance:Math.sqrt(Object.values(terms).reduce((a,b)=>a+b,0))};}).sort((a,b)=>a.distance-b.distance||a.country.localeCompare(b.country));
    if(!ranked.length)return [];
    const r=ranked[0],total=r.distance**2,main=ids.reduce((a,b)=>r.terms[b]>r.terms[a]?b:a),labels={oil:"oil rents",income:"log real GDP per person",manufacturing:"manufacturing share"};
    const evidence={country:r.country,country_name:r.country_name,distance:r.distance,weights:Object.fromEntries(ids.map((id,i)=>[id,weights[i]/sum])),squared_distance_contributions:r.terms};
    return [note("peers.nearest","comparison","How the selected weights shape the nearest match",total>1e-10?"{country} is the nearest loaded country, with distance {distance}. {feature} contributes {contribution}% of its squared distance. The comparison baseline remains 2003–2007.":"{country} matches Iraq's measured baseline features at this numerical precision.",evidence,["Features are standardized before their distances are weighted.","Nearest in this selected set does not mean a causal control country or an explanation of development differences."],{country:r.country_name,distance:fmt(r.distance),feature:labels[main],contribution:fmt(total?100*r.terms[main]/total:0)})];
  }
  const api={annual,scenario,scenarioRows,forecast,peers};
  if(typeof window!=="undefined")window.NoorInsights=api;
  if(typeof module!=="undefined")module.exports=api;
})();
