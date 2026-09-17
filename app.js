/* colinyap.com — shared page behaviour
   Loaded by every page. Each block checks for its own markup first, so a
   page that has no viewer or no shell simply skips that part. */

/* ---------- boot log (home page only) ---------- */
(function(){
  const lines=[...document.querySelectorAll('#boot div')];
  if(!lines.length) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    lines.forEach(l=>l.style.opacity=1); return;
  }
  lines.forEach((l,i)=>l.style.animationDelay=(i*130)+'ms');
})();

/* ---------- window manager ---------- */
(function(){
  const bar=document.getElementById('taskbar');
  const wins=[...document.querySelectorAll('.win')];
  if(!bar||!wins.length) return;

  wins.forEach(w=>{
    const top=w.querySelector('.win-bar');
    if(!top) return;
    const name=(w.querySelector('.win-title')||{}).textContent||'window';
    w.dataset.wname=name;

    const ctl=document.createElement('span');
    ctl.className='win-ctl';
    ctl.innerHTML=
      '<button type="button" data-a="min" title="minimise" aria-label="minimise '+name+'">&minus;</button>'+
      '<button type="button" data-a="max" title="maximise" aria-label="maximise '+name+'">&#9723;</button>'+
      '<button type="button" data-a="close" class="x" title="close" aria-label="close '+name+'">&times;</button>';
    top.appendChild(ctl);

    ctl.addEventListener('click',e=>{
      const b=e.target.closest('button'); if(!b) return;
      e.stopPropagation(); act(w,b.dataset.a);
    });
    top.addEventListener('dblclick',e=>{ if(!e.target.closest('.win-ctl')) act(w,'min'); });
    top.addEventListener('click',e=>{
      if(e.target.closest('.win-ctl')) return;
      if(w.classList.contains('min')) act(w,'min');
    });
  });

  function act(w,a){
    if(a==='min'){ w.classList.remove('max'); document.body.classList.remove('has-max');
      w.classList.toggle('min'); }
    if(a==='max'){ w.classList.remove('min');
      const on=w.classList.toggle('max');
      document.body.classList.toggle('has-max',on);
      if(!on) w.scrollIntoView({block:'center'}); }
    if(a==='close'){ w.classList.remove('max','min');
      document.body.classList.remove('has-max'); w.classList.add('closed'); }
    render();
  }
  function restore(w){ w.classList.remove('closed','min'); render(); }

  function render(){
    const hidden=wins.filter(w=>w.classList.contains('closed')||w.classList.contains('min'));
    bar.innerHTML='';
    if(!hidden.length){ bar.classList.remove('show'); return; }
    const lbl=document.createElement('span');
    lbl.className='lbl';
    lbl.textContent=hidden.length+(hidden.length===1?' window hidden:':' windows hidden:');
    bar.appendChild(lbl);
    hidden.forEach(w=>{
      const b=document.createElement('button');
      b.type='button'; b.textContent=w.dataset.wname;
      b.addEventListener('click',()=>restore(w)); bar.appendChild(b);
    });
    const all=document.createElement('button');
    all.type='button'; all.className='all'; all.textContent='restore all';
    all.addEventListener('click',()=>{hidden.forEach(w=>w.classList.remove('closed','min'));render();});
    bar.appendChild(all); bar.classList.add('show');
  }

  addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      const m=document.querySelector('.win.max');
      if(m){m.classList.remove('max');document.body.classList.remove('has-max');}
    }
  });

  /* ---- coach mark, replayable from the ? button ---- */
  const KEY='colinyap.wm.coach.v3';
  let tip=null;
  const seen=()=>{ try{ return localStorage.getItem(KEY)==='1'; }catch(e){ return false; } };
  function dismiss(){
    try{ localStorage.setItem(KEY,'1'); }catch(e){}
    document.querySelectorAll('.win-ctl.hi').forEach(c=>c.classList.remove('hi'));
    document.removeEventListener('keydown',onKey,true);
    if(tip){ const t=tip; tip=null; t.classList.add('out'); setTimeout(()=>t.remove(),320); }
  }
  function onKey(e){ if(e.key==='Escape') dismiss(); }
  function showCoach(force){
    if(tip) return;
    if(!force&&seen()) return;
    if(force){ try{ localStorage.removeItem(KEY); }catch(e){} }
    const host=wins.find(w=>!w.classList.contains('min')&&!w.classList.contains('closed'));
    if(!host) return;
    const ctl=host.querySelector('.win-ctl'); if(!ctl) return;
    tip=document.createElement('div');
    tip.className='coach'; tip.setAttribute('role','note');
    tip.innerHTML='<b>Optional: these are windows</b>'+
      '<p>Each panel can be minimised, maximised or closed, and hidden ones come back '+
      'from the bar at the bottom. Press <b style="display:inline">1</b>&ndash;'+
      '<b style="display:inline">6</b> to move between pages.</p>'+
      '<button type="button">Got it</button>';
    host.appendChild(tip); ctl.classList.add('hi');
    tip.querySelector('button').addEventListener('click',dismiss);
    document.addEventListener('keydown',onKey,true);
  }
  setTimeout(()=>showCoach(false),1400);
  const hb=document.getElementById('coachBtn');
  if(hb) hb.addEventListener('click',()=>showCoach(true));

  render();
  window.__wm={ restoreAll(){wins.forEach(w=>w.classList.remove('closed','min'));render();},
                coach(){showCoach(true);} };
})();

