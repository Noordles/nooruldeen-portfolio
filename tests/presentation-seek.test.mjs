import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{attach}=require('../scripts/browser/presentation-seek.js');
function setup(lang='en'){let index=0;const handlers={},attrs={},fill={style:{}},track={style:{setProperty(k,v){this[k]=v;}},setAttribute(k,v){attrs[k]=v;},querySelector(){return fill;},addEventListener(k,f){handlers[k]=f;},getBoundingClientRect(){return {left:10,width:180};},focus(){},setPointerCapture(){}};let bar;const show=i=>{index=i;bar?.update(i);};bar=attach(track,19,show,()=>index,{language:()=>lang});return {attrs,fill,track,handlers,get index(){return index;}};}
function event(extras){return {button:0,pointerId:1,preventDefault(){},stopPropagation(){},...extras};}
test('pointer seeking and dragging clamp endpoints and update slide number',()=>{const s=setup();s.handlers.pointerdown(event({clientX:100}));assert.equal(s.index,9);assert.equal(s.attrs['aria-valuenow'],'10');s.handlers.pointermove(event({clientX:999}));assert.equal(s.index,18);assert.equal(s.fill.style.width,'100%');s.handlers.pointerup(event({}));s.handlers.pointermove(event({clientX:10}));assert.equal(s.index,18);});
test('keyboard navigation supports both ends, pages and arrows',()=>{const s=setup();for(const [key,expected] of [['End',18],['Home',0],['ArrowRight',1],['PageUp',6],['PageDown',1],['ArrowLeft',0]]){s.handlers.keydown(event({key}));assert.equal(s.index,expected);}});
test('Arabic seeking and arrows follow right to left direction',()=>{const s=setup('ar');s.handlers.pointerdown(event({clientX:10}));assert.equal(s.index,18);s.handlers.keydown(event({key:'ArrowRight'}));assert.equal(s.index,17);assert.ok(s.attrs['aria-label'].includes('الشريحة'));});
test('Romanian slider announces current slide and total',()=>{const s=setup('ro');assert.equal(s.attrs['aria-valuetext'],'Diapozitivul 1 din 19');assert.equal(s.attrs.role,'slider');assert.throws(()=>attach(null,19,()=>{},()=>0));});

