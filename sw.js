const CACHE = 'budget-v6'; // 靜態版本號，更新時手動改成 v7, v8...
const ASSETS = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // ✅ 修正：只刪除「舊版本」快取，保留當前版本
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // ✅ 修正：不攔截 Supabase / Google 認證請求，讓瀏覽器正常處理 OAuth 跳轉
  if (
    url.includes('supabase.co') ||
    url.includes('google.com') ||
    url.includes('googleapis.com') ||
    url.includes('accounts.google')
  ) {
    return; // 直接放行，不做任何處理
  }
  // 其他靜態資源：網路優先，失敗才用快取
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
