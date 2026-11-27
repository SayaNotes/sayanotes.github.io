(()=> {
 const root=document.documentElement;
 const items=[...document.querySelectorAll('[data-build]')].sort((a,b)=>a.dataset.build.localeCompare(b.dataset.build));
 const layer=document.querySelector('.cursor-layer');
 const hud=document.querySelector('.assembly-hud');
 const consoleBox=document.querySelector('.builder-console');
 const codeLines=[...(hud?.querySelectorAll('.code-line')||[])];
 const swatches=[...(hud?.querySelectorAll('[data-swatch]')||[])];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!items.length||!layer){items.forEach(el=>el.classList.add('built'));return}
 root.classList.add('is-building');
 const labels=['LAYOUT','TYPE','MOTION','GRID','DETAIL','FINISH'];
 const cursors=Array.from({length:18},(_,i)=>{
   const el=document.createElement('div');el.className='build-cursor';
   const fill=i%3===0?'#f4f4ee':i%3===1?'#c7c7bf':'#9c9c94';
   el.innerHTML='<svg viewBox="0 0 18 23" aria-hidden="true"><path d="M1 1L2 19L6.5 14.5L10 22L13 20.5L9.5 13L16 12Z" fill="'+fill+'" stroke="#080808" stroke-width="1.1" stroke-linejoin="round"/></svg><span class="cursor-tag">'+labels[i%labels.length]+'</span>';
   layer.appendChild(el);return {el,i,phase:i/18};
 });
 const taskNames=['DRAWING THE FRAME','SETTING THE TYPE','BUILDING THE HERO','PLACING THE DETAILS','CONNECTING THE SECTIONS','POLISHING THE FINISH'];
 let raf=0,done=false,start=0,buildStart=0,lastIndex=-1;
 const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const move=(cursor,rect,t,now)=>{
   const i=cursor.i,phase=(t+cursor.phase*.19)%1;
   const w=Math.max(26,rect.width),h=Math.max(26,rect.height);
   const cx=rect.left+w*(.18+((i*7)%13)/16),cy=rect.top+h*(.18+((i*11)%13)/16);
   const angle=phase*Math.PI*2+(i%6)*.42;
   const rx=Math.max(12,Math.min(w*.43,95)),ry=Math.max(12,Math.min(h*.43,72));
   const x=clamp(cx+Math.cos(angle)*rx,4,innerWidth-20);
   const y=clamp(cy+Math.sin(angle)*ry,4,innerHeight-26);
   cursor.el.style.transform='translate3d('+x+'px,'+y+'px,0)';
   cursor.el.style.opacity=String(.48+.5*(.5+.5*Math.sin(now*.007+i)));
   cursor.el.classList.toggle('clicking',phase>.91);
 };
 const setTask=(index,within)=>{
   if(consoleBox){
     consoleBox.querySelector('.console-task').textContent=taskNames[index%taskNames.length];
     consoleBox.querySelector('.console-progress').textContent=String(Math.min(99,Math.round((index+within)/items.length*100))).padStart(2,'0')+'%';
   }
 };
 const finish=()=>{
   if(done)return;done=true;
   items.forEach(el=>el.classList.add('built'));
   root.classList.remove('is-building');
   cursors.forEach(c=>c.el.remove());
   hud?.classList.add('assembled');
   consoleBox?.classList.add('done');
   if(raf)cancelAnimationFrame(raf);
 };
 const animateBuild=now=>{
   if(done)return;
   const elapsed=now-buildStart,step=560;
   const index=Math.min(items.length-1,Math.floor(elapsed/step));
   const within=Math.min(1,(elapsed-index*step)/step);
   if(index!==lastIndex){
     if(lastIndex>=0)items[lastIndex].classList.add('built');
     lastIndex=index;
     items[index].classList.add('building-now');
   }
   const target=items[index],r=target.getBoundingClientRect();
   const rect={left:clamp(r.left,0,innerWidth-20),top:clamp(r.top,0,innerHeight-20),width:Math.max(20,Math.min(r.width,innerWidth)),height:Math.max(20,Math.min(r.height,innerHeight))};
   cursors.forEach(c=>move(c,rect,ease(within),now));
   setTask(index,within);
   if(within>.82)target.classList.add('built');
   if(index===items.length-1&&within>=.995){finish();return}
   raf=requestAnimationFrame(animateBuild);
 };
 const runCode=()=>{
   const original=codeLines.map(el=>el.innerHTML);
   const source=codeLines.map(el=>el.textContent);
   codeLines.forEach(el=>{el.textContent='';el.classList.remove('active')});
   let line=0,pos=0;
   const typeChar=()=>{
     if(done)return;
     if(line>=codeLines.length){
       let swatch=0;
       const choose=()=>{
         if(done)return;
         swatches.forEach((el,i)=>el.classList.toggle('selected',i===swatch));
         if(swatch<swatches.length-1){swatch++;setTimeout(choose,260);return}
         buildStart=performance.now();raf=requestAnimationFrame(animateBuild);
       };
       setTimeout(choose,260);return;
     }
     const el=codeLines[line],value=source[line];
     el.classList.add('active');
     el.textContent=value.slice(0,++pos);
     if(pos<value.length){setTimeout(typeChar,17);return}
     el.innerHTML=original[line];
     line++;pos=0;
     setTimeout(typeChar,180);
   };
   setTimeout(typeChar,350);
 };
 const skip=()=>finish();
 window.addEventListener('pointerdown',skip,{once:true,passive:true});
 window.addEventListener('keydown',skip,{once:true});
 window.addEventListener('pagehide',()=>raf&&cancelAnimationFrame(raf),{once:true});
 start=performance.now();runCode();
})();