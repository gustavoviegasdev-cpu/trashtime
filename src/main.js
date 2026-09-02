/* Ponto de entrada: monta o app e liga o que precisa existir antes da
   primeira tela aparecer. */

import { createApp } from 'vue';
import App from './App.vue';
import './estilo/base.css';
import { carregarPreferencias, ligarSalvamentoAutomatico } from './estado/estado.js';
import { ligarTema } from './estado/tema.js';

carregarPreferencias();
ligarTema();
ligarSalvamentoAutomatico();

const app = createApp(App);

// Em desenvolvimento, guarda os erros de renderização para os testes verem.
// Em produção o Vue já segue com o comportamento padrão.
if (import.meta.env.DEV) {
    window.__erros = [];
    app.config.errorHandler = function (erro, instancia, info) {
        window.__erros.push(info + ': ' + erro.message + '\n' +
            (erro.stack || '').split('\n').slice(1, 4).join('\n'));
        console.error(erro);
    };
}

app.mount('#app');

// Ponte para os testes automatizados: dá acesso ao estado e às funções
// internas. O `import.meta.env.DEV` é falso na versão publicada, e o
// empacotador remove este trecho inteiro do arquivo final.
if (import.meta.env.DEV) {
    Promise.all([
        import('./estado/estado.js'),
        import('./estado/frota.js'),
        import('./estado/tema.js'),
        import('./mapa/usarMapa.js'),
        import('./nucleo/geometria.js'),
        import('./nucleo/datas.js'),
        import('./nucleo/caminhao3d.js'),
        import('./dados/constantes.js'),
        import('./dados/regioes.js'),
        import('./dados/caminhoes.js'),
        import('./dados/pontos.js')
    ]).then(function (m) {
        window.__app = Object.assign({}, ...m);
    });
}

// Service worker: faz o app abrir sem internet e ser instalável.
// Só vale quando servido por HTTP — abrindo o arquivo direto, o navegador bloqueia.
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {
            // Sem service worker o app continua funcionando, só não abre offline
        });
    });
}
