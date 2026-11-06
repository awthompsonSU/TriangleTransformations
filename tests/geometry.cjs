const assert=require('node:assert/strict'),m=require('../website/script.js');
let seed=20261106; Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(const type of ['translation','reflection','rotation'])for(let i=0;i<10000;i++){
const p=m.generateProblem(type);const independent=p.original.map(([x,y])=>{const r=p.rule;if(type==='translation')return [x+r.dx,y+r.dy];if(type==='reflection')return r.axis==='x'?[2*r.value-x,y]:[x,2*r.value-y];const a=r.degrees*Math.PI/180*(r.direction==='cw'?-1:1);return [Math.round(x*Math.cos(a)-y*Math.sin(a)),Math.round(x*Math.sin(a)+y*Math.cos(a))]});
assert(m.trianglesMatch(p.transformed,independent));assert(m.twiceArea(p.original)>=20);assert.equal(m.twiceArea(p.original),m.twiceArea(p.transformed));assert(p.transformed.flat().every(v=>Math.abs(v)<=15));assert(!m.trianglesMatch(p.original,p.transformed));if(type==='rotation')assert(m.trianglesMatch(m.applyTransformation(p.original,{...p.rule,degrees:360-p.rule.degrees,direction:p.rule.direction==='cw'?'ccw':'cw'}),p.transformed));
}console.log('PASS: 30,000 generated problems: independent coordinates, area, bounds, nonidentity, equivalent rotations');

// Check every supported rotation on the whole displayed integer grid.
for(let x=-15;x<=15;x++)for(let y=-15;y<=15;y++){
 const pts=[[x,y]];
 for(const direction of ['cw','ccw'])for(const degrees of [90,180,270]){
  const r={type:'rotation',degrees,direction};
  const a=degrees*Math.PI/180*(direction==='cw'?-1:1);
  const expected=[[Math.round(x*Math.cos(a)-y*Math.sin(a)),Math.round(x*Math.sin(a)+y*Math.cos(a))]];
  assert(m.trianglesMatch(m.applyTransformation(pts,r),expected));
 }
 for(const axis of ['x','y'])for(let value=-15;value<=15;value++){
  const r={type:'reflection',axis,value};
  assert(m.trianglesMatch(m.applyTransformation(m.applyTransformation(pts,r),r),pts));
 }
}
const pts=[[1,2],[5,3],[-2,6]];
assert(!m.trianglesMatch(pts,[pts[1],pts[0],pts[2]]));
assert(!m.trianglesMatch(pts,[[1,2],[5,3],[-2,5]]));
assert(!m.trianglesMatch(m.applyTransformation(pts,{type:'rotation',degrees:90,direction:'cw'}),m.applyTransformation(pts,{type:'rotation',degrees:90,direction:'ccw'})));
assert.equal(m.escapeCsv('=1+1'),'"\'=1+1"');
assert.equal(m.escapeCsv('A "Student"'),'"A ""Student"""');
console.log('PASS: exhaustive rotation grid, reflection round trips, incorrect correspondence/direction, CSV escaping');

// Two-step problems must compose in order, stay on-grid at both stages,
// and require more than one of the supported single transformations.
const pairs = new Set();
function independent(points, rule) {
 return points.map(([x,y]) => {
  if(rule.type==='translation') return [x+rule.dx,y+rule.dy];
  if(rule.type==='reflection') return rule.axis==='x' ? [2*rule.value-x,y] : [x,2*rule.value-y];
  const a=rule.degrees*Math.PI/180*(rule.direction==='cw'?-1:1);
  return [Math.round(x*Math.cos(a)-y*Math.sin(a)),Math.round(x*Math.sin(a)+y*Math.cos(a))];
 });
}
for(const type of ['translation','reflection','rotation'])for(let i=0;i<2000;i++) {
 const p=m.generateHardProblem(type);
 assert.equal(p.rules[0].type,type);
 assert.notEqual(p.rules[0].type,p.rules[1].type);
 pairs.add(p.rules.map(r=>r.type).join(' then '));
 assert(m.trianglesMatch(p.intermediate,independent(p.original,p.rules[0])));
 assert(m.trianglesMatch(p.transformed,independent(p.intermediate,p.rules[1])));
 for(const points of [p.original,p.intermediate,p.transformed]){
  assert(points.flat().every(v=>Number.isInteger(v)&&Math.abs(v)<=15));
  assert.equal(m.twiceArea(points),m.twiceArea(p.original));
 }
 assert(!m.mapsInOneStep(p.original,p.transformed));
 // Enumerate all supported one-step candidates independently of the shortcut detector.
 const possible=[...Array.from({length:31},(_,i)=>i-15).flatMap(value=>['x','y'].map(axis=>({type:'reflection',axis,value}))),
 ...[90,180,270].map(degrees=>({type:'rotation',degrees,direction:'ccw'})),
 {type:'translation',dx:p.transformed[0][0]-p.original[0][0],dy:p.transformed[0][1]-p.original[0][1]}];
 assert(possible.every(r=>!m.trianglesMatch(independent(p.original,r),p.transformed)));
}
assert.equal(pairs.size,6);
console.log('PASS: 6,000 hard problems, all six ordered category pairs, independent composition, bounds and no one-step shortcuts');
