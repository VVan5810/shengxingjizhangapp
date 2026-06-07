const CACHE_NAME = 'shengxing-v2';
const FILES_TO_CACHE = [
    './',
    './index.html'
];

// 安装：缓存文件
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting(); // 立即激活新版本
});

// 激活：清理旧缓存，并通知所有页面刷新
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => {
            // 通知所有已打开的页面刷新
            return self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => client.navigate(client.url));
            });
        })
    );
    self.clients.claim();
});

// 拦截请求：优先用缓存，失败时才联网
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(() => {
            return caches.match('./index.html');
        })
    );
});
