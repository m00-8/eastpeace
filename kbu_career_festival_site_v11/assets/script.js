const btn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.mobile-nav');
if (btn && nav) {
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open');
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
}

// D-day badge
document.querySelectorAll('[data-dday]').forEach(el => {
  const target = new Date(el.dataset.dday + 'T00:00:00+09:00');
  const now = new Date();
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  today.setHours(0, 0, 0, 0);
  const t = new Date(target.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const diff = Math.round((t - today) / 86400000);
  const num = el.querySelector('.dday-num');
  const label = el.querySelector('span');
  if (diff > 0) { num.textContent = 'D-' + diff; }
  else if (diff === 0) { num.textContent = 'D-DAY'; label.textContent = '오늘 개최!'; }
  else { num.textContent = '종료'; label.textContent = '행사가'; el.classList.add('ended'); }
});
