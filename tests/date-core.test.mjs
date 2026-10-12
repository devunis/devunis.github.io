import test from 'node:test';
import assert from 'node:assert/strict';
import {day, iso, difference, anniversary, breaks, isOff, holidays} from '../assets/js/date-core.mjs';
test('date-only arithmetic crosses leap day and year boundary',()=>{
 assert.equal(difference('2024-02-28','2024-03-01'),2);
 assert.equal(difference('2026-12-31','2027-01-01'),1);
 assert.equal(difference('2026-10-12','2026-10-11'),-1);
 assert.throws(()=>day('2026-02-29'));
});
test('anniversary handles inclusive counting and invalid counts',()=>{
 assert.equal(anniversary('2026-01-01',100,true),'2026-04-10');
 assert.equal(anniversary('2026-01-01',100,false),'2026-04-11');
 assert.equal(anniversary('2024-02-28',2,true),'2024-02-29');
 assert.throws(()=>anniversary('2026-01-01',0));
});
test('holiday data matches published five-day-workweek totals',()=>{
 for(const [year,total] of [[2026,120],[2027,119]]){
 let count=0;for(let n=day(`${year}-01-01`);n<=day(`${year}-12-31`);n++) if(isOff(n)) count++;
 assert.equal(count,total);
 }
 assert.equal(holidays['2027-05-03'],'노동절 대체공휴일');
});
test('leave planning uses only working days, stays in range, and does not overlap',()=>{
 for(const budget of [0,1,2,3]){
 const plans=breaks(2027,budget,'2027-05-01');
 for(const p of plans){
 assert.ok(p.start>='2027-05-01' && p.end<='2027-12-31');
 assert.equal(p.days,difference(p.start,p.end)+1);
 const work=[];for(let n=day(p.start);n<=day(p.end);n++) if(!isOff(n))work.push(iso(n));
 assert.deepEqual(p.leave,work);assert.ok(work.length<=budget);
 }
 for(let i=0;i<plans.length;i++)for(let j=i+1;j<plans.length;j++)assert.ok(plans[i].end<plans[j].start||plans[j].end<plans[i].start);
 }
 assert.ok(breaks(2027,1).some(p=>p.start==='2027-09-11'&&p.end==='2027-09-16'&&p.days===6));
 assert.deepEqual(breaks(2026,0,'2027-01-01'),[]);
});