/* ---------- number keys move between pages, i3 style ---------- */
(function(){
  const pages=['index.html','projects.html','silicon.html','skills.html',
               'certificates.html','contact.html'];
  addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey) return;
    const t=e.target.tagName;
    if(t==='INPUT'||t==='TEXTAREA'||e.target.isContentEditable) return;
    const n=parseInt(e.key,10);
    if(n>=1&&n<=pages.length) location.href='./'+pages[n-1];
  });
})();

/* ---------- 3D chip viewer -------------------------------------------
   11 MB, so it never loads with the page: it starts when the section
   scrolls into view on a capable connection, else on a click.        */
(function(){
  const frame=document.getElementById('vframe'),
        poster=document.getElementById('vposter'),
        btn=document.getElementById('vload');
  if(!frame||!poster||!btn) return;
  let started=false;
  window.__startViewer=function(){
    if(started) return; started=true;
    btn.textContent='loading…';
    frame.src='./layout.html?embed=1';
    frame.addEventListener('load',()=>{
      frame.classList.add('in'); poster.classList.add('gone');
    },{once:true});
  };
  btn.addEventListener('click',window.__startViewer);
  const conn=navigator.connection||{};
  const slow=conn.saveData===true||/^(slow-)?2g$/.test(conn.effectiveType||'');
  if(innerWidth>=860&&!slow&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const vo=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){vo.disconnect();window.__startViewer();}
    }),{rootMargin:'200px'});
    vo.observe(document.getElementById('viewer'));
  }
})();

