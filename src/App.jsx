import { useState, useEffect, useRef, useCallback } from "react";

// ─── SUPABASE (raw fetch, no SDK) ────────────────────────────────────────────
const SB_URL = 'https://ouhzbwsldmzyvysspwuh.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aHpid3NsZG16eXZ5c3Nwd3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjIyMDYsImV4cCI6MjA4NTUzODIwNn0.0-ztU9ScrcrV1UnCBp7j8rEZuPst0qe4_CvTHyPw05s';
const sbH = () => ({'Content-Type':'application/json','apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`,'Prefer':'return=representation'});
async function sbFetch() {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/products?active=eq.true&order=created_at.desc`,{headers:sbH()});
    if(!r.ok) return null;
    const d = await r.json();
    return Array.isArray(d) ? d : null;
  } catch(e) { return null; }
}
async function sbInsert(p) {
  const r = await fetch(`${SB_URL}/rest/v1/products`,{method:'POST',headers:sbH(),body:JSON.stringify(p)});
  if(!r.ok) throw new Error(await r.text());
  return await r.json();
}
async function sbUpdate(id,p) {
  const r = await fetch(`${SB_URL}/rest/v1/products?id=eq.${id}`,{method:'PATCH',headers:sbH(),body:JSON.stringify(p)});
  if(!r.ok) throw new Error(await r.text());
}
async function sbDelete(id) { await sbUpdate(id,{active:false}); }

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED = [
  {id:1,name:"Shadow Cross Tee",type:"shirt",price:48,size:"M",description:"Bleached cross on vintage black tee. Hand-finished edges.",image_url:"",active:true},
  {id:2,name:"Cobweb Hoodie",type:"sweatshirt",price:72,size:"L",description:"Heavy cotton hoodie. Spider web bleached across the chest.",image_url:"",active:true},
  {id:3,name:"Ember Flame Tee",type:"shirt",price:45,size:"S",description:"Flame motif bleached in amber tones. Relaxed fit.",image_url:"",active:true},
  {id:4,name:"Chain Link Crewneck",type:"crewneck",price:68,size:"M",description:"Industrial chain pattern. Washed black cotton.",image_url:"",active:true},
  {id:5,name:"Wildwood Jacket",type:"jacket",price:120,size:"L",description:"Thrifted canvas jacket. Pine silhouette bleached white.",image_url:"",active:true},
  {id:6,name:"Bone Socks",type:"socks",price:18,size:"One Size",description:"Crew socks. Bone pattern bleached onto black cotton.",image_url:"",active:true},
  {id:7,name:"Dusk Sweatpants",type:"sweatpants",price:58,size:"M",description:"Tapered sweatpants. Crescent moon and stars bleached in.",image_url:"",active:true},
  {id:8,name:"Cemetery Jeans",type:"jeans",price:85,size:"32",description:"Distressed denim. Tombstone silhouette bleached on the thigh.",image_url:"",active:true},
  {id:9,name:"Thorn Rose Tee",type:"shirt",price:47,size:"XL",description:"Dead rose with thorns. Bleached in faded pink undertones.",image_url:"",active:true},
  {id:10,name:"Moth Crewneck",type:"crewneck",price:65,size:"L",description:"Luna moth spread across the chest. Cream on charcoal.",image_url:"",active:true},
  {id:11,name:"Serpent Hoodie",type:"sweatshirt",price:74,size:"M",description:"Coiled serpent wrapping the torso. Bold bleach work.",image_url:"",active:true},
  {id:12,name:"Drift Socks",type:"socks",price:16,size:"One Size",description:"Falling leaves pattern. Autumn tones bleached in.",image_url:"",active:true},
];

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TYPES=["All","shirt","sweatshirt","sweatpants","jacket","crewneck","socks","jeans"];
const C_TYPES=["shirt","sweatshirt","sweatpants","jacket","crewneck","socks","jeans"];
const S_COLORS=[{name:"Red",hex:"#8B0000"},{name:"Orange",hex:"#D2691E"},{name:"Yellow",hex:"#FFD700"},{name:"Green",hex:"#2F4F2F"},{name:"Blue",hex:"#1e3a5f"},{name:"Purple",hex:"#4B0082"},{name:"Black",hex:"#0a0a0a"},{name:"Slate",hex:"#3a3a3a"},{name:"Grey",hex:"#4a4a4a"},{name:"Tan",hex:"#8B7355"},{name:"Brown",hex:"#5C4033"}];
const A_COLORS=[{name:"None",hex:null},{name:"Red",hex:"#8B0000"},{name:"Orange",hex:"#D2691E"},{name:"Yellow",hex:"#B8860B"},{name:"Green",hex:"#2F4F2F"},{name:"Blue",hex:"#1e3a5f"},{name:"Purple",hex:"#4B0082"},{name:"Black",hex:"#0a0a0a"},{name:"Grey",hex:"#5a5a5a"},{name:"Tan",hex:"#8B7355"},{name:"Brown",hex:"#5C4033"}];
const VIBES=["Cross","Spiderweb","Chain","Flame","Moon","Serpent","Moth","Thorn Rose","Skull","Eye","Pine Tree","Bones","Leaf","Crow","Dagger","Pentagram","Wings","Raven","Thorns","Eclipse","Ivy","Smoke","Sigil","Feather"];
const SIZES_MAP={shirt:["S","M","L","XL","XXL"],sweatshirt:["S","M","L","XL","XXL"],sweatpants:["S","M","L","XL","XXL"],jacket:["S","M","L","XL"],crewneck:["S","M","L","XL","XXL"],socks:["One Size"],jeans:["28","30","32","34","36","38"]};
const BASE_P={shirt:48,sweatshirt:72,sweatpants:58,jacket:120,crewneck:68,socks:18,jeans:85};
const ADMIN_PW='blackbird2025';
const sRand=(seed)=>{let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const GS=()=>(
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Share+Tech+Mono&family=Patrick+Hand&display=swap');
@import url('https://fonts.cdnfonts.com/css/perfecto-calligraphy');
*{margin:0;padding:0;box-sizing:border-box}
:root{--black:#0a0a0a;--deep:#0e0e0e;--accent:#ffffff;--adim:#cccccc;--afaint:#999999;--red:#ffffff;--txt:#d0d0d0;--tdim:#888888;--fc:'Perfecto Calligraphy',cursive;--fb:'Special Elite',cursive;--fm:'Share Tech Mono',monospace;--fh:'Patrick Hand',cursive}
body{background:var(--black);color:var(--txt);font-family:var(--fb);overflow-x:hidden;min-height:100vh}
body::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.045;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:256px 256px}
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:9998;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.1) 3px,rgba(0,0,0,.1) 4px)}
button{font-family:var(--fb);cursor:pointer;border:none;background:none}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--deep)}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px}
.pe{animation:pageIn .55s cubic-bezier(.22,1,.36,1) forwards}
@keyframes pageIn{0%{opacity:0;filter:brightness(2.2) saturate(0);transform:scale(1.015)}50%{opacity:.8;filter:brightness(1.2) saturate(.4)}100%{opacity:1;filter:brightness(1) saturate(1);transform:scale(1)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes gf{0%{opacity:1}100%{opacity:0}}
input::placeholder{color:var(--tdim)}
input:focus,select:focus{outline:none}
`}</style>
);

// ─── LANDSCAPE ───────────────────────────────────────────────────────────────
function Landscape() {
  return (
    <div style={{
      position:'fixed',
      inset:0,
      zIndex:0,
      backgroundImage:'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)',
      backgroundSize:'cover',
      backgroundPosition:'center',
      filter:'brightness(0.3) saturate(0.4)',
    }}>
      <div style={{
        position:'absolute',
        inset:0,
        background:'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)'
      }}/>
    </div>
  );
}

// ─── SHARED UI ───────────────────────────────────────────────────────────────
function PImg({url,style={}}) {
  if(url) return (<div style={{background:'#141414',borderRadius:'6px',overflow:'hidden',...style}}><img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/></div>);
  return (<div style={{background:'linear-gradient(145deg,#1e1c18,#161412)',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',...style}}><svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.18"><rect x="2" y="6" width="28" height="20" rx="2" stroke="#ffffff" strokeWidth="1.2"/><circle cx="10" cy="13" r="2.5" stroke="#ffffff" strokeWidth="1.2"/><path d="M2 22 L10 16 L15 20 L21 14 L30 22" stroke="#ffffff" strokeWidth="1.2" fill="none"/></svg></div>);
}

// ─── POLAROID ────────────────────────────────────────────────────────────────
function Polaroid({product,onClick,index}) {
  const [hov,setHov]=useState(false);
  const rng=sRand(product.id*7+13),rot=(rng()-.5)*4;
  const firstImg = product.image_url ? (product.image_url.includes(',') ? product.image_url.split(',')[0] : product.image_url) : '';
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{transform:`rotate(${rot}deg) ${hov?'scale(1.035) translateY(-6px)':'scale(1)'}`,transition:'transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s',boxShadow:hov?'0 14px 40px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.3)':'0 6px 20px rgba(0,0,0,.4),0 2px 6px rgba(0,0,0,.25)',cursor:'pointer',animation:`pageIn .5s cubic-bezier(.22,1,.36,1) ${index*.07}s both`}}>
      <div style={{background:'#e8e8e8',borderRadius:'3px',padding:'10px 10px 56px 10px',position:'relative'}}>
        <div style={{width:'100%',aspectRatio:'1',borderRadius:'2px',overflow:'hidden',position:'relative'}}>
          <PImg url={firstImg} style={{width:'100%',height:'100%'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.15) 100%)',pointerEvents:'none'}}/>
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'56px',padding:'8px 14px',display:'flex',flexDirection:'column',justifyContent:'center',gap:'2px'}}>
          <div style={{fontFamily:'var(--fh)',fontSize:'17px',color:'#1a1a1a',lineHeight:1.25}}>{product.name}</div>
          <div style={{fontFamily:'var(--fh)',fontSize:'14px',color:'#444444',display:'flex',justifyContent:'space-between'}}>
            <span>{product.type}</span><span>${product.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING ─────────────────────────────────────────────────────────────────
function Landing({navigate}) {
  const [showBtn,setShowBtn]=useState(false),[glitch,setGlitch]=useState(false),[time,setTime]=useState('00:00:00'),[flickY,setFlickY]=useState(.3);
  const fRef=useRef(null);
  useEffect(()=>{
    const tick=()=>{const d=new Date();setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`)};
    const iv=setInterval(tick,1000);tick();
    const fire=()=>{setGlitch(true);setTimeout(()=>setGlitch(false),280)};
    fire();const gi=setInterval(fire,5800+Math.random()*2000);
    setTimeout(()=>setShowBtn(true),1600);
    return()=>{clearInterval(iv);clearInterval(gi)};
  },[]);
  useEffect(()=>{
    let t=0;const loop=()=>{t+=.02;setFlickY(Math.sin(t*.8)*.3+.5);fRef.current=requestAnimationFrame(loop)};
    fRef.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(fRef.current);
  },[]);
  return (
    <div className="pe" style={{position:'relative',zIndex:1,height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:10,background:'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 0%, rgba(0,0,0,.3) 55%, rgba(0,0,0,.75) 100%)'}}/>
      <div style={{position:'absolute',inset:'18px',border:'1.5px solid rgba(255,255,255,.2)',borderRadius:'3px',pointerEvents:'none',zIndex:11}}/>
      {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i)=><div key={i} style={{position:'absolute',zIndex:11,top:r===0?'18px':'auto',bottom:r===1?'18px':'auto',left:c===0?'18px':'auto',right:c===1?'18px':'auto',width:'30px',height:'30px',borderTop:r===0?'2px solid rgba(255,255,255,.5)':'none',borderBottom:r===1?'2px solid rgba(255,255,255,.5)':'none',borderLeft:c===0?'2px solid rgba(255,255,255,.5)':'none',borderRight:c===1?'2px solid rgba(255,255,255,.5)':'none',pointerEvents:'none'}}/>)}
      {[[0,0],[1,1]].map(([r,c],i)=><div key={'rgb'+i} style={{position:'absolute',zIndex:10,top:r===0?'16px':'auto',bottom:r===1?'16px':'auto',left:c===0?'16px':'auto',right:c===1?'16px':'auto',width:'30px',height:'30px',borderTop:r===0?'1px solid rgba(180,180,180,.15)':'none',borderBottom:r===1?'1px solid rgba(180,180,180,.15)':'none',borderLeft:c===0?'1px solid rgba(200,200,200,.15)':'none',borderRight:c===1?'1px solid rgba(200,200,200,.15)':'none',pointerEvents:'none'}}/>)}
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'38%',height:'42%',border:'1px solid rgba(255,255,255,.06)',borderRadius:'50%',pointerEvents:'none',zIndex:11}}/>
      <div style={{position:'absolute',left:0,right:0,zIndex:12,pointerEvents:'none',top:`${flickY*100}%`,height:'1px',background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.08) 20%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.08) 80%,transparent 100%)'}}/>
      {glitch&&<div style={{position:'absolute',inset:0,zIndex:13,pointerEvents:'none'}}>{[.28,.42,.55,.71].map((y,i)=><div key={i} style={{position:'absolute',left:0,right:0,top:`${y*100}%`,height:`${1.2+i*.4}%`,background:'rgba(255,255,255,.04)',transform:`translateX(${(i%2===0?1:-1)*(8+i*5)}px)`,filter:'brightness(1.3)'}}/>)}<div style={{position:'absolute',inset:0,background:'rgba(255,255,255,.03)',animation:'gf .28s ease forwards'}}/></div>}
      <div style={{position:'absolute',top:'30px',left:'32px',display:'flex',alignItems:'center',gap:'7px',pointerEvents:'none',zIndex:14}}><div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#ffffff',animation:'blink 1.3s infinite'}}/><span style={{fontFamily:'var(--fm)',fontSize:'10px',color:'rgba(255,255,255,.85)',letterSpacing:'2px'}}>REC</span></div>
      <div style={{position:'absolute',bottom:'28px',right:'32px',fontFamily:'var(--fm)',fontSize:'13px',color:'rgba(255,255,255,.5)',letterSpacing:'1px',pointerEvents:'none',zIndex:14}}>{time}</div>
      <div style={{position:'absolute',bottom:'28px',left:'32px',fontFamily:'var(--fm)',fontSize:'11px',color:'rgba(255,255,255,.35)',pointerEvents:'none',zIndex:14}}>{new Date().toLocaleDateString('en-US',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g,'.')}</div>
      <div style={{position:'absolute',top:'28px',right:'32px',fontFamily:'var(--fm)',fontSize:'10px',color:'rgba(255,255,255,.4)',pointerEvents:'none',zIndex:14,textAlign:'right',lineHeight:1.7}}><div>TAPE 00:47:23</div><div style={{display:'flex',alignItems:'center',gap:'4px',justifyContent:'flex-end',marginTop:'2px'}}><span>BAT</span><div style={{width:'18px',height:'7px',border:'1px solid rgba(255,255,255,.35)',borderRadius:'2px'}}><div style={{width:'13px',height:'100%',background:'rgba(255,255,255,.5)',borderRadius:'1px'}}/></div></div></div>
      <div style={{textAlign:'center',position:'relative',zIndex:15}}>
        <h1 style={{fontFamily:'var(--fc)',fontSize:'clamp(54px,10.5vw,104px)',fontWeight:400,color:'var(--accent)',lineHeight:1.15,letterSpacing:'2px',textShadow:'0 0 60px rgba(255,255,255,.1)',marginBottom:'2px'}}>Blackbird</h1>
        <h1 style={{fontFamily:'var(--fc)',fontSize:'clamp(54px,10.5vw,104px)',fontWeight:400,color:'var(--accent)',lineHeight:1.15,letterSpacing:'2px',textShadow:'0 0 60px rgba(255,255,255,.1)',marginBottom:'46px'}}>Exclusives</h1>
        {showBtn&&<div style={{display:'flex',flexDirection:'column',gap:'14px',alignItems:'center'}}>
          <button onClick={()=>navigate('catalog')} style={{fontFamily:'var(--fm)',fontSize:'11px',letterSpacing:'3px',color:'var(--adim)',padding:'11px 30px',border:'1px solid rgba(255,255,255,.22)',borderRadius:'2px',background:'rgba(255,255,255,.04)',transition:'all .35s',animation:'fadeUp .6s cubic-bezier(.22,1,.36,1) forwards'}}
            onMouseEnter={e=>{e.target.style.borderColor='rgba(255,255,255,.45)';e.target.style.color='var(--accent)';e.target.style.background='rgba(255,255,255,.08)'}}
            onMouseLeave={e=>{e.target.style.borderColor='rgba(255,255,255,.22)';e.target.style.color='var(--adim)';e.target.style.background='rgba(255,255,255,.04)'}}>ENTER ARCHIVE</button>
          <button onClick={()=>navigate('custom')} style={{fontFamily:'var(--fm)',fontSize:'11px',letterSpacing:'3px',color:'var(--adim)',padding:'11px 30px',border:'1px solid rgba(255,255,255,.22)',borderRadius:'2px',background:'rgba(255,255,255,.04)',transition:'all .35s',animation:'fadeUp .7s cubic-bezier(.22,1,.36,1) forwards'}}
            onMouseEnter={e=>{e.target.style.borderColor='rgba(255,255,255,.45)';e.target.style.color='var(--accent)';e.target.style.background='rgba(255,255,255,.08)'}}
            onMouseLeave={e=>{e.target.style.borderColor='rgba(255,255,255,.22)';e.target.style.color='var(--adim)';e.target.style.background='rgba(255,255,255,.04)'}}>CUSTOM ORDER</button>
        </div>}
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({page,navigate,cartCount}) {
  const tabs=[{id:'catalog',label:'CATALOG'},{id:'custom',label:'CUSTOM'},{id:'cart',label:`CART (${cartCount})`},{id:'admin',label:'ADMIN'}];
  return (
    <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(10,10,10,.88)',backdropFilter:'blur(14px)',borderBottom:'1px solid rgba(255,255,255,.07)',padding:'0 28px'}}>
      <div style={{maxWidth:'1100px',margin:'0 auto',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>navigate('landing')} style={{fontFamily:'var(--fc)',fontSize:'24px',color:'var(--accent)',letterSpacing:'1px'}}>Blackbird Exclusives</button>
        <div style={{display:'flex',gap:'28px'}}>
          {tabs.map(t=><button key={t.id} onClick={()=>navigate(t.id)} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:page===t.id?'var(--accent)':'var(--tdim)',paddingBottom:'4px',borderBottom:page===t.id?'1px solid var(--adim)':'1px solid transparent',transition:'all .3s'}}>{t.label}</button>)}
        </div>
      </div>
    </nav>
  );
}

// ─── CATALOG ─────────────────────────────────────────────────────────────────
function Catalog({navigate,cart,setCart,products}) {
  const [filter,setFilter]=useState('All'),[sort,setSort]=useState('featured'),[search,setSearch]=useState('');
  const filtered=products.filter(p=>filter==='All'||p.type===filter).filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>{if(sort==='price-low')return a.price-b.price;if(sort==='price-high')return b.price-a.price;if(sort==='name-az')return a.name.localeCompare(b.name);if(sort==='name-za')return b.name.localeCompare(a.name);return 0});
  return (
    <div className="pe" style={{position:'relative',zIndex:1,minHeight:'100vh'}}>
      <Nav page="catalog" navigate={navigate} cartCount={cart.length}/>
      <div style={{maxWidth:'1140px',margin:'0 auto',padding:'44px 28px'}}>
        <div style={{marginBottom:'32px'}}><div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--tdim)',letterSpacing:'3px',marginBottom:'6px'}}>▸ ARCHIVE / CATALOG</div><h2 style={{fontFamily:'var(--fc)',fontSize:'42px',color:'var(--accent)',fontWeight:400}}>The Collection</h2></div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'10px',alignItems:'center',marginBottom:'22px'}}>
          <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:'1 1 160px',maxWidth:'240px',background:'rgba(255,255,255,.035)',border:'1px solid rgba(255,255,255,.14)',borderRadius:'3px',padding:'7px 12px',color:'var(--accent)',fontFamily:'var(--fm)',fontSize:'11px',transition:'border-color .3s'}} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.35)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.14)'}/>
          <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
            {TYPES.map(t=><button key={t} onClick={()=>setFilter(t)} style={{fontFamily:'var(--fm)',fontSize:'9px',letterSpacing:'1.5px',textTransform:'uppercase',padding:'4px 11px',borderRadius:'14px',border:filter===t?'1px solid var(--adim)':'1px solid rgba(255,255,255,.12)',background:filter===t?'rgba(255,255,255,.08)':'rgba(255,255,255,.02)',color:filter===t?'var(--accent)':'var(--tdim)',transition:'all .25s'}}>{t}</button>)}
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',paddingBottom:'14px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <span style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--tdim)',letterSpacing:'1px'}}>{filtered.length} ITEM{filtered.length!==1?'S':''}</span>
          <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
            <span style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',letterSpacing:'1px',marginRight:'4px'}}>SORT</span>
            {[{id:'featured',label:'Featured'},{id:'price-low',label:'Price ↑'},{id:'price-high',label:'Price ↓'},{id:'name-az',label:'A → Z'},{id:'name-za',label:'Z → A'}].map(s=><button key={s.id} onClick={()=>setSort(s.id)} style={{fontFamily:'var(--fm)',fontSize:'9px',letterSpacing:'1px',color:sort===s.id?'var(--accent)':'var(--tdim)',paddingBottom:'2px',borderBottom:sort===s.id?'1px solid var(--adim)':'1px solid transparent',transition:'all .2s'}}>{s.label}</button>)}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))',gap:'32px 28px',padding:'8px 0'}}>
          {filtered.map((p,i)=><Polaroid key={p.id} product={p} index={i} onClick={()=>navigate('product',p)}/>)}
        </div>
        {filtered.length===0&&<div style={{textAlign:'center',padding:'80px 0',color:'var(--tdim)',fontFamily:'var(--fm)',fontSize:'12px',letterSpacing:'2px'}}>NO ITEMS FOUND</div>}
      </div>
    </div>
  );
}

// ─── PRODUCT ─────────────────────────────────────────────────────────────────
function Product({product,navigate,cart,setCart}) {
  const [added,setAdded]=useState(false);
  const images = product.image_url ? (product.image_url.includes(',') ? product.image_url.split(',').filter(u=>u.trim()) : [product.image_url]) : [];
  const [currentImg,setCurrentImg]=useState(0);
  const inCart = cart.some(item => item.id === product.id && !item.isCustom);
  const add=()=>{
    if(inCart) return;
    setCart(prev=>[...prev,{...product}]);
    setAdded(true);
    setTimeout(()=>setAdded(false),1600);
  };
  return (
    <div className="pe" style={{position:'relative',zIndex:1,minHeight:'100vh'}}>
      <Nav page="catalog" navigate={navigate} cartCount={cart.length}/>
      <div style={{maxWidth:'860px',margin:'0 auto',padding:'48px 28px'}}>
        <div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--tdim)',letterSpacing:'2px',marginBottom:'34px'}}>
          <button onClick={()=>navigate('catalog')} style={{color:'var(--afaint)',fontFamily:'inherit',fontSize:'inherit'}}>CATALOG</button>
          <span style={{margin:'0 8px'}}>›</span><span>{product.name.toUpperCase()}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'48px',alignItems:'start'}}>
          <div>
            <div style={{position:'relative',marginBottom:'16px'}}>
              <PImg url={images[currentImg]||product.image_url} style={{aspectRatio:'1'}}/>
              <div style={{position:'absolute',top:'10px',left:'10px',width:'20px',height:'20px',borderTop:'1.5px solid rgba(255,255,255,.25)',borderLeft:'1.5px solid rgba(255,255,255,.25)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:'10px',right:'10px',width:'20px',height:'20px',borderBottom:'1.5px solid rgba(255,255,255,.25)',borderRight:'1.5px solid rgba(255,255,255,.25)',pointerEvents:'none'}}/>
              {images.length>1&&(
                <>
                  <button onClick={()=>setCurrentImg(p=>p===0?images.length-1:p-1)} style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'36px',height:'36px',borderRadius:'50%',border:'1px solid rgba(255,255,255,.3)',background:'rgba(0,0,0,.6)',color:'#ffffff',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>‹</button>
                  <button onClick={()=>setCurrentImg(p=>p===images.length-1?0:p+1)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'36px',height:'36px',borderRadius:'50%',border:'1px solid rgba(255,255,255,.3)',background:'rgba(0,0,0,.6)',color:'#ffffff',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>›</button>
                </>
              )}
            </div>
            {images.length>1&&(
              <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
                {images.map((url,idx)=>(
                  <button key={idx} onClick={()=>setCurrentImg(idx)} style={{width:'64px',height:'64px',borderRadius:'4px',overflow:'hidden',border:currentImg===idx?'2px solid var(--accent)':'1px solid rgba(255,255,255,.15)',background:'transparent',padding:0,cursor:'pointer',opacity:currentImg===idx?1:0.5,transition:'all .2s'}}>
                    <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{fontFamily:'var(--fm)',fontSize:'8px',letterSpacing:'2px',color:'var(--afaint)',textTransform:'uppercase',marginBottom:'8px'}}>{product.type} — Handcrafted</div>
            <h1 style={{fontFamily:'var(--fc)',fontSize:'36px',color:'var(--accent)',fontWeight:400,marginBottom:'10px'}}>{product.name}</h1>
            <div style={{fontFamily:'var(--fm)',fontSize:'22px',color:'var(--accent)',marginBottom:'18px'}}>${product.price}</div>
            <p style={{fontFamily:'var(--fb)',fontSize:'13px',color:'var(--tdim)',lineHeight:1.7,marginBottom:'26px'}}>{product.description}</p>
            <div style={{marginBottom:'26px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{fontFamily:'var(--fm)',fontSize:'9px',letterSpacing:'2px',color:'var(--tdim)'}}>SIZE</div>
              <div style={{fontFamily:'var(--fm)',fontSize:'11px',letterSpacing:'1px',padding:'6px 14px',borderRadius:'3px',border:'1px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.06)',color:'var(--accent)'}}>{product.size}</div>
              <div style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',letterSpacing:'1px'}}>— one of a kind</div>
            </div>
            <button onClick={add} disabled={inCart} style={{width:'100%',fontFamily:'var(--fm)',fontSize:'11px',letterSpacing:'3px',padding:'13px',borderRadius:'3px',border:added?'1px solid #4a9a5a':inCart?'1px solid rgba(255,255,255,.2)':'1px solid var(--adim)',background:added?'rgba(74,154,90,.12)':inCart?'rgba(255,255,255,.03)':'rgba(255,255,255,.07)',color:added?'#4a9a5a':inCart?'var(--tdim)':'var(--accent)',transition:'all .3s',cursor:inCart?'not-allowed':'pointer',opacity:inCart?0.5:1}}>{added?'✓  ADDED':inCart?'ALREADY IN CART':'ADD TO CART'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM ──────────────────────────────────────────────────────────────────
function Custom({navigate,cart,setCart}) {
  const [cfg,setCfg]=useState({type:null,size:null,color:null,accent:null,symbol:null,ct:'',notes:''});
  const [added,setAdded]=useState(false);
  const [useCT,setUseCT]=useState(false);
  const symDone=cfg.symbol!==null||(useCT&&cfg.ct.trim().length>0);
  const allDone=cfg.type&&cfg.size&&cfg.color&&cfg.accent!==null&&symDone;
  const price=cfg.type?BASE_P[cfg.type]*2:0;
  const set=(f,v)=>setCfg(p=>{const n={...p,[f]:v};if(f==='type')n.size=null;return n});

  const addToCart=()=>{
    const symbolText = useCT ? cfg.ct.trim() : cfg.symbol;
    const customProduct = {
      id: `custom-${Date.now()}`,
      name: `Custom ${cfg.type.charAt(0).toUpperCase() + cfg.type.slice(1)}`,
      type: cfg.type,
      size: cfg.size,
      price: price,
      description: `Type: ${cfg.type} | Size: ${cfg.size} | Shirt Color: ${cfg.color} | Accent Color: ${cfg.accent} | Symbol/Vibe: ${symbolText}${cfg.notes.trim() ? ` | Notes: ${cfg.notes.trim()}` : ''}`,
      image_url: '',
      isCustom: true
    };
    setCart(prev=>[...prev,customProduct]);
    setAdded(true);
  };

  if(added) return (
    <div className="pe" style={{position:'relative',zIndex:1,minHeight:'100vh'}}>
      <Nav page="custom" navigate={navigate} cartCount={cart.length}/>
      <div style={{maxWidth:'560px',margin:'0 auto',padding:'130px 28px',textAlign:'center',position:'relative'}}>
        <button onClick={()=>{setAdded(false);setCfg({type:null,size:null,color:null,accent:null,symbol:null,ct:'',notes:''});setUseCT(false)}} style={{position:'absolute',top:'100px',right:'28px',width:'32px',height:'32px',borderRadius:'50%',border:'1px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.05)',color:'var(--tdim)',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}} onMouseEnter={e=>{e.target.style.borderColor='var(--adim)';e.target.style.color='var(--accent)'}} onMouseLeave={e=>{e.target.style.borderColor='rgba(255,255,255,.2)';e.target.style.color='var(--tdim)'}}>✕</button>
        <div style={{width:'56px',height:'56px',borderRadius:'50%',border:'1px solid var(--adim)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px',fontSize:'22px',color:'var(--accent)'}}>✓</div>
        <h2 style={{fontFamily:'var(--fc)',fontSize:'38px',color:'var(--accent)',marginBottom:'14px'}}>Added to Cart</h2>
        <p style={{fontFamily:'var(--fb)',fontSize:'13px',color:'var(--tdim)',lineHeight:1.7,marginBottom:'8px'}}>Your custom {cfg.type} has been added to your cart. Price: <span style={{color:'var(--accent)'}}>${price}</span></p>
        <div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'24px',flexWrap:'wrap'}}>
          <button onClick={()=>navigate('cart')} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--accent)',border:'1px solid var(--adim)',padding:'9px 22px',borderRadius:'3px',background:'rgba(255,255,255,.08)'}}>VIEW CART</button>
          <button onClick={()=>navigate('catalog')} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--adim)',border:'1px solid rgba(255,255,255,.18)',padding:'9px 22px',borderRadius:'3px',background:'rgba(255,255,255,.04)'}}>BROWSE ARCHIVE</button>
          <button onClick={()=>{setAdded(false);setCfg({type:null,size:null,color:null,accent:null,symbol:null,ct:'',notes:''});setUseCT(false)}} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--adim)',border:'1px solid rgba(255,255,255,.18)',padding:'9px 22px',borderRadius:'3px',background:'rgba(255,255,255,.04)'}}>CREATE ANOTHER</button>
        </div>
      </div>
    </div>
  );

  const Pill=({label,sel,onClick})=><button onClick={onClick} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',padding:'7px 14px',borderRadius:'4px',border:sel?'1px solid var(--adim)':'1px solid rgba(255,255,255,.1)',background:sel?'rgba(255,255,255,.07)':'rgba(255,255,255,.025)',color:sel?'var(--accent)':'var(--tdim)',transition:'all .2s',cursor:'pointer'}}>{label}</button>;
  const Swatch=({opt,sel,onClick})=><button onClick={onClick} style={{display:'flex',alignItems:'center',gap:'9px',fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',padding:'8px 12px',borderRadius:'4px',border:sel?'1px solid var(--adim)':'1px solid rgba(255,255,255,.1)',background:sel?'rgba(255,255,255,.07)':'rgba(255,255,255,.025)',color:sel?'var(--accent)':'var(--tdim)',transition:'all .2s',cursor:'pointer'}}><div style={{width:'16px',height:'16px',borderRadius:'50%',flexShrink:0,background:opt.hex||'transparent',border:opt.hex?'1px solid rgba(255,255,255,.15)':'1px dashed rgba(255,255,255,.3)',boxShadow:opt.hex?`0 0 6px ${opt.hex}33`:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>{!opt.hex&&<span style={{fontSize:'8px',color:'var(--tdim)'}}>✕</span>}</div>{opt.name}</button>;

  const Step=({idx,field,label,done,active,children})=>(
    <div style={{marginBottom:'28px',opacity:active?1:.28,transition:'opacity .4s'}}>
      <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'12px'}}>
        <div style={{width:'20px',height:'20px',borderRadius:'50%',flexShrink:0,border:done?'1px solid var(--adim)':'1px solid rgba(255,255,255,.2)',background:done?'rgba(255,255,255,.1)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--fm)',fontSize:'9px',color:done?'var(--accent)':'var(--tdim)',transition:'all .3s'}}>{done?'✓':idx+1}</div>
        <span style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:done?'var(--adim)':'var(--tdim)'}}>{label}</span>
        {done&&field!=='symbol'&&field!=='notes'&&<span style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--afaint)',marginLeft:'auto'}}>{cfg[field]||''}</span>}
      </div>
      {active&&children}
    </div>
  );

  return (
    <div className="pe" style={{position:'relative',zIndex:1,minHeight:'100vh'}}>
      <Nav page="custom" navigate={navigate} cartCount={cart.length}/>
      <div style={{maxWidth:'720px',margin:'0 auto',padding:'44px 28px'}}>
        <div style={{marginBottom:'36px'}}><div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--tdim)',letterSpacing:'3px',marginBottom:'6px'}}>▸ ARCHIVE / CUSTOM</div><h2 style={{fontFamily:'var(--fc)',fontSize:'42px',color:'var(--accent)',fontWeight:400}}>Build Your Own</h2><p style={{fontFamily:'var(--fb)',fontSize:'12px',color:'var(--tdim)',marginTop:'6px',lineHeight:1.6}}>Design a one-of-a-kind piece. Custom orders are 2x base price — turnaround is 7-14 days.</p></div>
        <div style={{display:'flex',gap:'3px',marginBottom:'34px'}}>
          {['type','size','color','accent','symbol','notes'].map(s=>{const done=s==='symbol'?symDone:s==='notes'?true:cfg[s]!==null;return<div key={s} style={{flex:1,height:'2px',borderRadius:'1px',background:done?'var(--adim)':'rgba(255,255,255,.1)',transition:'background .4s'}}/>})}
        </div>
        <Step idx={0} field="type" label="PIECE TYPE" done={!!cfg.type} active={true}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(110px,1fr))',gap:'7px'}}>{C_TYPES.map(t=><Pill key={t} label={t} sel={cfg.type===t} onClick={()=>set('type',t)}/>)}</div>
        </Step>
        <Step idx={1} field="size" label="SIZE" done={!!cfg.size} active={!!cfg.type}>
          {cfg.type&&<div style={{display:'flex',gap:'7px',flexWrap:'wrap'}}>{SIZES_MAP[cfg.type].map(s=><Pill key={s} label={s} sel={cfg.size===s} onClick={()=>set('size',s)}/>)}</div>}
        </Step>
        <Step idx={2} field="color" label="SHIRT COLOR" done={!!cfg.color} active={!!cfg.size}>
          {cfg.size&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(140px,1fr))',gap:'7px'}}>{S_COLORS.map(c=><Swatch key={c.name} opt={c} sel={cfg.color===c.name} onClick={()=>set('color',c.name)}/>)}</div>}
        </Step>
        <Step idx={3} field="accent" label="ACCENT COLOR" done={cfg.accent!==null} active={!!cfg.color}>
          {cfg.color&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(140px,1fr))',gap:'7px'}}>{A_COLORS.map(c=><Swatch key={c.name} opt={c} sel={cfg.accent===c.name} onClick={()=>set('accent',c.name)}/>)}</div>}
        </Step>
        <Step idx={4} field="symbol" label="VIBE / SYMBOL" done={symDone} active={cfg.accent!==null}>
          {cfg.accent!==null&&<div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(110px,1fr))',gap:'7px',marginBottom:'14px'}}>{VIBES.map(s=><Pill key={s} label={s} sel={!useCT&&cfg.symbol===s} onClick={()=>{set('symbol',s);setUseCT(false)}}/>)}</div>
            <div style={{marginTop:'18px',paddingTop:'16px',borderTop:'1px solid rgba(255,255,255,.07)'}}>
              <button onClick={()=>{setUseCT(!useCT);if(!useCT)set('symbol',null)}} style={{display:'flex',alignItems:'center',gap:'8px',fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'1.5px',color:useCT?'var(--accent)':'var(--tdim)',transition:'color .2s',marginBottom:useCT?'12px':'0'}}>
                <div style={{width:'16px',height:'16px',borderRadius:'3px',border:'1px solid '+(useCT?'var(--adim)':'rgba(255,255,255,.2)'),background:useCT?'rgba(255,255,255,.12)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',color:useCT?'var(--accent)':'transparent'}}>✓</div>
                USE CUSTOM TEXT INSTEAD
              </button>
              {useCT&&<input type="text" placeholder="Type your symbol or word..." value={cfg.ct} onChange={e=>setCfg(p=>({...p,ct:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&e.preventDefault()} style={{width:'100%',background:'rgba(255,255,255,.035)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'3px',padding:'9px 14px',color:'var(--accent)',fontFamily:'var(--fm)',fontSize:'12px',transition:'border-color .3s'}} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>}
            </div>
          </div>}
        </Step>
        <Step idx={5} field="notes" label="NOTES (OPTIONAL)" done={true} active={symDone}>
          {symDone&&<div>
            <div style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',marginBottom:'8px',letterSpacing:'1px'}}>Any special requests or details?</div>
            <textarea placeholder="E.g., darker shade, more distressed look, specific placement..." value={cfg.notes} onChange={e=>setCfg(p=>({...p,notes:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&e.stopPropagation()} style={{width:'100%',minHeight:'80px',background:'rgba(255,255,255,.035)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'3px',padding:'9px 14px',color:'var(--accent)',fontFamily:'var(--fm)',fontSize:'11px',transition:'border-color .3s',resize:'vertical'}} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>
          </div>}
        </Step>
        {allDone&&<div style={{marginTop:'32px',paddingTop:'22px',borderTop:'1px solid rgba(255,255,255,.1)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'18px'}}>
            <div><div style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',letterSpacing:'1px',marginBottom:'4px'}}>CUSTOM ORDER TOTAL</div><div style={{fontFamily:'var(--fm)',fontSize:'26px',color:'var(--accent)'}}>${price}</div></div>
            <div style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',textAlign:'right',lineHeight:1.9}}><div>Base ${BASE_P[cfg.type]} x 2</div><div>Est. 7-14 days</div></div>
          </div>
          <button onClick={addToCart} style={{width:'100%',fontFamily:'var(--fm)',fontSize:'11px',letterSpacing:'3px',padding:'14px',borderRadius:'3px',border:'1px solid var(--adim)',background:'rgba(255,255,255,.08)',color:'var(--accent)',cursor:'pointer',transition:'all .3s'}}>ADD TO CART</button>
        </div>}
      </div>
    </div>
  );
}

// ─── CART ────────────────────────────────────────────────────────────────────
function Cart({navigate,cart,setCart}) {
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const subtotal=cart.reduce((s,i)=>s+i.price,0);
  const shipping=cart.length * 10;
  const total=subtotal + shipping;
  const rm=idx=>setCart(p=>p.filter((_,i)=>i!==idx));
  
  const handleCheckout = async () => {
    setProcessing(true);
    setCheckoutError(null);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
      setProcessing(false);
    }
  };
  
  return (
    <div className="pe" style={{position:'relative',zIndex:1,minHeight:'100vh'}}>
      <Nav page="cart" navigate={navigate} cartCount={cart.length}/>
      <div style={{maxWidth:'680px',margin:'0 auto',padding:'44px 28px'}}>
        <div style={{marginBottom:'36px'}}><div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--tdim)',letterSpacing:'3px',marginBottom:'6px'}}>▸ ARCHIVE / CART</div><h2 style={{fontFamily:'var(--fc)',fontSize:'42px',color:'var(--accent)',fontWeight:400}}>Your Cart</h2></div>
        {cart.length===0?(
          <div style={{textAlign:'center',padding:'100px 0'}}><div style={{fontFamily:'var(--fm)',fontSize:'11px',color:'var(--tdim)',letterSpacing:'2px',marginBottom:'22px'}}>CART IS EMPTY</div><button onClick={()=>navigate('catalog')} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--adim)',border:'1px solid rgba(255,255,255,.18)',padding:'9px 22px',borderRadius:'3px',background:'rgba(255,255,255,.04)'}}>BROWSE CATALOG →</button></div>
        ):(
          <div>
            {cart.map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 0',borderBottom:'1px solid rgba(255,255,255,.07)',animation:`pageIn .4s cubic-bezier(.22,1,.36,1) ${i*.07}s both`}}>
                <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                  <PImg url={item.image_url} style={{width:'56px',height:'56px',flexShrink:0}}/>
                  <div>
                    <div style={{fontFamily:'var(--fc)',fontSize:'19px',color:'var(--accent)'}}>{item.name}</div>
                    <div style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',letterSpacing:'1px',marginTop:'3px'}}>
                      {item.isCustom ? item.description : `SIZE: ${item.size} — ${item.type.toUpperCase()}`}
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'18px'}}>
                  <span style={{fontFamily:'var(--fm)',fontSize:'15px',color:'var(--accent)'}}>${item.price}</span>
                  <button onClick={()=>rm(i)} style={{fontFamily:'var(--fm)',fontSize:'13px',color:'var(--tdim)',transition:'color .2s'}} onMouseEnter={e=>e.target.style.color='var(--red)'} onMouseLeave={e=>e.target.style.color='var(--tdim)'}>✕</button>
                </div>
              </div>
            ))}
            <div style={{marginTop:'28px',paddingTop:'20px',borderTop:'1px solid rgba(255,255,255,.14)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}><span style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--tdim)'}}>SUBTOTAL</span><span style={{fontFamily:'var(--fm)',fontSize:'16px',color:'var(--accent)'}}>${subtotal}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px',paddingBottom:'18px',borderBottom:'1px solid rgba(255,255,255,.07)'}}><span style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--tdim)'}}>SHIPPING ({cart.length} item{cart.length !== 1 ? 's' : ''} × $10)</span><span style={{fontFamily:'var(--fm)',fontSize:'16px',color:'var(--accent)'}}>${shipping}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}><span style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--tdim)'}}>TOTAL</span><span style={{fontFamily:'var(--fm)',fontSize:'22px',color:'var(--accent)'}}>${total}</span></div>
              {checkoutError && <div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--red)',marginBottom:'12px',letterSpacing:'1px'}}>{checkoutError}</div>}
              <button onClick={handleCheckout} disabled={processing} style={{width:'100%',fontFamily:'var(--fm)',fontSize:'11px',letterSpacing:'3px',padding:'14px',borderRadius:'3px',border:'1px solid var(--adim)',background:'rgba(255,255,255,.07)',color:'var(--accent)',cursor:processing?'default':'pointer',opacity:processing?0.5:1,transition:'all .3s'}} onMouseEnter={e=>!processing&&(e.target.style.background='rgba(255,255,255,.14)')} onMouseLeave={e=>!processing&&(e.target.style.background='rgba(255,255,255,.07)')}>
                {processing ? 'PROCESSING...' : 'PROCEED TO CHECKOUT'}
              </button>
              <p style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',textAlign:'center',marginTop:'12px',letterSpacing:'1px'}}>Secure checkout via Stripe</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
function Admin({navigate,products,onChange,usingSeed}) {
  const [authed,setAuthed]=useState(false),[pw,setPw]=useState(''),[pwErr,setPwErr]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({name:'',type:'shirt',size:'M',price:'',description:'',image_urls:['']});
  const [saving,setSaving]=useState(false),[saveErr,setSaveErr]=useState(null);
  const login=()=>{if(pw===ADMIN_PW){setAuthed(true);setPwErr(false)}else setPwErr(true)};
  const reset=()=>setForm({name:'',type:'shirt',size:'M',price:'',description:'',image_urls:['']});
  const startEdit=p=>{
    setEditing(p);
    const urls = p.image_url ? (p.image_url.includes(',') ? p.image_url.split(',') : [p.image_url]) : [''];
    setForm({name:p.name,type:p.type,size:p.size||'M',price:String(p.price),description:p.description||'',image_urls:urls});
  };
  const save=async()=>{
    if(!form.name.trim()||!form.price){setSaveErr('Name and price required.');return}
    setSaving(true);setSaveErr(null);
    try{
      const imageUrl = form.image_urls.filter(url => url.trim()).join(',');
      const payload={name:form.name.trim(),type:form.type,size:form.size.trim(),price:Number(form.price),description:form.description.trim(),image_url:imageUrl,active:true};
      if(editing)await sbUpdate(editing.id,payload);else await sbInsert(payload);
      const d=await sbFetch();if(d)onChange(d);
      setEditing(null);reset();
    }catch(e){setSaveErr(e.message||'Save failed. Run setup.sql first.')}
    setSaving(false);
  };
  const del=async id=>{
    if(!confirm('Delete?'))return;setSaving(true);
    try{await sbDelete(id);const d=await sbFetch();if(d)onChange(d)}catch(e){setSaveErr(e.message||'Delete failed.')}
    setSaving(false);
  };
  const iS={width:'100%',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.18)',borderRadius:'3px',padding:'9px 12px',color:'var(--accent)',fontFamily:'var(--fm)',fontSize:'12px',transition:'border-color .3s'};

  if(!authed) return (
    <div className="pe" style={{position:'relative',zIndex:1,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:'360px',padding:'0 28px'}}>
        <div style={{textAlign:'center',marginBottom:'40px'}}><div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--tdim)',letterSpacing:'3px',marginBottom:'8px'}}>▸ ADMIN ACCESS</div><h2 style={{fontFamily:'var(--fc)',fontSize:'36px',color:'var(--accent)',fontWeight:400}}>Blackbird</h2></div>
        <input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={{...iS,fontSize:'13px',marginBottom:'12px',padding:'11px 14px'}} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>
        {pwErr&&<div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--red)',marginBottom:'8px',letterSpacing:'1px'}}>Incorrect password</div>}
        <button onClick={login} style={{width:'100%',fontFamily:'var(--fm)',fontSize:'11px',letterSpacing:'3px',padding:'12px',borderRadius:'3px',border:'1px solid var(--adim)',background:'rgba(255,255,255,.08)',color:'var(--accent)'}}>ENTER</button>
        <button onClick={()=>navigate('catalog')} style={{width:'100%',fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--tdim)',marginTop:'16px',padding:'8px'}}>← Back</button>
      </div>
    </div>
  );

  return (
    <div className="pe" style={{position:'relative',zIndex:1,minHeight:'100vh'}}>
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(10,10,10,.9)',backdropFilter:'blur(14px)',borderBottom:'1px solid rgba(255,255,255,.07)',padding:'0 28px'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:'var(--fc)',fontSize:'24px',color:'var(--accent)'}}>Blackbird Exclusives</span>
          <div style={{display:'flex',gap:'20px',alignItems:'center'}}><span style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--afaint)',letterSpacing:'2px'}}>ADMIN</span><button onClick={()=>navigate('catalog')} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',color:'var(--tdim)'}}>← STOREFRONT</button></div>
        </div>
      </nav>
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'40px 28px'}}>
        {usingSeed&&<div style={{background:'rgba(201,58,58,.1)',border:'1px solid rgba(201,58,58,.25)',borderRadius:'6px',padding:'16px 20px',marginBottom:'28px'}}><div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--red)',letterSpacing:'1px',marginBottom:'4px'}}>⚠ SUPABASE TABLE NOT FOUND</div><div style={{fontFamily:'var(--fb)',fontSize:'12px',color:'var(--tdim)',lineHeight:1.6}}>Run <strong style={{color:'var(--accent)'}}>setup.sql</strong> in your Supabase SQL Editor first. Until then, catalog shows seed data and changes here will not persist.</div></div>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
          <div><div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--tdim)',letterSpacing:'3px',marginBottom:'4px'}}>▸ ADMIN / PRODUCTS</div><h2 style={{fontFamily:'var(--fc)',fontSize:'36px',color:'var(--accent)',fontWeight:400}}>Manage Products</h2></div>
          <button onClick={()=>{setEditing(null);reset();setSaveErr(null)}} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',padding:'9px 18px',borderRadius:'3px',border:'1px solid var(--adim)',background:'rgba(255,255,255,.08)',color:'var(--accent)'}}>+ ADD PRODUCT</button>
        </div>
        <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'24px',marginBottom:'36px'}}>
          <div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--adim)',letterSpacing:'2px',marginBottom:'18px'}}>{editing?'EDITING: '+editing.name.toUpperCase():'NEW PRODUCT'}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))',gap:'12px',marginBottom:'12px'}}>
            <div><div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--tdim)',letterSpacing:'1px',marginBottom:'5px'}}>NAME</div><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={iS} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>  </div>
            <div><div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--tdim)',letterSpacing:'1px',marginBottom:'5px'}}>TYPE</div><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{...iS,cursor:'pointer'}}>{C_TYPES.map(t=><option key={t} value={t} style={{background:'#1a1a1a',color:'#ffffff'}}>{t}</option>)}</select></div>
            <div><div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--tdim)',letterSpacing:'1px',marginBottom:'5px'}}>SIZE</div><input value={form.size} onChange={e=>setForm(p=>({...p,size:e.target.value}))} placeholder="e.g. L" style={iS} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>  </div>
            <div><div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--tdim)',letterSpacing:'1px',marginBottom:'5px'}}>PRICE ($)</div><input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="48" style={iS} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>  </div>
          </div>
          <div style={{marginBottom:'12px'}}><div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--tdim)',letterSpacing:'1px',marginBottom:'5px'}}>DESCRIPTION</div><input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Hand-bleached..." style={iS} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>  </div>
          <div style={{marginBottom:'16px'}}>
            <div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--tdim)',letterSpacing:'1px',marginBottom:'8px'}}>IMAGE URLS</div>
            {form.image_urls.map((url,idx)=>(
              <div key={idx} style={{display:'flex',gap:'8px',marginBottom:'8px',alignItems:'center'}}>
                <input value={url} onChange={e=>{const newUrls=[...form.image_urls];newUrls[idx]=e.target.value;setForm(p=>({...p,image_urls:newUrls}))}} placeholder={`Image ${idx+1} URL`} style={{...iS,flex:1}} onFocus={e=>e.target.style.borderColor='rgba(255,255,255,.4)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.18)'}/>
                {form.image_urls.length>1&&<button onClick={()=>setForm(p=>({...p,image_urls:p.image_urls.filter((_,i)=>i!==idx)}))} style={{fontFamily:'var(--fm)',fontSize:'10px',padding:'9px 12px',borderRadius:'3px',border:'1px solid rgba(255,255,255,.2)',color:'var(--tdim)',background:'rgba(255,255,255,.03)'}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>setForm(p=>({...p,image_urls:[...p.image_urls,'']}))} style={{fontFamily:'var(--fm)',fontSize:'9px',letterSpacing:'1px',padding:'6px 12px',borderRadius:'3px',border:'1px solid rgba(255,255,255,.15)',color:'var(--adim)',background:'rgba(255,255,255,.03)',marginTop:'4px'}}>+ ADD ANOTHER IMAGE</button>
          </div>
          {form.image_urls.filter(u=>u.trim()).length>0&&(
            <div style={{marginBottom:'12px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
              <div style={{fontFamily:'var(--fm)',fontSize:'8px',color:'var(--tdim)',letterSpacing:'1px',width:'100%',marginBottom:'4px'}}>PREVIEW</div>
              {form.image_urls.filter(u=>u.trim()).map((url,idx)=>(
                <div key={idx} style={{width:'48px',height:'48px',borderRadius:'4px',overflow:'hidden',border:'1px solid rgba(255,255,255,.15)'}}>
                  <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.target.style.display='none'}/>
                </div>
              ))}
            </div>
          )}
          {saveErr&&<div style={{fontFamily:'var(--fm)',fontSize:'10px',color:'var(--red)',marginBottom:'10px',letterSpacing:'1px'}}>{saveErr}</div>}
          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={save} disabled={saving} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',padding:'9px 20px',borderRadius:'3px',border:'1px solid var(--adim)',background:'rgba(255,255,255,.08)',color:'var(--accent)',opacity:saving?.5:1,cursor:saving?'default':'pointer'}}>{saving?'SAVING...':editing?'SAVE CHANGES':'ADD PRODUCT'}</button>
            <button onClick={()=>{setEditing(null);reset();setSaveErr(null)}} style={{fontFamily:'var(--fm)',fontSize:'10px',letterSpacing:'2px',padding:'9px 16px',borderRadius:'3px',border:'1px solid rgba(255,255,255,.15)',color:'var(--tdim)'}}>CANCEL</button>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {products.map(p=>(
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:'16px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'14px 18px'}}>
              <PImg url={p.image_url} style={{width:'48px',height:'48px',flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontFamily:'var(--fc)',fontSize:'18px',color:'var(--accent)'}}>{p.name}</div><div style={{fontFamily:'var(--fm)',fontSize:'9px',color:'var(--tdim)',letterSpacing:'1px',marginTop:'2px'}}>{p.type.toUpperCase()} — SIZE {p.size} — ${p.price}</div></div>
              <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                <button onClick={()=>startEdit(p)} style={{fontFamily:'var(--fm)',fontSize:'9px',letterSpacing:'1px',padding:'5px 12px',borderRadius:'3px',border:'1px solid rgba(255,255,255,.2)',color:'var(--adim)'}}>EDIT</button>
                <button onClick={()=>del(p.id)} style={{fontFamily:'var(--fm)',fontSize:'9px',letterSpacing:'1px',padding:'5px 10px',borderRadius:'3px',border:'1px solid rgba(201,58,58,.3)',color:'var(--red)'}}>✕</button>
              </div>
            </div>
          ))}
          {products.length===0&&<div style={{textAlign:'center',padding:'40px 0',fontFamily:'var(--fm)',fontSize:'11px',color:'var(--tdim)',letterSpacing:'2px'}}>NO PRODUCTS YET</div>}
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState('landing'),[pageData,setPageData]=useState(null),[cart,setCart]=useState([]),[transitioning,setTransitioning]=useState(false);
  const [products,setProducts]=useState([]),[loading,setLoading]=useState(true),[usingSeed,setUsingSeed]=useState(false);

  useEffect(()=>{
    const load=async()=>{
      const d=await sbFetch();
      if(d&&d.length>0){setProducts(d);setUsingSeed(false)}
      else{setProducts(SEED);setUsingSeed(true)}
      setLoading(false);
    };
    load();
  },[]);

  const navigate=useCallback((target,data=null)=>{
    setTransitioning(true);
    setTimeout(()=>{setPage(target);setPageData(data);setTransitioning(false)},320);
  },[]);

  if(loading) return (<div><GS/><Landscape/><div style={{position:'relative',zIndex:1,height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:'11px',color:'#6b6358',letterSpacing:'3px'}}>LOADING...</div></div></div>);

  const page_component = ()=>{
    switch(page){
      case 'landing': return <Landing navigate={navigate}/>;
      case 'catalog': return <Catalog navigate={navigate} cart={cart} setCart={setCart} products={products}/>;
      case 'product': return pageData?<Product product={pageData} navigate={navigate} cart={cart} setCart={setCart}/>:<Catalog navigate={navigate} cart={cart} setCart={setCart} products={products}/>;
      case 'custom':  return <Custom navigate={navigate} cart={cart} setCart={setCart}/>;
      case 'cart':    return <Cart navigate={navigate} cart={cart} setCart={setCart}/>;
      case 'admin':   return <Admin navigate={navigate} products={products} onChange={setProducts} usingSeed={usingSeed}/>;
      default:        return <Landing navigate={navigate}/>;
    }
  };

  return (
    <div>
      <GS/>
      <Landscape/>
      <div style={{position:'fixed',inset:0,zIndex:9990,pointerEvents:'none',background:'var(--black)',opacity:transitioning?1:0,transition:'opacity .32s cubic-bezier(.22,1,.36,1)'}}/>
      <div style={{position:'relative',zIndex:1}}>{page_component()}</div>
    </div>
  );
}
