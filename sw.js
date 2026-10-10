/* مُثبِّت القرآن — عمل بدون إنترنت (ضعه بجانب index.html) */
const C='qmrm-v3',SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const h=new URL(r.url).hostname;
  if(h.includes('firestore.googleapis.com')||h.includes('identitytoolkit')||h.includes('securetoken'))return; // بيانات الحساب لا تُخزَّن
  // الصفحة نفسها: الأحدث من الإنترنت أولاً، وعند انقطاعه النسخة المخزّنة (فيظهر التحديث الجديد مباشرة)
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
