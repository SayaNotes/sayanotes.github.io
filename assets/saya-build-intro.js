/* Saya's self-assembling welcome sequence: 18 cursors draw the interface. */
(()=> {
  const intro=document.querySelector('[data-saya-build-intro]');
  if(!intro)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let alreadySeen=false;
  try{alreadySeen=sessionStorage.getItem('saya-build-intro-seen')==='1'}catch(_){}
  if(alreadySeen||reduced){intro.remove();return}
  const canvas=intro.querySelector('canvas'),ctx=canvas&&canvas.getContext('2d');
  const progress=intro.querySelector('[data-build-progress]'),status=intro.querySelector('[data-build-status]');
  const code=intro.querySelector('.saya-build-code'),skip=intro.querySelector('[data-build-skip]');
  const palette=[...intro.querySelectorAll('[data-build-color]')];
  const lines=['const workspace = createSaya();','workspace.theme = "midnight";','layout.compose({ focus: true });','await canvas.reveal("ideas");','Saya.ready();'];
  const spans=[...code.querySelectorAll('span')];
  const paths=[
    [[.12,.18],[.88,.18],[.88,.82],[.12,.82],[.12,.18]],
    [[.12,.29],[.88,.29]],
    [[.25,.29],[.25,.82]],
    [[.31,.39],[.80,.39]],[[.31,.44],[.69,.44]],
    [[.31,.54],[.78,.54]],[[.31,.59],[.64,.59]],
    [[.31,.69],[.80,.69]],[[.31,.74],[.70,.74]],
    [[.16,.35],[.21,.35]],[[.16,.42],[.21,.42]],[[.16,.49],[.21,.49]],
    [[.16,.60],[.21,.60]],[[.16,.67],[.21,.67]],
    [[.31,.78],[.52,.78]],[[.58,.78],[.80,.78]],
    [[.36,.23],[.41,.23]],[[.45,.23],[.50,.23]]
  ];
  const pointers=paths.map((path,i)=>({path,phase:Math.random()*6.28,speed:.88+Math.random()*.24}));
  let w=0,h=0,dpr=1,raf=0,start=0,finished=false;
  const resize=()=>{if(!canvas||!ctx)return;dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
  const bounds=()=>({x:(w-Math.min(w*.72,760))/2,y:(h-Math.min(h*.56,470))/2,width:Math.min(w*.72,760),height:Math.min(h*.56,470)});
  const pointAt=(points,t)=>{const lengths=[];let total=0;for(let i=1;i<points.length;i++){const len=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(len);total+=len}let target=total*Math.max(0,Math.min(1,t));for(let i=0;i<lengths.length;i++){if(target<=lengths[i]){const f=lengths[i]?target/lengths[i]:0;return [points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f]}target-=lengths[i]}return points[points.length-1]};
  const cursor=(x,y,i,alpha)=>{ctx.save();ctx.translate(x,y);ctx.rotate(-.18);ctx.globalAlpha=alpha;ctx.fillStyle=i%3===0?'#f5f5ef':'#aaa';ctx.strokeStyle='#050505';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,15);ctx.lineTo(4,11);ctx.lineTo(8,19);ctx.lineTo(11,17);ctx.lineTo(7,10);ctx.lineTo(14,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()};
  const draw=now=>{
    raf=0;if(finished)return;
    const elapsed=now-start,p=Math.min(1,elapsed/7600),b=bounds();
    if(ctx){
      ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
      pointers.forEach((item,i)=>{
        const local=Math.max(0,Math.min(1,(p*1.42-i/paths.length*.72)*item.speed));
        const pts=item.path.map(([x,y])=>[b.x+x*b.width,b.y+y*b.height]);
        if(local>0){
          ctx.strokeStyle='rgba(230,230,224,.25)';ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
          const lengths=[];let total=0;for(let k=1;k<pts.length;k++){const d=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);lengths.push(d);total+=d}
          let remain=total*local;
          for(let k=0;k<lengths.length;k++){if(remain<=0)break;const f=Math.min(1,remain/lengths[k]);ctx.lineTo(pts[k-1][0]+(pts[k][0]-pts[k-1][0])*f,pts[k-1][1]+(pts[k][1]-pts[k-1][1])*f);remain-=lengths[k]}
          ctx.stroke();
          const [cx,cy]=pointAt(pts,local);cursor(cx,cy,i,.45+.45*Math.sin(elapsed*.004+i)*.25);
        }
      });
    }
    const pct=Math.round(p*100);if(progress)progress.style.width=pct+'%';
    if(status)status.textContent=p<.22?'Preparing the canvas':p<.5?'Building the workspace':p<.72?'Choosing the atmosphere':'Bringing Saya to life';
    spans.forEach((span,i)=>{const startAt=.16+i*.105;const amount=Math.max(0,Math.min(1,(p-startAt)*7));span.textContent=lines[i].slice(0,Math.floor(lines[i].length*amount))});
    if(p>.12)code.classList.add('is-visible');
    if(p>.48)palette.forEach((chip,i)=>{chip.classList.toggle('is-selected',i===2);chip.style.opacity='1'});
    if(p>.55)intro.classList.add('is-building');
    if(p>=1){complete();return}
    raf=requestAnimationFrame(draw);
  };
  const complete=()=>{if(finished)return;finished=true;intro.classList.add('is-complete');if(status)status.textContent='Welcome to Saya';setTimeout(close,900)};
  const close=()=>{if(!intro.isConnected)return;intro.classList.add('is-leaving');try{sessionStorage.setItem('saya-build-intro-seen','1')}catch(_){}setTimeout(()=>intro.remove(),950)};
  const stop=()=>{if(raf)cancelAnimationFrame(raf);complete()};
  if(skip)skip.addEventListener('click',stop);
  window.addEventListener('resize',resize,{passive:true});
  resize();start=performance.now();raf=requestAnimationFrame(draw);
  window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf)},{once:true});
})();