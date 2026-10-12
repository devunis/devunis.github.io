import {iso, day, difference, anniversary, breaks, holidays as holidayDates} from './date-core.mjs';
const $ = id => document.getElementById(id);
const parts = new Intl.DateTimeFormat('en', {timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
const part = name => parts.find(x => x.type === name).value;
const today = `${part('year')}-${part('month')}-${part('day')}`;
const format = value => new Intl.DateTimeFormat('ko-KR', {timeZone:'UTC',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(new Date(value+'T00:00:00Z'));
$('today-label').textContent = today.replaceAll('-', '.');
$('date-from').value = today;
$('date-to').value = iso(day(today)+30);
$('anniversary-start').value = today;
$('holiday-year').value = today.slice(0,4) === '2027' ? '2027' : '2026';
function countdown(event) {
  event?.preventDefault();
  try {
    const days = difference($('date-from').value,$('date-to').value);
    $('dday-result').textContent = days === 0 ? 'D-DAY' : `D${days > 0 ? '−' : '+'}${Math.abs(days).toLocaleString('ko-KR')}`;
    $('dday-detail').textContent = days === 0 ? '기준일과 같은 날이에요.' : `기준일보다 ${Math.abs(days).toLocaleString('ko-KR')}일 ${days > 0 ? '후예요.' : '전이에요.'}`;
  } catch (error) { $('dday-detail').textContent = error.message; $('dday-result').textContent = '—'; }
}
function milestone(event) {
  event?.preventDefault();
  try {
    const n = Number($('anniversary-count').value);
    const result = anniversary($('anniversary-start').value,n,$('include-start').checked);
    if (Number(result.slice(0,4)) > 9999) throw new Error('계산 가능한 날짜 범위를 초과했어요.');
    $('anniversary-result').textContent = result.replaceAll('-', '.');
    $('anniversary-detail').textContent = `${format(result)} · ${n}일${$('include-start').checked ? '째' : ' 후'}`;
  } catch (error) { $('anniversary-detail').textContent = error.message; $('anniversary-result').textContent = '—'; }
}
function holidays() {
  const year = Number($('holiday-year').value), budget = Number($('leave-budget').value);
  const items = breaks(year,budget,$('future-only').checked ? today : `${year}-01-01`);
  $('holiday-summary').textContent = items.length ? `${budget ? '연차를 더해 길게 쉬는 순서' : '다가오는 연휴 순서'} · ${items.length}개 구간` : '선택한 조건에 맞는 연휴가 없어요. 다른 연도나 연차 일수를 선택해보세요.';
  const substitutes = Object.entries(holidayDates).filter(([date,name]) => date.startsWith(String(year)) && name.includes('대체공휴일') && (!$('future-only').checked || date >= today));
  $('substitute-results').replaceChildren(...substitutes.map(([date,name]) => {
    const row = document.createElement('div'); row.className = 'dates-substitute';
    const badge = document.createElement('span'); badge.textContent = '대체공휴일';
    const label = document.createElement('strong'); label.textContent = name.replace(' 대체공휴일','');
    const when = document.createElement('time'); when.dateTime = date; when.textContent = format(date);
    row.append(badge,label,when); return row;
  }));
  $('substitute-empty').hidden = substitutes.length > 0;
  $('holiday-results').replaceChildren(...items.map((item,index) => {
    const card = document.createElement('article'); card.className = 'dates-break';
    const number = document.createElement('span'); number.className = 'dates-kicker'; number.textContent = String(index+1).padStart(2,'0');
    const title = document.createElement('h3'); title.textContent = `${item.days}일 휴식`;
    const range = document.createElement('p'); range.textContent = `${format(item.start)} — ${format(item.end)}`;
    const names = document.createElement('p'); names.className = 'dates-break-name'; names.textContent = item.names.join(' · ') || '주말 + 연차';
    const leave = document.createElement('div'); leave.className = 'dates-leave'; leave.textContent = item.leave.length ? `연차 ${item.leave.length}일 · ${item.leave.map(x => x.slice(5).replace('-','/')).join(', ')}` : '연차 사용 없이';
    const substitutes = document.createElement('p'); substitutes.className = 'dates-break-substitutes';
    substitutes.textContent = Object.entries(holidayDates).filter(([date,name]) => date >= item.start && date <= item.end && name.includes('대체공휴일')).map(([date,name]) => `${date.slice(5).replace('-','/')} ${name}`).join(' · ');
    card.append(number,title,range,names);
    if (substitutes.textContent) card.append(substitutes);
    card.append(leave); return card;
  }));
}
$('dday-form').addEventListener('submit',countdown);
$('anniversary-form').addEventListener('submit',milestone);
for (const id of ['holiday-year','leave-budget','future-only']) $(id).addEventListener('change',holidays);
countdown(); milestone(); holidays();
