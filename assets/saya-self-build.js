/* Build the real Saya homepage in place — no intro overlay or duplicate mock page. */
(()=> {
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){return}
  const header=document.querySelector('.site-header');
  const main=document.querySelector('.nw-site');
  const footer=document.querySelector('.site-footer');
  if(!header||!main||!footer)return;

  const groups=[
    {selector:'.site-header',label:'NAVIGATION'},
    {selector:'.nw-hero .nw-eyebrow',label:'IDENTITY'},
    {selector:'.nw-hero h1',label:'WELCOME'},
    {selector:'.nw-hero .nw-lead',label:'INTRODUCING SAYA'},
    {selector:'.nw-hero .nw-actions',label:'ACTIONS'},
    {selector:'.nw-hero .nw-proof',label:'DETAILS'},
    {selector:'.nw-product-wrap',label:'WORKSPACE'},
    {selector:'.nw-hero-bottom',label:'SIGNATURE'},
    {selector:'.nw-intro',label:'THE IDEA'},
    {selector:'.nw-features .nw-section-heading',label:'FEATURES'},
    {selector:'.nw-feature-writing',label:'WRITE'},
    {selector:'.nw-feature-drawing',label:'DRAW'},
    {selector:'.nw-feature-reading',label:'READ'},
    {selector:'.nw-showcase-heading',label:'EXPERIENCE'},
    {selector:'.nw-showcase-shell',label:'INTERACTIVE DETAILS'},
    {selector:'.nw-quote',label:'THE THOUGHT'},
    {selector:'.nw-download',label:'GET SAYA'},
    {selector:'.site-footer',label:'FINISH'}
  ];
  const targets=groups.map(g=>({el:document.querySelector(g.selector),label:g.label})).filter(x=>x.el);
  if(!targets.length)return;

  const canvas=document.createElement('canvas');
  canvas.className='saya-build-cursors';
  canvas.setAttribute('aria-hidden','true');
  const label=document.createElement('div');
  label.className='saya-build-cursor-label';
  label.setAttribute('aria-hidden','true');
  document.body.append(canvas,label);
  const ctx=canvas.getContext('2d');
  if(!ctx){canvas.remove();label.remove();return}

  const cursors=Array.from({length:18},(_,i)=>({i,phase:i/18,offset:(i%6)-2.5}));
  let width=0,height=0,dpr=1,raf=0,start=0,finished=false;
  const resize=()=>{dpr=Math.min(window.devicePixelRatio||1,1.5);width=innerWidth;height=innerHeight;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const pointOn=(rect,t,i)=>{
    const inset=10+(i%4)*5,x=rect.left-inset,y=rect.top-inset,w=rect.width+inset*2,h=rect.height+inset*2;
    const perimeter=2*(w+h),d=((t*perimeter)+(i*17))%perimeter;
    if(d<w)return [x+d,y];
    if(d<w+h)return [x+w,y+d-w];
    if(d<2*w+h)return [x+w-(d-w-h),y+h];
    return [x,y+h-(d-2*w-h)];
  };
  const drawCursor=(x,y,i,alpha)=>{
    ctx.save();ctx.translate(x,y);ctx.rotate(-.18+(i%3)*.08);ctx.globalAlpha=alpha;
    ctx.fillStyle=i%4===0?'#f4f4ee':'#bcbcb5';ctx.strokeStyle='#080808';ctx.lineWidth=1.1;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1,17);ctx.lineTo(5,12);ctx.lineTo(10,21);ctx.lineTo(13,19);ctx.lineTo(8,10);ctx.lineTo(16,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  };
  const reveal=target=>{target.el.classList.add('saya-build-part');requestAnimationFrame(()=>target.el.classList.add('saya-built'))};
  const finish=()=>{
    if(finished)return;finished=true;
    targets.forEach(t=>{t.el.classList.add('saya-built')});
    root.classList.remove('saya-assembling');
    canvas.remove();label.remove();
    if(raf)cancelAnimationFrame(raf);
  };

  // Add the build classes before the first paint, then reveal real elements in sequence.
  root.classList.add('saya-assembling');
  targets.forEach(t=>t.el.classList.add('saya-build-part'));
  // Also stage the contents of the hero rather than revealing it as a single flat block.
  const hero=main.querySelector('.nw-hero');
  if(hero)hero.classList.add('saya-built');
  resize();
  start=performance.now();

  const frame=now=>{
    if(finished)return;
    const elapsed=now-start;
    const total=targets.length;
    const stepDuration=510;
    const activeIndex=Math.min(total-1,Math.floor(elapsed/stepDuration));
    const within=Math.min(1,(elapsed-activeIndex*stepDuration)/stepDuration);
    const active=targets[activeIndex];
    if(active){
      active.el.classList.add('saya-built');
      const rect=active.el.getBoundingClientRect();
      const safeRect={left:Math.max(8,Math.min(width-8,rect.left)),top:Math.max(8,Math.min(height-8,rect.top)),width:Math.max(18,Math.min(width-rect.left,rect.width)),height:Math.max(18,Math.min(height-rect.top,rect.height))};
      ctx.clearRect(0,0,width,height);
      cursors.forEach(c=>{
        const t=(within*1.45+c.phase*.72)%1;
        const [x,y]=pointOn(safeRect,t,c.i);
        drawCursor(x,y,c.i,.35+.55*(.5+.5*Math.sin(now*.006+c.i)));
      });
      const [lx,ly]=pointOn(safeRect,(within*.9+.12)%1,0);
      label.style.left=Math.max(8,Math.min(width-130,lx+12))+'px';
      label.style.top=Math.max(8,Math.min(height-30,ly+10))+'px';
      label.textContent=active.label;
      label.classList.add('is-visible');
    }
    if(activeIndex>=total-1&&within>=.98){finish();return}
    raf=requestAnimationFrame(frame);
  };
  window.addEventListener('resize',resize,{passive:true});
  // If the visitor interacts or navigates before the build completes, reveal everything immediately.
  const revealNow=()=>finish();
  window.addEventListener('pointerdown',revealNow,{once:true,passive:true});
  window.addEventListener('keydown',revealNow,{once:true});
  window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf)},{once:true});
  raf=requestAnimationFrame(frame);
})();
