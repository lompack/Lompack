/* Lompack share button: native mobile share sheet, clipboard fallback. */
(()=>{'use strict';
 const canonical=new URL(location.pathname,location.origin).href;
 const title=document.title.replace(/^Lompack\s*[·•-]?\s*/i,'').trim()||'Lompack';
 const button=document.createElement('button');
 button.type='button';button.textContent='↗ Share';button.setAttribute('aria-label','Share '+title);
 button.style.cssText='font:600 13px system-ui,-apple-system,sans-serif;padding:8px 12px;border:1px solid #ffffff65;border-radius:10px;background:#ffffff20;color:inherit;cursor:pointer;white-space:nowrap;touch-action:manipulation;flex-shrink:0';
 const host=document.querySelector('header')||document.querySelector('main')||document.body;
 if(host.tagName==='HEADER')host.appendChild(button);
 else {button.style.cssText+=';display:block;margin:10px 0 12px auto';host.insertBefore(button,host.firstChild)}
 let restore;
 button.addEventListener('click',async()=>{
  clearTimeout(restore);
  const payload={title:'Play '+title+' on Lompack',text:'🎮 Try '+title+' on Lompack!',url:canonical};
  try{if(navigator.share){await navigator.share(payload);return}}catch(err){if(err?.name==='AbortError')return}
  try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(canonical);
  else{const input=document.createElement('textarea');input.value=canonical;input.style.cssText='position:fixed;opacity:0';document.body.appendChild(input);input.select();if(!document.execCommand('copy'))throw Error('copy failed');input.remove()}
   button.textContent='✓ Link copied';restore=setTimeout(()=>button.textContent='↗ Share',2200);
  }catch(err){window.prompt('Copy game link:',canonical)}
 });
})();