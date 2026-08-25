/* Service worker do TrashTime: guarda o app para funcionar sem internet. */

const CACHE = 'trashtime-v1';

const ARQUIVOS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icone-192.png',
    './icone-512.png'
];

self.addEventListener('install', function (evento) {
    evento.waitUntil(
        caches.open(CACHE)
            .then(function (cache) {
                return cache.addAll(ARQUIVOS);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', function (evento) {
    evento.waitUntil(
        caches.keys()
            .then(function (nomes) {
                return Promise.all(nomes.filter(function (nome) {
                    return nome !== CACHE;
                }).map(function (nome) {
                    return caches.delete(nome);
                }));
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', function (evento) {
    if (evento.request.method !== 'GET') {
        return;
    }

    evento.respondWith(
        caches.match(evento.request).then(function (guardado) {
            if (guardado) {
                return guardado;
            }
            return fetch(evento.request).then(function (resposta) {
                // Guarda o que vier do próprio app para a próxima vez
                if (resposta.ok && new URL(evento.request.url).origin === location.origin) {
                    const copia = resposta.clone();
                    caches.open(CACHE).then(function (cache) {
                        cache.put(evento.request, copia);
                    });
                }
                return resposta;
            }).catch(function () {
                // Sem rede: só a navegação cai de volta na página inicial
                if (evento.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return Response.error();
            });
        })
    );
});
