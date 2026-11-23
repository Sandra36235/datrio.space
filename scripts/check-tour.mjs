// Checks the scroll tour's chapter math: run with `node scripts/check-tour.mjs`.
import assert from 'node:assert/strict';
import {CHAPTERS,chapterAt,shotAt,chapterForHash,introProgress,INTRO_MS,STUDIO_CHAPTERS,STUDIO_MS} from '../tour-math.js';

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

// Coming back from an interior page skips the intro; a fresh visit plays it.
assert.deepEqual(chapterForHash('#salon'),{mode:'free',room:'salon'});
assert.deepEqual(chapterForHash('#estudio'),{mode:'free',room:'estudio'});
assert.deepEqual(chapterForHash(''),{mode:'intro',room:'salon'});
assert.deepEqual(chapterForHash('#otra-cosa'),{mode:'intro',room:'salon'});

// The intro runs on a clock: introProgress(ms) is 0..1 over INTRO_MS.
assert.equal(introProgress(0),0);
assert.equal(introProgress(INTRO_MS),1);
assert.equal(introProgress(INTRO_MS*3),1);
assert.ok(near(introProgress(INTRO_MS/2),.5));
assert.ok(INTRO_MS>=14000&&INTRO_MS<=20000,'intro lasts 14-20 seconds');

// Studio intro: a shorter tour of the study.
assert.deepEqual(STUDIO_CHAPTERS.map(c=>c.id),['estudio','tablero','pizarra','diplomas']);
assert.ok(STUDIO_MS>=8000&&STUDIO_MS<=12000,'studio intro lasts 8-12 seconds');
assert.ok(near(introProgress(STUDIO_MS/2,STUDIO_MS),.5));
assert.ok(nearVec(shotAt(1,STUDIO_CHAPTERS).focus,[-.6,3.05,-3.9]),'studio intro ends on the diplomas');

console.log('Tour math checks passed.');