/* ---------- optional shell (home page) ---------- */
(function(){
  const form=document.getElementById('shForm'),
        input=document.getElementById('shIn'),
        out=document.getElementById('shOut');
  if(!form) return;
  const hist=[]; let hi=-1;

  const FILES={
    'about.md':'Year 2 MEng (Hons) EEE at the University of Nottingham Malaysia,\nheading toward RTL design and design verification. See the About window.',
    'stack.conf':'[chip_design] Verilog, RISC-V, testbenches, OpenLane, sky130\n[embedded_and_hardware] ESP32, Arduino, Raspberry Pi, C/C++, KiCad\n[software_and_other] Python, OpenCV, YOLO, Git',
    'contact.sh':'#!/bin/sh\necho "linkedin.com/in/colin-yap"\necho "github.com/colinyap"\necho "linktr.ee/colinyap"'
  };
  const DIRS={
    '':'about.md  projects/  silicon/  stack.conf  certificates/  contact.sh',
    'projects':'rvbl-2-riscv-core/     robotic-hand-glove/   verilog-projects/\nchip-design-toolkits/  line-follower-rpi/    pcb-business-card\nline-follower-arduino/',
    'silicon':'top.gds  top.glb',
    'certificates':'risc-v-processor  design-verification  layout  fpga'
  };
  const PAGES={about:'index.html#about',projects:'projects.html',work:'projects.html',
    silicon:'silicon.html',skills:'skills.html',stack:'skills.html',
    certificates:'certificates.html',certs:'certificates.html',contact:'contact.html'};
  const LINKS={github:'https://github.com/colinyap',
    linkedin:'https://linkedin.com/in/colin-yap',
    linktree:'https://linktr.ee/colinyap', layout:'./layout.html'};

  const esc=t=>t.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  function echo(html,cls){
    const d=document.createElement('div');
    if(cls) d.className=cls;
    d.innerHTML=html; out.appendChild(d);
  }

  function run(raw){
    const line=raw.trim();
    echo('<span class="mint">colin@portfolio</span><span class="vio">:~$</span> '+esc(line),'echo');
    if(!line) return;
    const [cmd,...args]=line.split(/\s+/);
    const arg=(args[0]||'').replace(/^\.\//,'').replace(/\/$/,'');
    switch(cmd){
      case 'help':
        echo('<span class="vio">ls</span> [dir]      list a directory\n'+
             '<span class="vio">cat</span> &lt;file&gt;    print a file\n'+
             '<span class="vio">cd</span> &lt;name&gt;     go to about|projects|silicon|skills|certificates|contact\n'+
             '<span class="vio">open</span> &lt;where&gt;  github|linkedin|linktree|layout\n'+
             '<span class="vio">whoami</span>        who is this\n'+
             '<span class="vio">date</span>          local time\n'+
             '<span class="vio">clear</span>         clear the screen\n'+
             '<span class="vio">restore</span>       un-hide every window\n'+
             '<span class="vio">coach</span>         replay the window tip'); break;
      case 'ls': {
        const d=DIRS[arg||''];
        if(d===undefined) echo('<span class="red">ls: '+esc(arg)+': No such file or directory</span>');
        else echo('<span class="vio">'+d+'</span>');
        break; }
      case 'cat': {
        if(!args.length){echo('<span class="red">cat: missing operand</span>');break;}
        const f=args[0].split('/').pop();
        if(FILES[f]) echo(FILES[f]);
        else if(DIRS[f.replace(/\/$/,'')]!==undefined) echo('<span class="red">cat: '+esc(args[0])+': Is a directory</span>');
        else echo('<span class="red">cat: '+esc(args[0])+': No such file or directory</span>');
        break; }
      case 'cd': {
        if(!arg||arg==='~'){ location.href='./index.html'; break; }
        if(PAGES[arg]){ echo('<span class="dim">→ '+PAGES[arg]+'</span>');
          setTimeout(()=>location.href='./'+PAGES[arg],180); }
        else echo('<span class="red">cd: '+esc(arg)+': No such file or directory</span>');
        break; }
      case 'open': {
        const u=LINKS[arg];
        if(u){echo('<span class="dim">opening '+u+'</span>');window.open(u,'_blank','noopener');}
        else echo('<span class="red">open: unknown target</span>');
        break; }
      case 'whoami': echo('colin — MEng EEE student, Nottingham Malaysia. Chip design and verification.'); break;
      case 'uname': echo('portfolio 4.0 RV32I_Zmmul_Xvbcrc #1 sky130A GNU/Linux'); break;
      case 'date': echo(new Date().toString()); break;
      case 'clear': out.innerHTML=''; break;
      case 'coach': case 'tutorial':
        if(window.__wm){window.__wm.coach();echo('<span class="dim">replaying the tip</span>');} break;
      case 'restore': case 'wm':
        if(window.__wm){window.__wm.restoreAll();echo('<span class="dim">all windows restored</span>');} break;
      case 'sudo': echo('<span class="red">colin is not in the sudoers file. This incident will be reported.</span>'); break;
      default: echo('<span class="red">'+esc(cmd)+': command not found — try <span class="vio">help</span></span>');
    }
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const v=input.value;
    if(v.trim()){hist.push(v); hi=hist.length;}
    run(v); input.value='';
  });
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowUp'){e.preventDefault(); if(hi>0){hi--; input.value=hist[hi]||'';}}
    if(e.key==='ArrowDown'){e.preventDefault();
      if(hi<hist.length-1){hi++; input.value=hist[hi]||'';} else {hi=hist.length; input.value='';}}
  });
  addEventListener('keydown',e=>{
    if(e.key==='`'&&document.activeElement!==input){
      e.preventDefault();
      document.getElementById('terminal').scrollIntoView({behavior:'smooth',block:'center'});
      setTimeout(()=>input.focus(),320);
    }
  });
})();
