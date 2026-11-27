(()=> {
 const root=document.documentElement;
 const items=[...document.querySelectorAll('[data-build]')].sort((a,b)=>a.dataset.build.localeCompare(b.dataset.build));
 const layer=document.querySelector('.cursor-layer'),hud=document.querySelector('.assembly-hud'),consoleBox=document.querySelector('.builder-console');
 const codeLines=[...(hud?.querySelectorAll('.code-line')||[])],swatches=[...(hud?.querySelectorAll('[data-swatch]')||[])];
 const player=document.querySelector('.assembly-player');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!items.length||!layer)return;
 const labels=['LAYOUT','TYPE','MOTION','GRID','DETAIL','FINISH'];
 const taskNames=['DRAWING THE FRAME','SETTING THE TYPE','BUILDING THE HERO','PLACING THE DETAILS','CONNECTING THE SECTIONS','POLISHING THE FINISH'];
 const cursors=Array.from({length:18},(_,i)=>{
  const el=document.createElement('div');el.className='build-cursor';
  const fill=i%3===0?'#f4f4ee':i%3===1?'#c7c7bf':'#9c9c94';
  el.innerHTML='<svg viewBox="0 0 18 23" aria-hidden="true"><path d="M1 1L2 19L6.5 14.5L10 22L13 20.5L9.5 13L16 12Z" fill="'+fill+'" stroke="#080808" stroke-width="1.1" stroke-linejoin="round"/></svg><span class="cursor-tag">'+labels[i%labels.length]+'</span>';
  layer.appendChild(el);return {el,i,phase:i/18,x:innerWidth/2,y:innerHeight/2,vx:0,vy:0,tx:innerWidth/2,ty:innerHeight/2};
 });
 const speedSteps=[.65,1,1.35,1.8],speedLabels=['0.65×','1×','1.35×','1.8×'];
 let speedIndex=1,speed=1,playing=true,completed=false,stage='code',codeTimer=null,dismissTimer=null,raf=0,lastFrame=0,elapsed=0,lastIndex=-1,runId=0;
 const codeOriginal=codeLines.map(el=>el.innerHTML),codeText=codeLines.map(el=>el.textContent);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const setStatus=(s)=>{const el=player?.querySelector('[data-player="status"]');if(el)el.textContent=s};
 const setProgress=p=>{
  const pct=Math.round(clamp(p,0,1)*100),track=player?.querySelector('.player-track');
  if(track){track.firstElementChild.style.width=pct+'%';track.setAttribute('aria-valuenow',String(pct))}
  const out=player?.querySelector('[data-player="time"]');if(out){const sec=Math.floor(elapsed/1000);out.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}
  const cp=consoleBox?.querySelector('.console-progress');if(cp)cp.textContent=String(pct).padStart(2,'0')+'%';
 };
 const syncControls=()=>{
  const main=player?.querySelector('[data-player="toggle"]');if(main){main.textContent=playing?'Ⅱ':'▶';main.setAttribute('aria-label',playing?'Pause construction':'Play construction')}
  const sp=player?.querySelector('[data-player="speed"]');if(sp)sp.textContent=speedLabels[speedIndex];
 };
 const showBuild=(index,within,now,delta=16)=>{
  if(index!==lastIndex){if(lastIndex>=0)items[lastIndex].classList.add('built');lastIndex=index;items[index].classList.add('building-now')}
  const target=items[index],r=target.getBoundingClientRect();
  const rect={left:clamp(r.left,0,innerWidth-20),top:clamp(r.top,0,innerHeight-20),width:Math.max(20,Math.min(r.width,innerWidth)),height:Math.max(20,Math.min(r.height,innerHeight))};
  cursors.forEach(c=>{
   const phase=(within+c.phase*.19)%1,w=Math.max(26,rect.width),h=Math.max(26,rect.height);
   const cx=rect.left+w*(.18+((c.i*7)%13)/16),cy=rect.top+h*(.18+((c.i*11)%13)/16);
   const angle=phase*Math.PI*2+(c.i%6)*.42+Math.sin(now*.0007+c.i*1.7)*.16,rx=Math.max(12,Math.min(w*.43,95)),ry=Math.max(12,Math.min(h*.43,72));
   const driftX=Math.sin(now*.00115+c.i*2.1)*Math.min(13,w*.035),driftY=Math.cos(now*.00092+c.i*1.37)*Math.min(11,h*.035);
   c.tx=clamp(cx+Math.cos(angle)*rx+driftX,4,innerWidth-20);c.ty=clamp(cy+Math.sin(angle)*ry+driftY,4,innerHeight-26);
   const dt=Math.min(.04,delta/1000),spring=34,damping=10;
   c.vx+=(c.tx-c.x)*spring*dt;c.vy+=(c.ty-c.y)*spring*dt;
   const drag=Math.exp(-damping*dt);c.vx*=drag;c.vy*=drag;c.x+=c.vx*dt;c.y+=c.vy*dt;
   c.el.style.transform='translate3d('+c.x.toFixed(2)+'px,'+c.y.toFixed(2)+'px,0)';c.el.style.opacity=String(.58+.42*(.5+.5*Math.sin(now*.003+c.i)));c.el.classList.toggle('clicking',phase>.91);
  });
  const task=consoleBox?.querySelector('.console-task');if(task)task.textContent=taskNames[index%taskNames.length];
  setStatus(taskNames[index%taskNames.length].toLowerCase());setProgress((index+within)/items.length);
  if(within>.86)target.classList.add('built');
 };
 const finish=()=>{
  completed=true;playing=false;stage='done';items.forEach(el=>{el.classList.remove('building-now');el.classList.add('built')});
  root.classList.remove('is-building');cursors.forEach(c=>c.el.remove());hud?.classList.add('assembled');consoleBox?.classList.add('done');
  if(raf)cancelAnimationFrame(raf);clearTimeout(codeTimer);setProgress(1);setStatus('Experience assembled');syncControls();player?.classList.add('is-complete');clearTimeout(dismissTimer);dismissTimer=setTimeout(()=>player?.classList.add('is-dismissed'),950);
 };
 const frame=now=>{
  if(!playing||stage!=='build')return;
  if(!lastFrame)lastFrame=now;
  const delta=Math.min(48,now-lastFrame);lastFrame=now;elapsed+=delta*speed;
  const total=items.length*720,index=Math.min(items.length-1,Math.floor(elapsed/720)),within=Math.min(1,(elapsed-index*720)/720);
  showBuild(index,ease(within),now,delta);
  if(elapsed>=total){finish();return}
  raf=requestAnimationFrame(frame);
 };
 const startBuild=()=>{
  stage='build';playing=true;lastFrame=0;lastIndex=-1;items.forEach(el=>el.classList.remove('built','building-now'));
  root.classList.add('is-building');hud?.classList.remove('assembled');consoleBox?.classList.remove('done');player?.classList.remove('is-complete');
  cursors.forEach(c=>{if(!c.el.isConnected)layer.appendChild(c.el)});
  setStatus('assembling the page');syncControls();raf=requestAnimationFrame(frame);
 };
 const typeCode=(id)=>{
  stage='code';playing=true;let line=0,pos=0;codeLines.forEach(el=>{el.textContent='';el.classList.remove('active')});
  const tick=()=>{
   if(id!==runId||!playing)return;
   if(line>=codeLines.length){let sw=0;const choose=()=>{if(id!==runId||!playing)return;swatches.forEach((el,i)=>el.classList.toggle('selected',i===sw));if(sw<swatches.length-1){sw++;codeTimer=setTimeout(choose,220)}else{codeTimer=setTimeout(startBuild,300)}};choose();return}
   const el=codeLines[line],value=codeText[line];el.classList.add('active');el.textContent=value.slice(0,++pos);
   if(pos<value.length)codeTimer=setTimeout(tick,Math.max(5,17/speed));
   else{el.innerHTML=codeOriginal[line];line++;pos=0;codeTimer=setTimeout(tick,Math.max(50,180/speed))}
  };
  codeTimer=setTimeout(tick,250);
 };
 const replay=()=>{clearTimeout(dismissTimer);player?.classList.remove('is-dismissed');runId++;clearTimeout(codeTimer);if(raf)cancelAnimationFrame(raf);elapsed=0;completed=false;playing=true;stage='code';lastIndex=-1;codeLines.forEach((el,i)=>{el.innerHTML=codeOriginal[i];el.classList.remove('active')});swatches.forEach(el=>el.classList.remove('selected'));items.forEach(el=>el.classList.remove('built','building-now'));root.classList.add('is-building');hud?.classList.remove('assembled');consoleBox?.classList.remove('done');cursors.forEach(c=>{if(!c.el.isConnected)layer.appendChild(c.el)});setProgress(0);syncControls();const id=runId;typeCode(id)};
 const toggle=()=>{
  if(completed){replay();return}
  playing=!playing;syncControls();
  if(!playing){clearTimeout(codeTimer);if(raf)cancelAnimationFrame(raf);setStatus('paused')}
  else if(stage==='code'){const id=runId;typeCode(id)}
  else if(stage==='build'){lastFrame=0;raf=requestAnimationFrame(frame)}
 };
 player?.querySelector('[data-player="toggle"]')?.addEventListener('click',toggle);
 player?.querySelector('[data-player="replay"]')?.addEventListener('click',replay);
 player?.querySelector('[data-player="speed"]')?.addEventListener('click',()=>{speedIndex=(speedIndex+1)%speedSteps.length;speed=speedSteps[speedIndex];syncControls()});
 player?.querySelector('[data-player="mode"]')?.addEventListener('click',e=>{const btn=e.currentTarget;const active=btn.classList.toggle('active');btn.textContent=active?'AUTO ON':'AUTO';if(active&&completed)replay()});
 if(reduced){items.forEach(el=>el.classList.add('built'));hud?.classList.add('assembled');player?.classList.add('is-complete');player?.classList.add('reduced-ready');player?.classList.add('is-dismissed');setStatus('Experience ready');setProgress(1);playing=false;completed=true;syncControls();cursors.forEach(c=>c.el.remove());return}
 replay();
 window.addEventListener('keydown',e=>{const tag=e.target?.tagName?.toLowerCase();if(tag==='input'||tag==='textarea'||e.target?.isContentEditable)return;if(e.code==='Space'){e.preventDefault();toggle()}else if(e.key.toLowerCase()==='r'){e.preventDefault();replay()}},{passive:false});
 window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);clearTimeout(codeTimer)},{once:true});
})();