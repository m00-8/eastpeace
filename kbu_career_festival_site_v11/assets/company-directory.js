(() => {
  const search = document.getElementById('company-search');
  const cards = Array.from(document.querySelectorAll('.participant-cell'));
  const buttons = Array.from(document.querySelectorAll('.filter-button'));
  const count = document.getElementById('company-count');
  const empty = document.querySelector('.no-results');
  if (!search || !count || !empty) return;
  let activeGroup = 'all';
  const normalize = (text) => text.toLocaleLowerCase('ko-KR').replace(/\s+/g, '');
  const update = () => {
    const query = normalize(search.value);
    let visible = 0;
    cards.forEach(card => {
      const groupMatches = activeGroup === 'all' || card.dataset.group === activeGroup;
      const nameMatches = normalize(card.dataset.name || '').includes(query);
      card.hidden = !(groupMatches && nameMatches);
      if (!card.hidden) visible += 1;
    });
    count.textContent = String(visible);
    empty.hidden = visible > 0;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    activeGroup = button.dataset.filter;
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    update();
  }));
  search.addEventListener('input', update);
})();
