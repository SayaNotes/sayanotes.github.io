/* Saya's 18-cursor self-assembling welcome sequence. */
(()=> {
  const intro=document.querySelector('[data-saya-build-intro]');
  if(!intro)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let alreadySeen=false;
  try{alreadySeen=sessionStorage.getItem('saya-build-intro-seen')==='1'}catch(_){}
  if(alreadySeen||reduced){intro.remove();return}
  const canvas=intro.querySelector('canvas'),ctx=canvas&&canvas.getContext('2d');
  const progress=intro.querySelector('[data-build-progress]'),status=intro.querySelector('[data-build-status]'),code=intro.querySelector('.saya-build-code');
  const skip=intro.querySelector('[data-build-skip]');
  const lines=['const workspace = createSaya();','workspace.theme = "midnight";','layout.compose({ focus: true });','await canvas.reveal("ideas");','Saya.ready();'];
  code.innerHTML=lines.map(line=>'<span></span>').join('');
  const spans=[...code.querySelectorAll('span')];
  const pointers=Array.from({length:18},(_,i)=>({x:Math.random(),y:Math.random(),tx:.12+(i%6)*.15,ty:.2+Math.floor(i/6)*.3,phase:Math.random()*6.28,speed:.65+Math.random()*.5}));
  let w=0,h=0,dpr=1,raf=0,start=0,finished=false,frame=0;
  const resize=()=>{if(!canvas||!ctx)return;dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
  const pointer=(x,y,i,alpha)=>{ctx.save();ctx.translate(x,y);ctx.rotate(-.18+Math.sin(i)*.035);ctx.globalAlpha=alpha;ctx.fillStyle=i%3===0?'#f4f4ef':'#aaa';ctx.strokeStyle='#080808';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,16);ctx.lineTo(4.5,12);ctx.lineTo(8,20);ctx.lineTo(11,18.5);ctx.lineTo(7.5,10.5);ctx.lineTo(14,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()};
  const draw=now=>{raf=0;if(finished)return;const elapsed=now-start;const p=Math.min(1,elapsed/6200);frame++;
    if(ctx){ctx.clearRect(0,0,w,h);pointers.forEach((point,i)=>{const wave=Math.max(0,Math.min(1,(p-.04)*1.5));const drift=Math.sin(elapsed*.0011*point.speed+point.phase)*.018;const x=(point.x+(point.tx-point.x)*wave)*w+drift*w;const y=(point.y+(point.ty-point.y)*wave)*h+Math.cos(elapsed*.001+point.phase)*9;point.x+=(point.tx-point.x)*.012;point.y+=(point.ty-point.y)*.012;pointer(x,y,i,.35+.5*Math.sin(elapsed*.003+i)*.5)});if(p>.66){ctx.globalAlpha=(p-.66)*2.5;ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;const rw=Math.min(w*.68,720),rh=Math.min(h*.48,410),x=(w-rw)/2,y=(h-rh)/2;ctx.strokeRect(x,y,rw,rh);ctx.globalAlpha=1}}
    const pct=Math.round(p*100);if(progress)progress.style.width=pct+'%';if(status)status.textContent=p<.22?'Preparing the canvas':p<.48?'Composing the workspace':p<.76?'Refining the details':'Saya is ready';
    if(p>.12)code.classList.add('is-visible');spans.forEach((span,i)=>{const threshold=.18+i*.105;span.textContent=p>threshold?lines[i].slice(0,Math.max(0,Math.min(lines[i].length,Math.floor((p-threshold)*lines[i].length*8)))):''});
    if(p>.18)intro.classList.add('is-building');
    if(p>=1){complete();return}raf=requestAnimationFrame(draw)};
  const complete=()=>{if(finished)return;finished=true;intro.classList.add('is-complete');if(status)status.textContent='Welcome to Saya';setTimeout(close,850)};
  const close=()=>{if(!intro.isConnected)return;intro.classList.add('is-leaving');try{sessionStorage.setItem('saya-build-intro-seen','1')}catch(_){}setTimeout(()=>intro.remove(),950)};
  const stop=()=>{if(raf)cancelAnimationFrame(raf);complete()};
  skip&&skip.addEventListener('click',stop);
  intro.addEventListener('click',event=>{if(event.target===intro)stop()});
  window.addEventListener('resize',resize,{passive:true});
  resize();start=performance.now();raf=requestAnimationFrame(draw);
  window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf)},{once:true});
})();