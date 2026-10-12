const DAY = 86400000;
export function day(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('날짜를 선택해주세요.');
  const n = Date.parse(value + 'T00:00:00Z') / DAY;
  if (!Number.isFinite(n) || iso(n) !== value) throw new Error('올바른 날짜를 입력해주세요.');
  return n;
}
export const iso = n => new Date(n * DAY).toISOString().slice(0, 10);
export const difference = (from, to) => day(to) - day(from);
export function anniversary(start, count, inclusive = false) {
  if (!Number.isInteger(count) || count < 1 || count > 100000) throw new Error('1~100,000 사이의 일수를 입력해주세요.');
  return iso(day(start) + count - (inclusive ? 1 : 0));
}
// KASI calendar data, with 2026 Labor Day / Constitution Day updates from KASA.
const entries = {
  2026: [['01-01','새해 첫날'],['02-16','설 연휴'],['02-17','설날'],['02-18','설 연휴'],['03-01','삼일절'],['03-02','삼일절 대체공휴일'],['05-01','노동절'],['05-05','어린이날'],['05-24','부처님오신날'],['05-25','부처님오신날 대체공휴일'],['06-03','지방선거'],['06-06','현충일'],['07-17','제헌절'],['08-15','광복절'],['08-17','광복절 대체공휴일'],['09-24','추석 연휴'],['09-25','추석'],['09-26','추석 연휴'],['10-03','개천절'],['10-05','개천절 대체공휴일'],['10-09','한글날'],['12-25','성탄절']],
  2027: [['01-01','새해 첫날'],['02-06','설 연휴'],['02-07','설날'],['02-08','설 연휴'],['02-09','설날 대체공휴일'],['03-01','삼일절'],['05-01','노동절'],['05-03','노동절 대체공휴일'],['05-05','어린이날'],['05-13','부처님오신날'],['06-06','현충일'],['07-17','제헌절'],['07-19','제헌절 대체공휴일'],['08-15','광복절'],['08-16','광복절 대체공휴일'],['09-14','추석 연휴'],['09-15','추석'],['09-16','추석 연휴'],['10-03','개천절'],['10-04','개천절 대체공휴일'],['10-09','한글날'],['10-11','한글날 대체공휴일'],['12-25','성탄절'],['12-27','성탄절 대체공휴일']]
};
export const holidays = Object.fromEntries(Object.entries(entries).flatMap(([year, rows]) => rows.map(([date, name]) => [year + '-' + date, name])));
export const isOff = n => [0,6].includes(new Date(n * DAY).getUTCDay()) || Boolean(holidays[iso(n)]);
export function breaks(year, budget = 0, after = `${year}-01-01`) {
  if (![2026,2027].includes(year) || ![0,1,2,3].includes(budget)) throw new Error('지원 범위를 확인해주세요.');
  const first = Math.max(day(`${year}-01-01`), day(after)), last = day(`${year}-12-31`);
  const results = [];
  for (let start = first; start <= last; start++) {
    if (start > first && isOff(start - 1) && isOff(start)) continue;
    let leave = [];
    for (let end = start; end <= last; end++) {
      if (!isOff(end)) leave.push(iso(end));
      if (leave.length > budget) break;
      if (end < last && isOff(end + 1)) continue;
      if (end - start + 1 < 3) continue;
      const names = [...new Set(Array.from({length: end-start+1}, (_,i) => holidays[iso(start+i)]).filter(Boolean))];
      if (!names.length) continue;
      results.push({start:iso(start), end:iso(end), days:end-start+1, leave:[...leave], names});
    }
  }
  // Prefer the longest interval; suppress shorter overlapping alternatives.
  const ranked = results.sort((a,b) => b.days-a.days || a.leave.length-b.leave.length || a.start.localeCompare(b.start));
  const selected = [];
  for (const item of ranked) {
    if (!selected.some(x => item.start <= x.end && item.end >= x.start)) selected.push(item);
  }
  return selected.sort((a,b) => budget ? b.days-a.days || a.start.localeCompare(b.start) : a.start.localeCompare(b.start));
}
