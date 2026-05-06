import { useState, useEffect, useRef } from "react";
 
/* ══════════════════════════════════════
   占術ユーティリティ
══════════════════════════════════════ */
const STEMS    = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEM_EL  = ["木","木","火","火","土","土","金","金","水","水"];
const BRANCH_EL= ["水","土","木","木","土","火","火","土","金","金","土","水"];
 
function calcMeishiki(y,m,d,h=12){
  const adjY=(m<2||(m===2&&d<4))?y-1:y;
  const yIdx=((adjY-1924)%60+60)%60;
  const yP=STEMS[yIdx%10]+BRANCHES[yIdx%12];
  const mBR=["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
  const sol=[4,6,6,5,6,6,7,8,8,8,7,7];
  const adjM=d<sol[m-1]?m-1:m;
  const mIdx=((adjM-1)+12)%12;
  const mP=STEMS[([2,4,6,8,0,2,4,6,8,0][yIdx%10]+mIdx)%10]+mBR[mIdx];
  const base=new Date(1924,0,1);
  const dIdx=((Math.floor((new Date(y,m-1,d)-base)/86400000)%60)+60)%60;
  const dP=STEMS[dIdx%10]+BRANCHES[dIdx%12];
  const hIdx=Math.floor(((h+1)%24)/2);
  const hP=STEMS[([0,2,4,6,8,0,2,4,6,8][dIdx%10]+hIdx)%10]+["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"][hIdx];
  const els=[yP,mP,dP,hP].flatMap(p=>[STEM_EL[STEMS.indexOf(p[0])],BRANCH_EL[BRANCHES.indexOf(p[1])]]);
  const elC={};els.forEach(e=>{elC[e]=(elC[e]||0)+1;});
  return {yearPillar:yP,monthPillar:mP,dayPillar:dP,hourPillar:hP,elCount:elC};
}
function getDayPillar(date){
  const base=new Date(1924,0,1);
  const idx=((Math.floor((date-base)/86400000)%60)+60)%60;
  return STEMS[idx%10]+BRANCHES[idx%12];
}
function getMoonPhase(y,m,d){
  const base=new Date(2000,0,6);
  const age=((Math.floor((new Date(y,m-1,d)-base)/86400000)%29.53)+29.53)%29.53;
  const phases=[{t:1.85,n:"新月",e:"🌑",d:"新たな意図を立てる時"},{t:5.54,n:"三日月",e:"🌒",d:"芽吹き・行動の時"},{t:9.22,n:"上弦の月",e:"🌓",d:"決断・前進の時"},{t:12.91,n:"十三夜",e:"🌔",d:"蓄積・充実の時"},{t:16.61,n:"満月",e:"🌕",d:"完成・感謝の時"},{t:20.30,n:"十六夜",e:"🌖",d:"振り返りの時"},{t:23.99,n:"下弦の月",e:"🌗",d:"手放し・整理の時"},{t:27.68,n:"有明月",e:"🌘",d:"休息・内省の時"},{t:99,n:"晦日月",e:"🌑",d:"完了・準備の時"}];
  return phases.find(p=>age<p.t)||phases[phases.length-1];
}
function getSekki(m,d){
  const L=[[1,6,"小寒","寒気の極み"],[1,20,"大寒","最も寒い時"],[2,4,"立春","春の気が満ちる"],[2,19,"雨水","雪が雨へ"],[3,6,"啓蟄","虫が目覚める"],[3,21,"春分","昼夜等しく"],[4,5,"清明","万物が輝く"],[4,20,"穀雨","恵みの雨"],[5,6,"立夏","夏の始まり"],[5,21,"小満","草木生い茂る"],[6,6,"芒種","種まきの時"],[6,21,"夏至","最も昼が長い"],[7,7,"小暑","暑さが本格化"],[7,23,"大暑","最も暑い時"],[8,7,"立秋","秋の兆し"],[8,23,"処暑","暑さが和らぐ"],[9,8,"白露","朝露が光る"],[9,23,"秋分","昼夜再び等しく"],[10,8,"寒露","冷たい露"],[10,23,"霜降","霜が降りる"],[11,7,"立冬","冬の始まり"],[11,22,"小雪","雪が降り始める"],[12,7,"大雪","雪が本格化"],[12,22,"冬至","最も夜が長い"]];
  let c=L[L.length-1];
  for(const s of L){if(m>s[0]||(m===s[0]&&d>=s[1]))c=s;}
  return {name:c[2],desc:c[3]};
}
function getTensei(y,m,d){
  const S=["一白水星","二黒土星","三碧木星","四緑木星","五黄土星","六白金星","七赤金星","八白土星","九紫火星"];
  const M=["水の流れ・直感","大地の力・忍耐","木の芽吹き・前進","風の調和・信頼","土の中心・変化","金の決断・正義","赤い炎・喜び","白い大地・変革","紫の炎・洞察"];
  const adjY=(m>2||(m===2&&d>=4))?y:y-1;
  const i=((1984-adjY)%9+9)%9;
  return {name:S[i],meaning:M[i]};
}
function getZodiac(m,d){
  const Z=[["山羊座",12,22],["水瓶座",1,20],["魚座",2,19],["牡羊座",3,21],["牡牛座",4,20],["双子座",5,21],["蟹座",6,21],["獅子座",7,23],["乙女座",8,23],["天秤座",9,23],["蠍座",10,23],["射手座",11,22]];
  for(let i=0;i<Z.length;i++){const[n,sm,sd]=Z[i];if(m===sm&&d>=sd)return n;if(i>0){const[,pm,pd]=Z[i-1];if(m===pm&&d<sd&&d>=pd)return n;}}
  return "山羊座";
}
function getTodayAll(){
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth()+1,d=now.getDate();
  const dp=getDayPillar(now);
  return {y,m,d,dateStr:`${y}年${m}月${d}日（${"日月火水木金土"[now.getDay()]}）`,dayPillar:dp,stem:dp[0],branch:dp[1],moon:getMoonPhase(y,m,d),sekki:getSekki(m,d),tensei:getTensei(y,m,d)};
}
 
/* ══════════════════════════════════════
   宇宙×道教神殿 Canvas背景
══════════════════════════════════════ */
function TempleCanvas(){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let W=canvas.width=window.innerWidth,H=canvas.height=window.innerHeight;
 
    // 星
    const stars=Array.from({length:300},()=>({
      x:Math.random()*W,y:Math.random()*H,
      r:Math.random()*1.5+0.2,
      ph:Math.random()*Math.PI*2,sp:Math.random()*0.3+0.05,
      gold:Math.random()<0.08
    }));
 
    // 流星
    const meteors=Array.from({length:3},()=>({
      x:Math.random()*W,y:Math.random()*H*0.5,
      len:60+Math.random()*80,speed:2+Math.random()*3,
      timer:Math.random()*300
    }));
 
    // 龍のパーティクル
    const dragonPts=Array.from({length:40},(_,i)=>({
      angle:i*(Math.PI*2/40),r:0,baseR:80+Math.random()*40,
      sp:0.008+Math.random()*0.004,ph:Math.random()*Math.PI*2
    }));
 
    let fr,t=0;
    const draw=()=>{
      t++;
      ctx.clearRect(0,0,W,H);
 
      // 深宇宙グラデーション
      const bg=ctx.createRadialGradient(W/2,H*0.3,0,W/2,H*0.3,W*0.8);
      bg.addColorStop(0,"rgba(30,8,50,0.6)");
      bg.addColorStop(0.4,"rgba(15,3,30,0.4)");
      bg.addColorStop(1,"rgba(5,0,15,0.3)");
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 
      // 金の霧（道教的）
      const mist=ctx.createRadialGradient(W/2,H*0.4,0,W/2,H*0.4,W*0.6);
      mist.addColorStop(0,"rgba(180,120,20,0.04)");
      mist.addColorStop(0.5,"rgba(120,60,0,0.02)");
      mist.addColorStop(1,"transparent");
      ctx.fillStyle=mist;ctx.fillRect(0,0,W,H);
 
      // 星
      stars.forEach(s=>{
        const o=0.3+0.5*Math.sin(t*0.01*s.sp+s.ph);
        ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=s.gold?`rgba(255,200,80,${o})`:`rgba(200,180,255,${o})`;
        ctx.fill();
      });
 
      // 流星
      meteors.forEach(me=>{
        me.timer--;
        if(me.timer<=0){me.x=Math.random()*W;me.y=Math.random()*H*0.3;me.timer=200+Math.random()*400;}
        const p=Math.max(0,1-me.timer/20);
        if(p>0){
          ctx.beginPath();
          ctx.moveTo(me.x,me.y);
          ctx.lineTo(me.x-me.len*p,me.y+me.len*p*0.4);
          const mg=ctx.createLinearGradient(me.x,me.y,me.x-me.len*p,me.y+me.len*p*0.4);
          mg.addColorStop(0,`rgba(255,220,100,${p*0.8})`);
          mg.addColorStop(1,"transparent");
          ctx.strokeStyle=mg;ctx.lineWidth=1.5;ctx.stroke();
        }
        me.x+=me.speed*0.5;me.y+=me.speed*0.3;
      });
 
      // 中央の宇宙龍オーブ
      const cx=W/2,cy=H*0.18;
      dragonPts.forEach(p=>{
        p.angle+=p.sp;
        p.r=p.baseR+Math.sin(t*0.02+p.ph)*15;
        const x=cx+Math.cos(p.angle)*p.r;
        const y=cy+Math.sin(p.angle)*p.r*0.4;
        const o=0.3+0.4*Math.sin(t*0.03+p.ph);
        ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,180,50,${o})`;ctx.fill();
      });
 
      // 中心の輝き
      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,60);
      glow.addColorStop(0,"rgba(255,200,80,0.15)");
      glow.addColorStop(0.4,"rgba(200,100,20,0.08)");
      glow.addColorStop(1,"transparent");
      ctx.fillStyle=glow;ctx.fillRect(cx-80,cy-80,160,160);
 
      fr=requestAnimationFrame(draw);
    };
    fr=requestAnimationFrame(draw);
    const rs=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;};
    window.addEventListener("resize",rs);
    return()=>{cancelAnimationFrame(fr);window.removeEventListener("resize",rs);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}
 
/* ══════════════════════════════════════
   神殿の柱（SVG）
══════════════════════════════════════ */
function TemplePillars(){
  return (
    <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden"}}>
      {/* 左柱 */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:52,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:38,flex:1,background:"linear-gradient(90deg,rgba(80,50,10,0.6),rgba(160,110,30,0.4),rgba(80,50,10,0.6))",borderRight:"1px solid rgba(200,150,40,0.3)",boxShadow:"inset -4px 0 12px rgba(0,0,0,0.5),4px 0 20px rgba(180,120,20,0.15)"}}/>
        {[0.15,0.3,0.45,0.6,0.75].map((pos,i)=>(
          <div key={i} style={{position:"absolute",top:`${pos*100}%`,left:6,right:6,height:2,background:"linear-gradient(90deg,transparent,rgba(220,160,40,0.6),transparent)"}}/>
        ))}
        <div style={{position:"absolute",top:"25%",fontSize:18,color:"rgba(220,160,40,0.5)",transform:"rotate(-5deg)",filter:"drop-shadow(0 0 4px rgba(220,160,40,0.4))"}}>☰</div>
        <div style={{position:"absolute",top:"55%",fontSize:18,color:"rgba(220,160,40,0.4)",transform:"rotate(5deg)"}}>☷</div>
      </div>
      {/* 右柱 */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:52,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:38,flex:1,background:"linear-gradient(270deg,rgba(80,50,10,0.6),rgba(160,110,30,0.4),rgba(80,50,10,0.6))",borderLeft:"1px solid rgba(200,150,40,0.3)",boxShadow:"inset 4px 0 12px rgba(0,0,0,0.5),-4px 0 20px rgba(180,120,20,0.15)"}}/>
        {[0.15,0.3,0.45,0.6,0.75].map((pos,i)=>(
          <div key={i} style={{position:"absolute",top:`${pos*100}%`,left:6,right:6,height:2,background:"linear-gradient(90deg,transparent,rgba(220,160,40,0.6),transparent)"}}/>
        ))}
        <div style={{position:"absolute",top:"25%",fontSize:18,color:"rgba(220,160,40,0.5)",transform:"rotate(5deg)",filter:"drop-shadow(0 0 4px rgba(220,160,40,0.4))"}}>☵</div>
        <div style={{position:"absolute",top:"55%",fontSize:18,color:"rgba(220,160,40,0.4)",transform:"rotate(-5deg)"}}>☲</div>
      </div>
      {/* 上部横梁 */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:8,background:"linear-gradient(180deg,rgba(160,110,30,0.5),transparent)",boxShadow:"0 4px 20px rgba(180,120,20,0.2)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:6,background:"linear-gradient(0deg,rgba(160,110,30,0.4),transparent)"}}/>
    </div>
  );
}
 
/* ══════════════════════════════════════
   燃える炎（CSS）
══════════════════════════════════════ */
function Flame({style={}}){
  return (
    <div style={{position:"relative",width:20,height:32,...style}}>
      <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:10,height:24,borderRadius:"50% 50% 20% 20%",background:"linear-gradient(180deg,#ff6b00,#ff3800,#ff0000)",animation:"flicker 0.8s ease-in-out infinite alternate",filter:"blur(1px)",boxShadow:"0 0 8px rgba(255,100,0,0.8),0 0 16px rgba(255,60,0,0.4)"}}/>
      <div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:6,height:16,borderRadius:"50% 50% 20% 20%",background:"linear-gradient(180deg,#fff,#ffdd00,#ff8800)",animation:"flicker 0.6s ease-in-out infinite alternate-reverse",filter:"blur(0.5px)"}}/>
    </div>
  );
}
 
/* ══════════════════════════════════════
   燃える炎（CSS）
══════════════════════════════════════ */
function Flame({style={}}){
  return (
    <div style={{position:"relative",width:20,height:32,...style}}>
      <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:10,height:24,borderRadius:"50% 50% 20% 20%",background:"linear-gradient(180deg,#ff6b00,#ff3800,#ff0000)",animation:"flicker 0.8s ease-in-out infinite alternate",filter:"blur(1px)",boxShadow:"0 0 8px rgba(255,100,0,0.8),0 0 16px rgba(255,60,0,0.4)"}}/>
      <div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:6,height:16,borderRadius:"50% 50% 20% 20%",background:"linear-gradient(180deg,#fff,#ffdd00,#ff8800)",animation:"flicker 0.6s ease-in-out infinite alternate-reverse",filter:"blur(0.5px)"}}/>
    </div>
  );
}
 
/* ══════════════════════════════════════
   香炉（装飾）
══════════════════════════════════════ */
function Incense(){
  return (
    <div style={{display:"flex",justifyContent:"center",gap:40,marginBottom:8,position:"relative",zIndex:2}}>
      {[0,1].map(i=>(
        <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <Flame/>
          <div style={{width:14,height:20,background:"linear-gradient(180deg,rgba(140,90,20,0.8),rgba(100,60,10,0.9))",borderRadius:"2px 2px 4px 4px",border:"1px solid rgba(200,150,40,0.4)"}}/>
          <div style={{width:22,height:6,background:"linear-gradient(180deg,rgba(160,110,30,0.7),rgba(120,80,15,0.8))",borderRadius:"3px 3px 0 0",border:"1px solid rgba(200,150,40,0.3)",marginTop:-1}}/>
        </div>
      ))}
    </div>
  );
}
 
/* ══════════════════════════════════════
   太極図（中央神像シンボル）
══════════════════════════════════════ */
function TaijiFull(){
  return (
    <div style={{position:"relative",width:90,height:90,margin:"0 auto 8px",animation:"slowSpin 20s linear infinite"}}>
      <svg viewBox="0 0 100 100" style={{width:"100%",height:"100%",filter:"drop-shadow(0 0 12px rgba(220,160,40,0.6)) drop-shadow(0 0 24px rgba(180,100,20,0.4))"}}>
        <defs>
          <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8e0"/>
            <stop offset="40%" stopColor="#f0c040"/>
            <stop offset="100%" stopColor="#8b5e10"/>
          </radialGradient>
          <radialGradient id="darkGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a0a30"/>
            <stop offset="100%" stopColor="#050010"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(220,160,40,0.5)" strokeWidth="1.5"/>
        <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2 Z" fill="url(#goldGrad)" opacity="0.85"/>
        <path d="M50,2 A48,48 0 0,0 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2 Z" fill="url(#darkGrad)" opacity="0.9"/>
        <circle cx="50" cy="26" r="8" fill="url(#darkGrad)"/>
        <circle cx="50" cy="74" r="8" fill="url(#goldGrad)" opacity="0.85"/>
        <circle cx="50" cy="26" r="3" fill="url(#goldGrad)" opacity="0.9"/>
        <circle cx="50" cy="74" r="3" fill="url(#darkGrad)"/>
      </svg>
    </div>
  );
}
 
/* ══════════════════════════════════════
   天象バナー
══════════════════════════════════════ */
function TodayBanner({today}){
  return (
    <div style={{background:"linear-gradient(135deg,rgba(30,15,5,0.9),rgba(20,8,3,0.95))",border:"1px solid rgba(200,150,40,0.35)",borderRadius:14,padding:"14px 18px",marginBottom:18,backdropFilter:"blur(12px)",boxShadow:"0 4px 20px rgba(0,0,0,0.5),inset 0 1px 0 rgba(220,160,40,0.2)"}}>
      <div style={{fontSize:10,letterSpacing:"0.5em",color:"rgba(220,160,40,0.55)",marginBottom:12,textAlign:"center",fontFamily:"serif"}}>今日の天象</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[
          {icon:today.moon.e,title:today.moon.n,sub:today.moon.d,color:"rgba(200,180,255,0.8)"},
          {icon:"🌿",title:today.sekki.name,sub:today.sekki.desc,color:"rgba(120,200,120,0.8)"},
          {icon:"⭐",title:today.tensei.name,sub:today.tensei.meaning,color:"rgba(220,180,60,0.8)"},
        ].map((item,i)=>(
          <div key={i} style={{textAlign:"center",background:"rgba(0,0,0,0.3)",borderRadius:10,padding:"10px 6px",border:"1px solid rgba(200,150,40,0.15)"}}>
            <div style={{fontSize:18,marginBottom:4}}>{item.icon}</div>
            <div style={{fontSize:10,color:item.color,marginBottom:2,letterSpacing:"0.05em"}}>{item.title}</div>
            <div style={{fontSize:8.5,color:"rgba(180,140,80,0.6)",lineHeight:1.4}}>{item.sub}</div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:10,fontSize:10,color:"rgba(200,150,40,0.5)",letterSpacing:"0.15em"}}>
        {today.dateStr}　日干支 <span style={{color:"rgba(220,170,60,0.8)"}}>{today.dayPillar}</span>
      </div>
    </div>
  );
}
 
/* ══════════════════════════════════════
   スコア
══════════════════════════════════════ */
function GoldStars({score=3}){
  return (
    <div style={{display:"flex",gap:1,justifyContent:"center"}}>
      {[1,2,3,4,5].map(i=><span key={i} style={{fontSize:9,color:i<=score?"#f0c040":"rgba(180,140,40,0.2)",filter:i<=score?"drop-shadow(0 0 3px rgba(220,160,40,0.6))":"none"}}>★</span>)}
    </div>
  );
}
 
/* ══════════════════════════════════════
   運勢アイテム（神殿スタイル）
══════════════════════════════════════ */
function FortuneItem({icon,label,value,score}){
  return (
    <div style={{background:"linear-gradient(135deg,rgba(20,10,3,0.8),rgba(30,15,5,0.7))",border:"1px solid rgba(200,150,40,0.2)",borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"flex-start",gap:12,boxShadow:"inset 0 1px 0 rgba(220,160,40,0.08)"}}>
      <div style={{minWidth:46,textAlign:"center",paddingTop:2}}>
        <div style={{fontSize:13,color:"#d4a830",marginBottom:3,filter:"drop-shadow(0 0 4px rgba(200,140,20,0.6))"}}>{icon}</div>
        <div style={{fontSize:9,color:"rgba(200,160,60,0.7)",marginBottom:3,letterSpacing:"0.05em"}}>{label}</div>
        <GoldStars score={score}/>
      </div>
      <div style={{fontSize:12.5,color:"rgba(230,200,140,0.9)",lineHeight:1.9,flex:1,fontFamily:"'Hiragino Mincho ProN','Yu Mincho',serif"}}>{value}</div>
    </div>
  );
}
 
/* ══════════════════════════════════════
   3占術タブカード（神殿スタイル）
══════════════════════════════════════ */
function ThreeWayCard({data,title}){
  const [tab,setTab]=useState("shichu");
  const tabs=[{id:"shichu",label:"四柱推命",icon:"☯"},{id:"shibi",label:"紫微斗数",icon:"✦"},{id:"seiyou",label:"西洋占星術",icon:"☽"}];
  const areas=[{key:"work",label:"仕事運",icon:"◈"},{key:"money",label:"金運",icon:"◇"},{key:"health",label:"健康運",icon:"❋"},{key:"love",label:"恋愛運",icon:"♡"}];
  const cur=data[tab]||{};
  return (
    <div style={{background:"linear-gradient(180deg,rgba(20,8,2,0.92),rgba(15,5,1,0.95))",border:"1px solid rgba(200,150,40,0.28)",borderRadius:14,padding:"18px",marginBottom:12,backdropFilter:"blur(12px)",boxShadow:"0 8px 30px rgba(0,0,0,0.6),inset 0 1px 0 rgba(220,160,40,0.15)"}}>
      {title&&<div style={{fontSize:12,letterSpacing:"0.3em",color:"rgba(220,170,60,0.8)",marginBottom:14,textAlign:"center",fontFamily:"serif",borderBottom:"1px solid rgba(200,150,40,0.15)",paddingBottom:10}}>{title}</div>}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 4px",background:tab===t.id?"linear-gradient(135deg,rgba(120,80,10,0.7),rgba(80,50,5,0.8))":"rgba(0,0,0,0.3)",border:tab===t.id?"1px solid rgba(220,160,40,0.6)":"1px solid rgba(180,130,30,0.2)",borderRadius:8,color:tab===t.id?"#f0c040":"rgba(180,140,60,0.6)",fontSize:11,cursor:"pointer",transition:"all 0.25s",fontFamily:"serif",letterSpacing:"0.05em",boxShadow:tab===t.id?"0 0 10px rgba(180,120,20,0.3)":"none"}}><span style={{marginRight:3}}>{t.icon}</span>{t.label}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
        {areas.map(a=><FortuneItem key={a.key} icon={a.icon} label={a.label} value={cur[a.key]||"―"} score={cur[a.key+"_score"]||3}/>)}
      </div>
      {cur.note&&<div style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(200,150,40,0.2)",borderRadius:8,padding:"11px 13px",borderLeft:"2px solid rgba(200,150,40,0.5)"}}>
        <div style={{fontSize:9,letterSpacing:"0.2em",color:"rgba(200,150,40,0.5)",marginBottom:5}}>{tabs.find(t=>t.id===tab)?.icon} 総評</div>
        <p style={{margin:0,fontSize:12,lineHeight:1.9,color:"rgba(220,190,120,0.85)",fontFamily:"serif"}}>{cur.note}</p>
      </div>}
    </div>
  );
}
 
/* ══════════════════════════════════════
   ひと言アドバイスカード
══════════════════════════════════════ */
function AdviceCard({advice}){
  return (
    <div style={{background:"linear-gradient(135deg,rgba(40,20,3,0.95),rgba(25,10,2,0.98))",border:"1px solid rgba(220,160,40,0.45)",borderRadius:14,padding:"20px 22px",marginBottom:12,backdropFilter:"blur(12px)",boxShadow:"0 0 30px rgba(180,120,20,0.2),inset 0 1px 0 rgba(220,160,40,0.2)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:18,filter:"drop-shadow(0 0 8px rgba(220,160,40,0.8))",animation:"float 3s ease-in-out infinite",color:"#f0c040"}}>✦</span>
        <div style={{fontSize:12,letterSpacing:"0.3em",color:"rgba(220,170,60,0.85)",fontFamily:"serif"}}>今日のひと言</div>
      </div>
      <p style={{margin:0,fontSize:14,lineHeight:2.1,color:"rgba(240,215,160,0.95)",fontFamily:"'Hiragino Mincho ProN','Yu Mincho',serif",textAlign:"center",fontStyle:"italic"}}>{advice}</p>
    </div>
  );
}
 
/* ══════════════════════════════════════
   開運アドバイスカード
══════════════════════════════════════ */
function KaiUnCard({kaiun}){
  const items=[{label:"ラッキーカラー",icon:"◈",v:kaiun.color},{label:"ラッキー方角",icon:"◇",v:kaiun.direction},{label:"ラッキー数字",icon:"◉",v:kaiun.number},{label:"ラッキーフード",icon:"❋",v:kaiun.food},{label:"開運行動",icon:"✦",v:kaiun.action},{label:"今日の注意",icon:"☽",v:kaiun.avoid}];
  return (
    <div style={{background:"linear-gradient(180deg,rgba(20,8,2,0.92),rgba(15,5,1,0.95))",border:"1px solid rgba(200,150,40,0.28)",borderRadius:14,padding:"18px",marginBottom:12,backdropFilter:"blur(12px)"}}>
      <div style={{fontSize:12,letterSpacing:"0.3em",color:"rgba(220,170,60,0.8)",marginBottom:14,textAlign:"center",fontFamily:"serif",borderBottom:"1px solid rgba(200,150,40,0.15)",paddingBottom:10}}>開運アドバイス</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {items.map(item=>(
          <div key={item.label} style={{background:"rgba(0,0,0,0.35)",border:"1px solid rgba(180,130,30,0.18)",borderRadius:9,padding:"10px 11px",boxShadow:"inset 0 1px 0 rgba(200,150,40,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
              <span style={{fontSize:10,color:"#d4a830"}}>{item.icon}</span>
              <span style={{fontSize:9,color:"rgba(200,160,60,0.6)",letterSpacing:"0.08em"}}>{item.label}</span>
            </div>
            <div style={{fontSize:12.5,color:"rgba(240,210,140,0.9)",lineHeight:1.5,fontWeight:"500",fontFamily:"serif"}}>{item.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
/* ══════════════════════════════════════
   入力スタイル
══════════════════════════════════════ */
const IS={background:"rgba(10,5,1,0.8)",border:"1px solid rgba(180,130,30,0.35)",borderRadius:9,padding:"11px 13px",color:"rgba(230,200,140,0.9)",fontSize:13.5,width:"100%",boxSizing:"border-box",fontFamily:"'Hiragino Mincho ProN','Yu Mincho',serif"};
const fIn=e=>{e.target.style.borderColor="rgba(220,160,40,0.7)";e.target.style.boxShadow="0 0 12px rgba(180,120,20,0.2)";};
const fOut=e=>{e.target.style.borderColor="rgba(180,130,30,0.35)";e.target.style.boxShadow="none";};
 
/* ══════════════════════════════════════
   メインアプリ
══════════════════════════════════════ */
export default function App(){
  const [phase,setPhase]=useState("input");
  const [form,setForm]=useState({name:"",gender:"female",by:"",bm:"",bd:"",bh:"",bplace:"",worry:""});
  const [error,setError]=useState("");
  const [result,setResult]=useState(null);
  const [rtab,setRtab]=useState("today");
  const today=getTodayAll();
 
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const setG=v=>setForm(f=>({...f,gender:v}));
 
  const handleSubmit=async()=>{
    if(!form.name.trim()||!form.by||!form.bm||!form.bd){setError("お名前と生年月日は必須です");return;}
    setError("");setPhase("loading");
    const by=parseInt(form.by),bm=parseInt(form.bm),bd=parseInt(form.bd),bh=form.bh?parseInt(form.bh):12;
    const ms=calcMeishiki(by,bm,bd,bh);
    const zodiac=getZodiac(bm,bd);
 
    const prompt=`あなたは四柱推命・紫微斗数・西洋占星術に精通したプロの占い師です。
 
【鑑定対象者】
名前: ${form.name} 様　性別: ${form.gender==="male"?"男性":form.gender==="female"?"女性":"その他"}
生年月日: ${by}年${bm}月${bd}日${form.bh?` ${bh}時`:""}　出生地: ${form.bplace||"不明"}
命式: 年柱${ms.yearPillar} 月柱${ms.monthPillar} 日柱${ms.dayPillar} 時柱${ms.hourPillar}
五行: ${Object.entries(ms.elCount).map(([k,v])=>`${k}${v}`).join("・")}　太陽星座: ${zodiac}
 
【今日の天象】
日付: ${today.dateStr}　日干支: ${today.dayPillar}
月の満ち欠け: ${today.moon.n}　二十四節気: ${today.sekki.name}　天星: ${today.tensei.name}
 
${form.worry?`【今この方の悩み】「${form.worry}」→各運勢の中で具体的に答えてください。`:""}
 
${form.name}様と名前を自然に織り込み、温かく寄り添う言葉で。必ず希望と光で締めくくること。
今日の天象を全て運勢に反映させること。
 
JSONのみ返答:
{"today":{"shichu":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."},"shibi":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."},"seiyou":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."}},"month":{"shichu":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."},"shibi":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."},"seiyou":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."}},"year":{"shichu":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."},"shibi":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."},"seiyou":{"work":"...","work_score":3,"money":"...","money_score":3,"health":"...","health_score":3,"love":"...","love_score":3,"note":"..."}},"advice":"今日のひと言（80字以内）","kaiun":{"color":"...","direction":"...","number":"...","food":"...","action":"...","avoid":"..."}}
各運勢40字以内、総評70字以内、開運各20字以内。`;
 
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const text=data.content?.find(c=>c.type==="text")?.text||"";
      const m=text.match(/\{[\s\S]*\}/);
      if(!m)throw new Error("no json");
      setResult({...JSON.parse(m[0]),name:form.name,zodiac,meishiki:ms,by,bm,bd,bh});
      setPhase("result");
    }catch{
      setError("鑑定中にエラーが発生しました。もう一度お試しください。");
      setPhase("input");
    }
  };
 
  const reset=()=>{setPhase("input");setResult(null);setError("");setRtab("today");};
 
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0205 0%,#050110 40%,#020008 100%)",fontFamily:"'Hiragino Mincho ProN','Yu Mincho','Times New Roman',serif",color:"rgba(230,200,140,0.9)",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes slowSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes flicker{0%{transform:scaleX(1) scaleY(1)}50%{transform:scaleX(0.85) scaleY(1.1)}100%{transform:scaleX(1.1) scaleY(0.95)}}
        @keyframes gateGlow{0%,100%{box-shadow:0 0 20px rgba(180,120,20,0.2)}50%{box-shadow:0 0 40px rgba(220,160,40,0.4)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        input::placeholder,textarea::placeholder{color:rgba(180,140,60,0.35)}
        input,textarea,button{outline:none}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(180,130,30,0.4);border-radius:2px}
      `}</style>
 
      <TempleCanvas/>
      <TemplePillars/>
 
      <div style={{position:"relative",zIndex:2,maxWidth:580,margin:"0 auto",padding:"24px 60px 60px"}}>
 
        {/* ヘッダー神殿 */}
        <div style={{textAlign:"center",marginBottom:20,animation:"fadeUp 1s ease"}}>
          <Incense/>
          <TaijiFull/>
          <div style={{fontSize:9,letterSpacing:"0.8em",color:"rgba(200,150,40,0.5)",marginBottom:10,fontFamily:"serif"}}>CELESTIAL FORTUNE TEMPLE</div>
          <h1 style={{fontSize:22,fontWeight:400,letterSpacing:"0.6em",margin:"0 0 6px",background:"linear-gradient(135deg,#fff8e0,#f0c040,#c08010,#f0c040,#fff8e0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 0 8px rgba(180,120,20,0.5))"}}>星　命　占　い</h1>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6}}>
            <div style={{height:1,width:40,background:"linear-gradient(90deg,transparent,rgba(200,150,40,0.5))"}}/>
            <span style={{fontSize:12,color:"rgba(200,150,40,0.5)"}}>☰ ☵ ☲ ☷</span>
            <div style={{height:1,width:40,background:"linear-gradient(90deg,rgba(200,150,40,0.5),transparent)"}}/>
          </div>
          <p style={{fontSize:10,color:"rgba(180,140,60,0.55)",letterSpacing:"0.25em"}}>四柱推命 × 紫微斗数 × 西洋占星術</p>
        </div>
 
        {/* 天象バナー */}
        <TodayBanner today={today}/>
 
        {/* 入力フォーム */}
        {phase==="input"&&(
          <div style={{animation:"fadeUp 0.7s ease"}}>
            <div style={{background:"linear-gradient(180deg,rgba(15,6,1,0.95),rgba(10,4,1,0.98))",border:"1px solid rgba(200,150,40,0.3)",borderRadius:16,padding:"24px 22px",backdropFilter:"blur(16px)",boxShadow:"0 8px 40px rgba(0,0,0,0.7),inset 0 1px 0 rgba(220,160,40,0.15)",animation:"gateGlow 4s ease-in-out infinite"}}>
              <div style={{fontSize:11,letterSpacing:"0.3em",color:"rgba(200,150,40,0.6)",textAlign:"center",marginBottom:18,fontFamily:"serif"}}>― 鑑定受付 ―</div>
 
              <label style={{display:"block",fontSize:9,letterSpacing:"0.25em",color:"rgba(200,160,60,0.65)",marginBottom:5,fontFamily:"serif"}}>御名前 ＊</label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="例：鈴木 一郎" style={{...IS,marginBottom:14}} onFocus={fIn} onBlur={fOut}/>
 
              <label style={{display:"block",fontSize:9,letterSpacing:"0.25em",color:"rgba(200,160,60,0.65)",marginBottom:5,fontFamily:"serif"}}>性別</label>
              <div style={{display:"flex",gap:7,marginBottom:14}}>
                {[{v:"female",l:"女性"},{v:"male",l:"男性"},{v:"other",l:"その他"}].map(g=>(
                  <button key={g.v} onClick={()=>setG(g.v)} style={{flex:1,padding:"10px 6px",background:form.gender===g.v?"linear-gradient(135deg,rgba(100,65,8,0.8),rgba(70,40,5,0.9))":"rgba(0,0,0,0.4)",border:form.gender===g.v?"1px solid rgba(220,160,40,0.6)":"1px solid rgba(180,130,30,0.22)",borderRadius:8,color:form.gender===g.v?"#f0c040":"rgba(180,140,60,0.55)",fontSize:13,cursor:"pointer",transition:"all 0.25s",fontFamily:"serif",boxShadow:form.gender===g.v?"0 0 10px rgba(180,120,20,0.3)":"none"}}>{g.l}</button>
                ))}
              </div>
 
              <label style={{display:"block",fontSize:9,letterSpacing:"0.25em",color:"rgba(200,160,60,0.65)",marginBottom:5,fontFamily:"serif"}}>御生年月日 ＊</label>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:6,marginBottom:12}}>
                {[{v:form.by,k:"by",p:"西暦（例：1985）"},{v:form.bm,k:"bm",p:"月"},{v:form.bd,k:"bd",p:"日"}].map(f=>(
                  <input key={f.k} type="number" value={f.v} onChange={set(f.k)} placeholder={f.p} style={IS} onFocus={fIn} onBlur={fOut}/>
                ))}
              </div>
 
              <label style={{display:"block",fontSize:9,letterSpacing:"0.25em",color:"rgba(200,160,60,0.65)",marginBottom:5,fontFamily:"serif"}}>
                出生時刻 <span style={{color:"rgba(160,120,40,0.4)",fontSize:8}}>（任意）</span>
              </label>
              <input type="number" value={form.bh} onChange={set("bh")} placeholder="時（0〜23）" style={{...IS,marginBottom:12}} onFocus={fIn} onBlur={fOut}/>
 
              <label style={{display:"block",fontSize:9,letterSpacing:"0.25em",color:"rgba(200,160,60,0.65)",marginBottom:5,fontFamily:"serif"}}>
                出生地 <span style={{color:"rgba(160,120,40,0.4)",fontSize:8}}>（任意）</span>
              </label>
              <input type="text" value={form.bplace} onChange={set("bplace")} placeholder="例：東京都新宿区" style={{...IS,marginBottom:16}} onFocus={fIn} onBlur={fOut}/>
 
              <label style={{display:"block",fontSize:9,letterSpacing:"0.25em",color:"rgba(200,160,60,0.65)",marginBottom:5,fontFamily:"serif"}}>
                今、心にあること <span style={{color:"rgba(160,120,40,0.4)",fontSize:8}}>（任意）</span>
              </label>
              <textarea value={form.worry} onChange={set("worry")} rows={3}
                placeholder={"仕事、恋愛、将来への不安…\nどんな小さなことでも大丈夫です。"}
                style={{...IS,resize:"vertical",lineHeight:1.8,marginBottom:18,fontFamily:"'Hiragino Mincho ProN','Yu Mincho',serif"}} onFocus={fIn} onBlur={fOut}/>
 
              {error&&<p style={{color:"#d08040",fontSize:12,marginBottom:10,textAlign:"center",fontFamily:"serif"}}>{error}</p>}
 
              <button onClick={handleSubmit} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,rgba(100,60,8,0.9),rgba(140,90,10,0.85),rgba(100,60,8,0.9))",border:"1px solid rgba(220,160,40,0.5)",borderRadius:10,color:"#f0c040",fontSize:14,letterSpacing:"0.4em",cursor:"pointer",fontFamily:"'Hiragino Mincho ProN','Yu Mincho',serif",boxShadow:"0 0 25px rgba(160,100,15,0.4),inset 0 1px 0 rgba(240,200,80,0.2)",transition:"all 0.3s"}}
                onMouseOver={e=>{e.target.style.boxShadow="0 0 40px rgba(200,140,20,0.6),inset 0 1px 0 rgba(240,200,80,0.3)";}}
                onMouseOut={e=>{e.target.style.boxShadow="0 0 25px rgba(160,100,15,0.4),inset 0 1px 0 rgba(240,200,80,0.2)";}}>
                神託を受ける
              </button>
            </div>
          </div>
        )}
 
        {/* ローディング */}
        {phase==="loading"&&(
          <div style={{textAlign:"center",padding:"60px 20px",animation:"fadeUp 0.5s ease"}}>
            <TaijiFull/>
            <p style={{fontSize:13,letterSpacing:"0.3em",color:"rgba(200,160,60,0.7)",lineHeight:2,fontFamily:"serif"}}>
              天の声を聴いています…<br/>
              <span style={{fontSize:11,opacity:0.6}}>星命の理を読み解いています</span>
            </p>
          </div>
        )}
 
        {/* 結果 */}
        {phase==="result"&&result&&(
          <div style={{animation:"fadeUp 0.7s ease"}}>
            {/* 命式 */}
            <div style={{background:"linear-gradient(135deg,rgba(20,8,2,0.95),rgba(15,5,1,0.98))",border:"1px solid rgba(200,150,40,0.3)",borderRadius:12,padding:"14px 18px",marginBottom:14,textAlign:"center",boxShadow:"inset 0 1px 0 rgba(220,160,40,0.12)"}}>
              <div style={{fontSize:11,color:"rgba(220,170,60,0.7)",marginBottom:8,letterSpacing:"0.3em",fontFamily:"serif"}}>{result.name} 様の命式</div>
              <div style={{fontSize:14,color:"rgba(230,195,100,0.85)",letterSpacing:"0.15em",marginBottom:4,fontFamily:"serif"}}>
                {result.meishiki.yearPillar}　{result.meishiki.monthPillar}　{result.meishiki.dayPillar}{result.bh?`　${result.meishiki.hourPillar}`:""}
              </div>
              <div style={{fontSize:11,color:"rgba(180,140,60,0.55)",fontFamily:"serif"}}>{result.zodiac}　／　{Object.entries(result.meishiki.elCount).map(([k,v])=>`${k}${v}`).join("・")}</div>
            </div>
 
            {/* ひと言 */}
            {result.advice&&<AdviceCard advice={result.advice}/>}
 
            {/* 運勢タブ */}
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[{id:"today",l:"今日",i:"◐"},{id:"month",l:"今月",i:"◉"},{id:"year",l:"今年",i:"✦"}].map(t=>(
                <button key={t.id} onClick={()=>setRtab(t.id)} style={{flex:1,padding:"10px 5px",background:rtab===t.id?"linear-gradient(135deg,rgba(100,65,8,0.85),rgba(70,40,5,0.9))":"rgba(0,0,0,0.4)",border:rtab===t.id?"1px solid rgba(220,160,40,0.55)":"1px solid rgba(180,130,30,0.2)",borderRadius:8,color:rtab===t.id?"#f0c040":"rgba(180,140,60,0.55)",fontSize:12,cursor:"pointer",fontFamily:"serif",letterSpacing:"0.15em",transition:"all 0.25s",boxShadow:rtab===t.id?"0 0 12px rgba(180,120,20,0.35)":"none"}}><span style={{marginRight:4}}>{t.i}</span>{t.l}</button>
              ))}
            </div>
 
            {rtab==="today"&&result.today&&<ThreeWayCard data={result.today} title={`今日の運勢　${today.dateStr}`}/>}
            {rtab==="month"&&result.month&&<ThreeWayCard data={result.month} title={`${today.y}年${today.m}月の運勢`}/>}
            {rtab==="year"&&result.year&&<ThreeWayCard data={result.year} title={`${today.y}年の運勢`}/>}
 
            {result.kaiun&&<KaiUnCard kaiun={result.kaiun}/>}
 
            {/* フッター */}
            <div style={{textAlign:"center",padding:"16px",borderTop:"1px solid rgba(180,130,30,0.15)",marginTop:6}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6}}>
                <div style={{height:1,width:30,background:"linear-gradient(90deg,transparent,rgba(180,130,30,0.3))"}}/>
                <span style={{fontSize:12,color:"rgba(180,130,30,0.4)"}}>☰ ☷</span>
                <div style={{height:1,width:30,background:"linear-gradient(90deg,rgba(180,130,30,0.3),transparent)"}}/>
              </div>
              <p style={{fontSize:10,color:"rgba(160,120,40,0.4)",margin:0,fontFamily:"serif",letterSpacing:"0.1em"}}>※この鑑定は参考としてお楽しみください</p>
            </div>
 
            <button onClick={reset} style={{width:"100%",padding:"12px",marginTop:6,background:"transparent",border:"1px solid rgba(180,130,30,0.25)",borderRadius:10,color:"rgba(180,140,60,0.5)",fontSize:12,letterSpacing:"0.25em",cursor:"pointer",transition:"all 0.3s",fontFamily:"serif"}}
              onMouseOver={e=>{e.target.style.background="rgba(60,35,5,0.3)";e.target.style.borderColor="rgba(200,150,40,0.5)";e.target.style.color="rgba(220,170,60,0.8)";}}
              onMouseOut={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(180,130,30,0.25)";e.target.style.color="rgba(180,140,60,0.5)";}}>
              別の方を鑑定する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
