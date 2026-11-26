(()=>{const toggle=document.querySelector('.menu-toggle'),links=document.querySelector('.nav-links');if(toggle&&links){toggle.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))}})();

/* Accessible, lightweight feature switcher for the homepage */
(()=>{const tabs=[...document.querySelectorAll('[data-saya-tab]')];const panels=[...document.querySelectorAll('[data-saya-panel]')];if(!tabs.length||!panels.length)return;const activate=(name,focus=false)=>{tabs.forEach((tab)=>{const active=tab.dataset.sayaTab===name;tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus()});panels.forEach((panel)=>{const active=panel.dataset.sayaPanel===name;panel.hidden=!active;panel.classList.toggle('is-active',active)})};tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab.dataset.sayaTab));tab.addEventListener('keydown',(event)=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();activate(tabs[next].dataset.sayaTab,true)})});activate(tabs[0].dataset.sayaTab)})();

/* Scroll choreography: sections unfold into view, with small elements following in a soft stagger. */
(()=> {
  const sections=[...document.querySelectorAll('main > *:not(.feature-jump):not(.nw-hero):not(.cinema-hero)')];
  const items=[...document.querySelectorAll('.nw-feature,.values-grid article,.workspace-stack > .workspace-card,.detail-grid > .detail-card,.feature-points > li')];
  sections.forEach(node=>node.classList.add('fold-reveal'));
  items.forEach((node,index)=>{node.classList.add('fold-item');node.style.setProperty('--fold-delay',`${Math.min(index%4,3)*75}ms`)});
  const nodes=[...document.querySelectorAll('.reveal,.fold-reveal,.fold-item')];
  if(!nodes.length)return;
  if(!('IntersectionObserver' in window)){nodes.forEach(node=>node.classList.add('is-visible'));return}
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');obs.unobserve(entry.target)}
    });
  },{rootMargin:'0px 0px -7% 0px',threshold:0.06});
  nodes.forEach(node=>observer.observe(node));
})();
