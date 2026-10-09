import test from "node:test";
import assert from "node:assert/strict";
import "../../../scripts/browser/site-colors.js";
import {validateDocument,publishedDocument} from "../validation.mjs";
const colors=globalThis.noorColors;
const colorCatalog={families:[{key:"wine",color:"#74263c"},{key:"teal",color:"#30c4a0"}],colors:[{key:"74263c",value:"#74263c",family:"wine"},{key:"d18b98",value:"#d18b98",family:"wine"},{key:"30c4a0",value:"#30c4a0",family:"teal"}],aliases:{"--wine":"rgb(var(--site-color-74263c,116 38 60))"}};
const catalog={colorCatalog,pages:[{id:"home/index.html",route:"/",fields:[{key:"heading:0",kind:"text"}],collections:[],designTargets:[{key:"hero"}]}]};
const initial={version:1,pages:{},orders:{},photos:[],piano:[]},env={ADMIN_ORIGIN:"https://admin.nooruldeen.com"};
test("default palette leaves every original RGB value exact",()=>{
  for(const entry of colorCatalog.colors)assert.equal(colors.resolve(entry,{},colorCatalog),entry.value);
  assert.deepEqual(colors.variables(colorCatalog,{}),{});
});
test("wine replacements update its shades while teal remains unchanged",()=>{
  const palette={families:{wine:"#4834bc"}};
  assert.equal(colors.resolve(colorCatalog.colors[0],palette,colorCatalog),"#4834bc");
  assert.notEqual(colors.resolve(colorCatalog.colors[1],palette,colorCatalog),"#d18b98");
  assert.equal(colors.resolve(colorCatalog.colors[2],palette,colorCatalog),"#30c4a0");
});
test("an exact shade replacement overrides the family, and a local replacement remains scoped",()=>{
  const global={families:{wine:"#4834bc"},colors:{d18b98:"#ffcc00"}},local={families:{wine:"#007755"}};
  assert.equal(colors.resolve(colorCatalog.colors[1],global,colorCatalog),"#ffcc00");
  const scoped=colors.variables(colorCatalog,colors.merge(global,local),local);
  assert.equal(scoped["--site-color-74263c"],"0 119 85");assert(!("--site-color-30c4a0" in scoped));
  assert.equal(colors.variables(colorCatalog,global)["--site-color-74263c"],"72 52 188");
});
test("SVG palette replacement preserves geometry and opacity",()=>{
  const svg='<svg><path fill="#74263C" fill-opacity=".5" stroke="#30C4A0" d="M0 0L2 2"/></svg>';
  const updated=colors.recolorSvg(svg,colorCatalog,{families:{wine:"#4834bc"}});
  assert(updated.includes('fill="#4834bc"'));assert(updated.includes('fill-opacity=".5"'));assert(updated.includes('d="M0 0L2 2"'));assert(updated.includes('stroke="#30c4a0"'));
});
test("palette and individual colors persist through saving and publication in separate languages",()=>{
  const data={...initial,palette:{families:{wine:"#4834BC"},colors:{d18b98:"#ffcc00"}},styles:{"home/index.html":{"heading:0":{en:{color:"#ffffff",background:"transparent",shadow:"#007755"},ar:{color:"#ffcc00"}},hero:{en:{background:"#111111",palette:{families:{teal:"#3377aa"}}}}}}};
  const saved=validateDocument(data,catalog,env),published=publishedDocument(saved);
  assert.equal(published.palette.families.wine,"#4834bc");assert.deepEqual(published.styles,data.styles);
  assert.equal(published.styles["home/index.html"]["heading:0"].ar.color,"#ffcc00");
});
test("colors cannot inject CSS, scripts, unknown palette values or unrelated elements",()=>{
  for(const value of ['red;display:none','url(https://attacker.test)','var(--secret)',{},'#abc'])assert.throws(()=>validateDocument({...initial,styles:{"home/index.html":{"heading:0":{en:{color:value}}}}},catalog,env));
  for(const palette of [{families:{unknown:"#ffffff"}},{colors:{bad:"#ffffff"}},{families:{wine:"url(https://attacker.test)"}},{css:"body{display:none}"}])assert.throws(()=>validateDocument({...initial,palette},catalog,env));
  assert.throws(()=>validateDocument({...initial,styles:{"home/index.html":{"unknown-element":{en:{color:"#ffffff"}}}}},catalog,env));
});
