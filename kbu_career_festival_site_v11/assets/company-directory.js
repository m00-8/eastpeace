(() => {
  const search=document.getElementById('company-search');
  const cards=Array.from(document.querySelectorAll('[data-group][data-name]'));
  const buttons=Array.from(document.querySelectorAll('.filter-button'));
  const count=document.getElementById('company-count');
  const empty=document.querySelector('.no-results');
  if(!search||!count||!empty)return;
  let activeGroup='all';
  const normalize=t=>(t||'').toLocaleLowerCase('ko-KR').replace(/\s+/g,'');
  const update=()=>{const q=normalize(search.value);let visible=0;cards.forEach(card=>{const groupOk=activeGroup==='all'||card.dataset.group===activeGroup;const hay=card.dataset.search||card.dataset.name||'';const searchOk=normalize(hay).includes(q);card.hidden=!(groupOk&&searchOk);if(!card.hidden)visible++;});count.textContent=String(visible);empty.hidden=visible>0;};
  buttons.forEach(btn=>btn.addEventListener('click',()=>{activeGroup=btn.dataset.filter;buttons.forEach(b=>{const s=b===btn;b.classList.toggle('selected',s);b.setAttribute('aria-pressed',String(s));});update();}));
  search.addEventListener('input',update);
})();
