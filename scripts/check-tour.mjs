// Checks the scroll tour's chapter math: run with `node scripts/check-tour.mjs`.
import assert from 'node:assert/strict';
import {CHAPTERS,chapterAt,shotAt,chapterForHash} from '../tour-math.js';

const near=(a,b,eps=1e-6)=>Math.abs(a-b)<=eps;
const nearVec=(a,b,eps=1e-6)=>a.length===b.length&&a.every((v,i)=>near(v,b[i],eps));

assert.deepEqual(chapterAt(0,5),{index:0,t:0});
assert.deepEqual(chapterAt(1,5),{index:4,t:1});
assert.equal(chapterAt(-2,5).index,0);
const mid=chapterAt(0.5,5);assert.equal(mid.index,2);assert.ok(near(mid.t,.5));

assert.equal(shotAt(0.1).zoom,CHAPTERS[0].shot.zoom,'holds chapter 0 early on');
assert.ok(nearVec(shotAt(0.2-1e-9).focus,CHAPTERS[1].shot.focus),'end of chapter 0 has blended into chapter 1');
const blend=shotAt(0.18).zoom,lo=Math.min(CHAPTERS[0].shot.zoom,CHAPTERS[1].shot.zoom),hi=Math.max(CHAPTERS[0].shot.zoom,CHAPTERS[1].shot.zoom);
assert.ok(blend>lo&&blend<hi,'mid-blend zoom lies between the two chapters');

assert.ok(nearVec(shotAt(1).focus,CHAPTERS[CHAPTERS.length-1].shot.focus),'progress 1 is the Puyol shot');
assert.equal(CHAPTERS[CHAPTERS.length-1].id,'puyol');
assert.equal(shotAt(0).night,1);
assert.equal(shotAt(0.4).night,0);

assert.deepEqual(chapterForHash('#salon'),{mode:'tour',room:'salon',index:1});
assert.deepEqual(chapterForHash('#estudio'),{mode:'free',room:'estudio',index:0});
assert.deepEqual(chapterForHash(''),{mode:'tour',room:'salon',index:0});

console.log('Tour math checks passed.');
