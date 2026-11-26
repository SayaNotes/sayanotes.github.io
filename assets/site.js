(()=>{const toggle=document.querySelector('.menu-toggle'),links=document.querySelector('.nav-links');if(toggle&&links){toggle.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))}})();

/* Accessible, lightweight feature switcher for the homepage */
(()=>{const tabs=[...document.querySelectorAll('[data-saya-tab]')];const panels=[...document.querySelectorAll('[data-saya-panel]')];if(!tabs.length||!panels.length)return;const activate=(name,focus=false)=>{tabs.forEach((tab)=>{const active=tab.dataset.sayaTab===name;tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus()});panels.forEach((panel)=>{const active=panel.dataset.sayaPanel===name;panel.hidden=!active;panel.classList.toggle('is-active',active)})};tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab.dataset.sayaTab));tab.addEventListener('keydown',(event)=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();activate(tabs[next].dataset.sayaTab,true)})});activate(tabs[0].dataset.sayaTab)})();

/* Scroll-linked unfolding: progress follows the scroll position in both directions. */
(()=>{
  const sectionSelector=[
    '.nw-intro','.nw-features','.nw-showcase','.nw-quote','.nw-download',
    '.inner-hero','.feature-story','.workspace-band','.inner-end',
    '.story-hero','.story-manifesto','.story-values','.story-origin','.story-last'
  ].join(',');
  const detailSelector=[
    '.nw-feature','.values-grid article','.workspace-stack > .workspace-card',
    '.detail-grid > .detail-card','.feature-points > li'
  ].join(',');
  const targets=[...new Set(document.querySelectorAll(sectionSelector+','+detailSelector))];
  if(!targets.length)return;
  targets.forEach(node=>node.classList.add('fold-reveal'));
  const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion){targets.forEach(node=>node.style.setProperty('--fold-progress','1'));return}
  let frame=0;
  const clamp=value=>Math.max(0,Math.min(1,value));
  const update=()=>{
    frame=0;
    const vh=window.innerHeight||800;
    targets.forEach(node=>{
      const top=node.getBoundingClientRect().top;
      const progress=clamp((vh*.9-top)/(vh*.62));
      const eased=progress*progress*(3-2*progress);
      node.style.setProperty('--fold-progress',eased.toFixed(4));
      node.style.setProperty('--fold-angle',((1-eased)*13).toFixed(3)+'deg');
      node.style.setProperty('--fold-y',((1-eased)*42).toFixed(2)+'px');
      node.style.setProperty('--fold-scale',(0.978+eased*.022).toFixed(4));
      node.style.setProperty('--fold-opacity',(0.18+eased*.82).toFixed(4));
    });
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  update();
})();