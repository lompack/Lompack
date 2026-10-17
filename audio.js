/* Lompack audio: original three-voice C64-inspired music and lightweight arcade SFX. */
(()=>{'use strict';
let ctx=null,bus=null,musicBus=null,fxBus=null,timer=null,step=0;
let musicOn=false,fxOn=true,tempo=150,voices=[],nodes=[];let selected=null;
const $=id=>document.getElementById(id);
const game=document.body.dataset.game||'arcade';
const patterns={
 zolyx:{bass:[36,36,43,36,41,41,43,41,38,38,45,38,43,43,45,43],lead:[72,0,76,79,72,0,74,76,69,0,72,76,71,0,74,79],arp:[60,64,67,72,65,69,72,77,62,65,69,74,67,71,74,79]},
 rps:{bass:[36,36,43,43,41,41,38,38],lead:[72,74,76,79,76,74,72,67],arp:[60,64,67,64,65,69,72,69]},
 wheel:{bass:[40,40,47,47,45,45,47,47],lead:[76,79,83,79,74,76,79,83],arp:[64,68,71,76,62,66,69,74]},
 solitaire:{bass:[45,45,52,52,50,50,52,52],lead:[69,72,76,72,67,69,72,76],arp:[57,60,64,69,55,59,62,67]}
};
const library=[
{id:'zolyx',title:'Neon Territory',mood:'Tense · Zolyx',bpm:160},
{id:'wheel',title:'Dragon Carnival',mood:'Playful · Dragon Wheel',bpm:144},
{id:'rps',title:'Three Beats',mood:'Punchy · Rock Paper Scissors',bpm:174},
{id:'solitaire',title:'Emerald Patience',mood:'Gentle · Solitaire',bpm:112},
{id:'orbit',title:'Pixel Orbit',mood:'Space adventure',bpm:148},
{id:'night',title:'Midnight Raster',mood:'Dreamy retro',bpm:104},
{id:'chase',title:'Turbo Chase',mood:'Fast arcade',bpm:188},
{id:'dawn',title:'8-Bit Sunrise',mood:'Warm synth',bpm:120}
];
patterns.orbit={bass:[33,33,40,40,36,36,43,43],lead:[69,72,76,81,79,76,72,67],arp:[57,60,64,69,60,64,67,72]};
patterns.night={bass:[38,38,45,45,36,36,43,43],lead:[74,0,72,69,67,0,69,72],arp:[62,65,69,74,60,64,67,72]};
patterns.chase={bass:[40,40,43,45,40,47,43,38],lead:[76,79,83,86,83,79,76,74],arp:[64,67,71,76,67,71,74,79]};
patterns.dawn={bass:[41,41,48,48,45,45,48,48],lead:[77,79,81,84,81,79,77,72],arp:[65,69,72,77,69,72,76,81]};
selected=library.some(x=>x.id===game)?game:'zolyx';
function init(){try{if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();bus=ctx.createGain();bus.gain.value=.28;bus.connect(ctx.destination);musicBus=ctx.createGain();musicBus.gain.value=.34;musicBus.connect(bus);fxBus=ctx.createGain();fxBus.gain.value=.65;fxBus.connect(bus)}if(ctx.state==='suspended')ctx.resume();return true}catch(e){return false}}
function note(m){return 440*Math.pow(2,(m-69)/12)}
function blip(hz,dur=.12,type='square',gain=.16,delay=0,endHz=0,output=fxBus){if(!init())return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(30,hz),t);if(endHz)o.frequency.exponentialRampToValueAtTime(Math.max(30,endHz),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(output);o.start(t);o.stop(t+dur+.02)}
function fx(kind){if(!fxOn)return;switch(kind){
case 'move':blip(190,.025,'triangle',.045);break;
case 'draw':blip(290,.06,'square',.075);break;
case 'capture':[440,554,659].forEach((n,i)=>blip(n,.19,'triangle',.14,i*.07));break;
case 'hurt':blip(260,.5,'sawtooth',.22,0,60);break;
case 'level':[523,659,784,1047].forEach((n,i)=>blip(n,.33,'square',.15,i*.13));break;
case 'win':[659,784,988].forEach((n,i)=>blip(n,.26,'triangle',.13,i*.1));break;
case 'lose':blip(340,.4,'sawtooth',.15,0,110);break;
case 'beat':blip(180,.09,'triangle',.1);break;
case 'pickup':blip(480,.065,'sine',.08);break;
}}
function playStep(){if(!musicOn||!init())return;const p=patterns[selected]||patterns.zolyx,k=step++;
 blip(note(p.bass[Math.floor(k/2)%p.bass.length]),.18,'triangle',.15,0,0,musicBus);
 const m=p.lead[Math.floor(k/2)%p.lead.length];if(m&&k%2===0)blip(note(m),.19,'square',.075,0,0,musicBus);
 blip(note(p.arp[k%p.arp.length]),.08,'sawtooth',.038,0,0,musicBus);
}
function stopMusic(){musicOn=false;if(timer){clearInterval(timer);timer=null}if(musicBus&&ctx){musicBus.gain.cancelScheduledValues(ctx.currentTime);musicBus.gain.setTargetAtTime(0,ctx.currentTime,.04)}sync()}
function chooseTrack(id){if(!patterns[id])return;selected=id;step=0;tempo=(library.find(x=>x.id===id)||{}).bpm||150;if(musicOn){if(timer)clearInterval(timer);playStep();timer=setInterval(playStep,60000/tempo/2)}sync()}
function toggleMusic(){if(musicOn){stopMusic();return}if(!init())return;musicOn=true;step=0;tempo=(library.find(x=>x.id===selected)||{}).bpm||150;musicBus.gain.setTargetAtTime(.34,ctx.currentTime,.04);playStep();timer=setInterval(playStep,60000/tempo/2);sync()}
function toggleFx(){fxOn=!fxOn;if(fxBus)fxBus.gain.value=fxOn?.65:0;sync()}
function sync(){const sel=$('lomTrack');if(sel)sel.value=selected;const a=$('lomMusic'),b=$('lomFx');if(a){a.textContent=musicOn?'♫ Music On':'♫ Music Off';a.setAttribute('aria-pressed',String(musicOn))}if(b){b.textContent=fxOn?'🔊 FX On':'🔇 FX Off';b.setAttribute('aria-pressed',String(fxOn))}}
const bar=document.createElement('div');bar.id='lomAudio';bar.style.cssText='display:flex;justify-content:center;gap:6px;align-items:center;padding:4px 8px;flex-wrap:wrap;font:12px system-ui;position:relative;z-index:5';
bar.innerHTML='<select id="lomTrack" aria-label="Music track" style="max-width:160px;font:12px system-ui;padding:6px;border-radius:8px;background:#193c49;color:white;border:1px solid #a3d8c4"></select><button id="lomMusic" type="button">♫ Music Off</button><button id="lomFx" type="button">🔊 FX On</button><span style="opacity:.65;font-size:10px">C64-inspired · original music</span>';
for(const b of bar.querySelectorAll('button'))b.style.cssText='font:600 12px system-ui;padding:6px 9px;border:1px solid #a3d8c4;border-radius:8px;background:#193c49;color:#fff;cursor:pointer';
const main=document.querySelector('main');if(main)main.prepend(bar);else document.body.prepend(bar);
$('lomTrack').innerHTML=library.map(t=>'<option value="'+t.id+'">'+t.title+'</option>').join('');$('lomTrack').onchange=e=>chooseTrack(e.target.value);$('lomMusic').onclick=toggleMusic;$('lomFx').onclick=toggleFx;
window.LomAudio={fx,stopMusic,toggleMusic,chooseTrack,library,get current(){return selected},get playing(){return musicOn}};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&musicOn)stopMusic()});
sync();
})();