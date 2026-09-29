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

// ---------------------------------------------------------------
// v55: 모바일 하단 고정 참가신청 버튼 — 필요할 때만 표시
// (첫 화면 CTA, 하단 참가신청 영역, 푸터가 보이면 숨김)
// ---------------------------------------------------------------
(() => {
  const fab = document.querySelector('.mobile-apply');
  if (!fab || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.hero-info-cta, .apply-section, .site-footer');
  if (!targets.length) return;
  const visible = new Set();
  const update = () => fab.classList.toggle('is-hidden', visible.size > 0);
  fab.classList.add('is-hidden');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
    update();
  }, { threshold: 0 });
  targets.forEach((t) => io.observe(t));
})();

// ---------------------------------------------------------------
// v55: 이미지 확대 보기 (타임테이블 · 행사장 배치도)
// 두 손가락 확대/이동, 더블탭·더블클릭 확대, 휠 확대, 닫기(버튼·Esc·뒤로가기)
// ---------------------------------------------------------------
(() => {
  const links = document.querySelectorAll('a[data-zoom]');
  if (!links.length) return;

  const box = document.createElement('div');
  box.className = 'zoom-viewer';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '이미지 크게 보기');
  box.hidden = true;
  box.innerHTML =
    '<div class="zoom-stage"><img class="zoom-img" alt=""></div>' +
    '<div class="zoom-tools">' +
    '<button type="button" class="zoom-btn" data-act="out" aria-label="축소">−</button>' +
    '<button type="button" class="zoom-btn" data-act="reset" aria-label="원래 크기">1:1</button>' +
    '<button type="button" class="zoom-btn" data-act="in" aria-label="확대">+</button>' +
    '</div>' +
    '<button type="button" class="zoom-close" aria-label="닫기">×</button>' +
    '<p class="zoom-hint">두 손가락으로 확대하고 끌어서 움직일 수 있어요</p>';
  document.body.appendChild(box);

  const stage = box.querySelector('.zoom-stage');
  const img = box.querySelector('.zoom-img');
  const MIN = 1, MAX = 5;
  let s = 1, x = 0, y = 0, lastFocus = null, pushed = false;
  const pts = new Map();
  let pinchStart = null, panStart = null, lastTap = 0;

  const clamp = () => {
    s = Math.min(MAX, Math.max(MIN, s));
    const r = stage.getBoundingClientRect();
    const w = img.offsetWidth * s, h = img.offsetHeight * s;
    const mx = Math.max(0, (w - r.width) / 2), my = Math.max(0, (h - r.height) / 2);
    x = Math.min(mx, Math.max(-mx, x));
    y = Math.min(my, Math.max(-my, y));
  };
  const apply = () => { clamp(); img.style.transform = `translate(${x}px, ${y}px) scale(${s})`; box.classList.toggle('is-zoomed', s > 1.01); };
  const zoomAt = (ns, cx, cy) => {
    const r = stage.getBoundingClientRect();
    const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
    const k = Math.min(MAX, Math.max(MIN, ns)) / s;
    x = px - (px - x) * k; y = py - (py - y) * k; s *= k; apply();
  };
  const center = () => { const r = stage.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  const open = (href, alt) => {
    lastFocus = document.activeElement;
    img.src = href; img.alt = alt || '';
    s = 1; x = 0; y = 0; apply();
    box.hidden = false;
    document.documentElement.classList.add('zoom-open');
    box.querySelector('.zoom-close').focus();
    try { history.pushState({ zoom: true }, ''); pushed = true; } catch (e) { pushed = false; }
  };
  const close = (fromPop) => {
    if (box.hidden) return;
    box.hidden = true;
    document.documentElement.classList.remove('zoom-open');
    img.removeAttribute('src');
    if (pushed && !fromPop) { pushed = false; history.back(); }
    pushed = false;
    if (lastFocus) lastFocus.focus();
  };

  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const i = a.querySelector('img');
    open(a.getAttribute('href'), i ? i.alt : '');
  }));
  box.querySelector('.zoom-close').addEventListener('click', () => close(false));
  window.addEventListener('popstate', () => close(true));
  document.addEventListener('keydown', (e) => { if (!box.hidden && e.key === 'Escape') close(false); });
  box.querySelector('.zoom-tools').addEventListener('click', (e) => {
    const act = e.target.closest('button')?.dataset.act; if (!act) return;
    const [cx, cy] = center();
    if (act === 'in') zoomAt(s * 1.6, cx, cy);
    if (act === 'out') zoomAt(s / 1.6, cx, cy);
    if (act === 'reset') { s = 1; x = 0; y = 0; apply(); }
  });
  stage.addEventListener('click', (e) => { if (e.target === stage && s <= 1.01) close(false); });
  stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY); }, { passive: false });
  stage.addEventListener('dblclick', (e) => { e.preventDefault(); s > 1.01 ? (s = 1, x = 0, y = 0, apply()) : zoomAt(2.5, e.clientX, e.clientY); });

  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), s, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
      panStart = null;
    } else if (pts.size === 1) {
      panStart = { px: e.clientX, py: e.clientY, x, y };
      if (e.pointerType === 'touch') {
        const now = Date.now();
        if (now - lastTap < 300) { s > 1.01 ? (s = 1, x = 0, y = 0, apply()) : zoomAt(2.5, e.clientX, e.clientY); lastTap = 0; }
        else lastTap = now;
      }
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && pinchStart) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(pinchStart.s * d / pinchStart.d, pinchStart.cx, pinchStart.cy);
    } else if (pts.size === 1 && panStart && s > 1.01) {
      x = panStart.x + (e.clientX - panStart.px);
      y = panStart.y + (e.clientY - panStart.py);
      apply();
    }
  });
  const end = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinchStart = null;
    if (pts.size === 1) { const p = [...pts.values()][0]; panStart = { px: p.x, py: p.y, x, y }; }
    if (pts.size === 0) panStart = null;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => { if (!box.hidden) apply(); });
})();
