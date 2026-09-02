/* Service worker do TrashTime.
   Estratégia: rede primeiro para o app (HTML, CSS, JS), cache primeiro para
   imagens. Assim uma versão nova chega sozinha a quem já visitou, e o app
   continua abrindo sem internet. */

const CACHE = 'trashtime-v7';

/* O empacotador carimba um código no nome de cada arquivo gerado
   (recursos/index-Cet-lnag.js), e esse nome muda a cada publicação. Por isso a
   lista fixa de antes não serve mais: aqui só entram os endereços estáveis. O
   resto é guardado na primeira vez que o navegador pede - a busca é "rede
   primeiro", então quem já visitou recebe a versão nova assim que ela sai. */
const ARQUIVOS = [
    './',
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

function guardar(pedido, resposta) {
    if (resposta && resposta.ok && new URL(pedido.url).origin === location.origin) {
        const copia = resposta.clone();
        caches.open(CACHE).then(function (cache) {
            cache.put(pedido, copia);
        });
    }
    return resposta;
}

self.addEventListener('fetch', function (evento) {
    const pedido = evento.request;

    if (pedido.method !== 'GET') {
        return;
    }

    const url = new URL(pedido.url);
    const mesmaOrigem = url.origin === location.origin;
    const ehMidia = /\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(url.pathname);

    // O app em si: tenta a rede antes, para a versão nova chegar sem espera
    if (mesmaOrigem && !ehMidia) {
        evento.respondWith(
            fetch(pedido)
                .then(function (resposta) {
                    return guardar(pedido, resposta);
                })
                .catch(function () {
                    // Sem rede: devolve o que estiver guardado
                    return caches.match(pedido).then(function (guardado) {
                        if (guardado) {
                            return guardado;
                        }
                        if (pedido.mode === 'navigate') {
                            return caches.match('./');
                        }
                        return Response.error();
                    });
                })
        );
        return;
    }

    // Imagens e fontes quase nunca mudam: cache primeiro, que é mais rápido
    evento.respondWith(
        caches.match(pedido).then(function (guardado) {
            return guardado || fetch(pedido).then(function (resposta) {
                return guardar(pedido, resposta);
            }).catch(function () {
                return Response.error();
            });
        })
    );
});
