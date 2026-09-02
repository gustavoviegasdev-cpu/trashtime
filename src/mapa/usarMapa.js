/* Aproximar, afastar, arrastar e ampliar o mapa.

   Esta parte continua imperativa de propósito. Gesto de toque é conta de
   pixel: quantos dedos estão na tela, a que distância um do outro, quanto o
   ponto entre eles andou. Framework nenhum ajuda nisso - e o Vue não atrapalha,
   porque o resultado da conta cai em `estado.mapa`, que é reativo, e daí a tela
   se atualiza sozinha. */

import { reactive, computed } from 'vue';
import {
    MUNDO, VISTA, ZOOM_MAX, ZOOM_PADRAO, ZOOM_MOSTRA_NOMES,
    MAPA_RECOLHIDO, MAPA_MARGEM_ABAIXO, LARGURA_CELULAR
} from '../dados/constantes.js';
import { estado, pontoUsuario } from '../estado/estado.js';

export const vista = reactive({
    viewBox: '0 0 390 260',
    selo: '',
    seloVisivel: false
});

// Quanto os marcadores encolhem para manterem o tamanho aparente
export const escalaMarcador = computed(() => 1 / estado.mapa.zoom);

// A partir daqui os nomes dos pontos cabem na tela sem virar sopa de letras
export const mostrarNomes = computed(() => estado.mapa.zoom >= ZOOM_MOSTRA_NOMES);

let elSvg = null;
let elMapa = null;

export function usarMapa(refs) {
    elSvg = refs.svg;
    elMapa = refs.mapa;
}

/* ---------- o recorte que aparece na tela ---------- */

// Quanto o mapa mostra depende do formato da caixa onde ele está desenhado.
// Quando o morador amplia o mapa no celular a caixa fica mais alta, e a janela
// precisa acompanhar - senão a altura extra só cortaria as laterais.
export function formatoDaVista() {
    if (!elSvg) {
        return VISTA.h / VISTA.w;
    }
    const caixa = elSvg.getBoundingClientRect();
    if (caixa.width < 1 || caixa.height < 1) {
        return VISTA.h / VISTA.w;
    }
    return caixa.height / caixa.width;
}

// O quanto dá para afastar depende do formato da caixa: a janela nunca pode
// ficar maior que o desenho, senão sobraria vazio nas bordas.
export function zoomMinimo() {
    const formato = formatoDaVista();
    return Math.max(VISTA.w / MUNDO.w, (VISTA.w * formato) / MUNDO.h);
}

export function aplicarVista() {
    const minimo = zoomMinimo();
    if (estado.mapa.zoom < minimo) {
        estado.mapa.zoom = minimo;
    }

    const largura = VISTA.w / estado.mapa.zoom;
    const altura = largura * formatoDaVista();

    // A vista não escapa dos limites do mundo desenhado
    estado.mapa.cx = largura >= MUNDO.w
        ? MUNDO.x + MUNDO.w / 2
        : Math.max(MUNDO.x + largura / 2,
                   Math.min(MUNDO.x + MUNDO.w - largura / 2, estado.mapa.cx));
    estado.mapa.cy = altura >= MUNDO.h
        ? MUNDO.y + MUNDO.h / 2
        : Math.max(MUNDO.y + altura / 2,
                   Math.min(MUNDO.y + MUNDO.h - altura / 2, estado.mapa.cy));

    vista.viewBox =
        (estado.mapa.cx - largura / 2).toFixed(1) + ' ' +
        (estado.mapa.cy - altura / 2).toFixed(1) + ' ' +
        largura.toFixed(1) + ' ' + altura.toFixed(1);
}

export function zoomPara(novo, focoX, focoY) {
    const limitado = Math.max(zoomMinimo(), Math.min(ZOOM_MAX, novo));
    if (focoX !== undefined) {
        // mantém o ponto sob o cursor parado enquanto aproxima
        const razao = 1 - estado.mapa.zoom / limitado;
        estado.mapa.cx += (focoX - estado.mapa.cx) * razao;
        estado.mapa.cy += (focoY - estado.mapa.cy) * razao;
    }
    estado.mapa.zoom = limitado;
    aplicarVista();
}

export function centralizarNoMorador() {
    const eu = pontoUsuario.value;
    estado.mapa.cx = eu.x;
    estado.mapa.cy = eu.y;
    estado.mapa.zoom = ZOOM_PADRAO;
    aplicarVista();
}

// Converte um ponto da tela para as coordenadas do mapa
export function pontoNoMapa(clientX, clientY) {
    const caixa = elSvg.getBoundingClientRect();
    const largura = VISTA.w / estado.mapa.zoom;
    const altura = largura * formatoDaVista();
    return {
        x: estado.mapa.cx - largura / 2 + ((clientX - caixa.left) / caixa.width) * largura,
        y: estado.mapa.cy - altura / 2 + ((clientY - caixa.top) / caixa.height) * altura
    };
}

export const podeAproximar = computed(() => estado.mapa.zoom < ZOOM_MAX - 0.001);
export const podeAfastar = computed(() => estado.mapa.zoom > zoomMinimo() + 0.001);

/* ---------- o mapa que cresce quando é puxado para baixo ---------- */

export function noCelular() {
    return window.innerWidth <= LARGURA_CELULAR;
}

// Altura máxima que o mapa pode ocupar sem engolir a tela inteira: sobra
// espaço para a barra de abas e para o cartão do caminhão logo abaixo.
export function alturaMaximaDoMapa() {
    const abas = document.querySelector('.abas');
    const alturaAbas = abas ? abas.getBoundingClientRect().height : 84;
    const livre = window.innerHeight - alturaAbas - MAPA_MARGEM_ABAIXO;
    return Math.max(MAPA_RECOLHIDO + 60, Math.round(livre));
}

export function definirAlturaDoMapa(px) {
    if (elMapa) {
        elMapa.style.setProperty('--altura-mapa', Math.round(px) + 'px');
    }
}

// Leva o mapa para um dos dois tamanhos, com animação
export function ajustarMapa(expandido, animar) {
    if (!elMapa) {
        return;
    }
    estado.mapa.expandido = expandido;
    elMapa.classList.toggle('mapa--animando', animar !== false);
    definirAlturaDoMapa(expandido ? alturaMaximaDoMapa() : MAPA_RECOLHIDO);

    // A caixa muda de formato, então a janela do mapa tem que ser refeita.
    // Uma durante a animação e outra no fim, para não ficar esticado no caminho.
    aplicarVista();
    window.setTimeout(aplicarVista, 60);
    window.setTimeout(aplicarVista, 200);
    window.setTimeout(() => {
        elMapa.classList.remove('mapa--animando');
        aplicarVista();
    }, 300);

    // Ampliado, o mapa sobe para o alto da tela. A rolagem só acontece depois
    // que ele já cresceu - antes disso a página ainda é curta demais para subir.
    if (expandido && animar !== false && noCelular()) {
        window.setTimeout(() => {
            const topo = elMapa.getBoundingClientRect().top + window.scrollY - 8;
            window.scrollTo({ top: Math.max(0, topo), behavior: 'smooth' });
        }, 30);
    }
}

export function alternarMapa() {
    ajustarMapa(!estado.mapa.expandido, true);
    vibrar(12);
}

// Um toquinho de vibração confirma o gesto no celular
export function vibrar(ms) {
    if (navigator.vibrate) {
        try {
            navigator.vibrate(ms);
        } catch (erro) {
            // alguns navegadores recusam sem interação; não faz mal
        }
    }
}

/* ---------- o selo que mostra a aproximação ---------- */

let relogioSelo = null;

export function mostrarSeloZoom() {
    vista.selo = estado.mapa.zoom.toFixed(1).replace('.', ',') + '×';
    vista.seloVisivel = true;
    window.clearTimeout(relogioSelo);
    relogioSelo = window.setTimeout(() => { vista.seloVisivel = false; }, 900);
}

function distanciaEntre(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

/* ---------- os gestos ---------- */

export function ligarGestosDoMapa(puxador) {
    const svg = elSvg;
    const mapa = elMapa;

    const dedos = new Map();   // cada dedo encostado na tela
    let arrasto = null;        // arrastar o mapa com um dedo
    let pinca = null;          // aproximar com dois dedos
    let puxada = null;         // puxar para baixo para ampliar
    let ultimoToque = 0;
    let ultimoPonto = null;

    function porPixel() {
        const caixa = svg.getBoundingClientRect();
        return caixa.width < 1 ? 0 : (VISTA.w / estado.mapa.zoom) / caixa.width;
    }

    function encerrarPuxada(cancelado) {
        if (!puxada) {
            return;
        }
        const alcance = alturaMaximaDoMapa() - MAPA_RECOLHIDO;
        const andado = puxada.altura - MAPA_RECOLHIDO;
        const rapido = Math.abs(puxada.ultimoAvanco) > 6;
        let expandir;

        if (cancelado) {
            expandir = puxada.comecouExpandido;
        } else if (rapido) {
            expandir = puxada.ultimoAvanco > 0;
        } else {
            expandir = andado > alcance * 0.35;
        }

        ajustarMapa(expandir, true);
        if (expandir !== puxada.comecouExpandido) {
            vibrar(12);
        }
        puxada = null;
    }

    // ---- um ou dois dedos sobre o mapa ----

    svg.addEventListener('pointerdown', function (evento) {
        dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
        try {
            svg.setPointerCapture(evento.pointerId);
        } catch (erro) {
            // navegadores antigos apenas ignoram
        }

        if (dedos.size === 2) {
            // o segundo dedo cancela o arrasto e começa a pinça
            arrasto = null;
            if (puxada) {
                ajustarMapa(puxada.comecouExpandido, true);
                puxada = null;
            }
            const par = Array.from(dedos.values());
            pinca = {
                dist: Math.max(1, distanciaEntre(par[0], par[1])),
                meio: { x: (par[0].x + par[1].x) / 2, y: (par[0].y + par[1].y) / 2 }
            };
            return;
        }

        if (dedos.size === 1) {
            arrasto = {
                x: evento.clientX, y: evento.clientY,
                x0: evento.clientX, y0: evento.clientY,
                decidido: false, mexeu: false
            };
        }
    });

    svg.addEventListener('pointermove', function (evento) {
        if (!dedos.has(evento.pointerId)) {
            return;
        }
        dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });

        // ---- dois dedos: aproximar e afastar ----
        if (pinca && dedos.size >= 2) {
            const par = Array.from(dedos.values());
            const dist = Math.max(1, distanciaEntre(par[0], par[1]));
            const meio = { x: (par[0].x + par[1].x) / 2, y: (par[0].y + par[1].y) / 2 };
            const passo = porPixel();

            // primeiro o mapa acompanha o ponto entre os dois dedos
            estado.mapa.cx -= (meio.x - pinca.meio.x) * passo;
            estado.mapa.cy -= (meio.y - pinca.meio.y) * passo;

            // depois aproxima mantendo esse ponto parado
            const alvo = pontoNoMapa(meio.x, meio.y);
            pinca.meio = meio;
            const razao = dist / pinca.dist;
            pinca.dist = dist;
            zoomPara(estado.mapa.zoom * razao, alvo.x, alvo.y);
            mostrarSeloZoom();
            return;
        }

        // ---- puxando para baixo para ampliar o mapa ----
        if (puxada) {
            const alto = Math.max(MAPA_RECOLHIDO,
                Math.min(alturaMaximaDoMapa(), puxada.base + (evento.clientY - puxada.y0)));
            puxada.ultimoAvanco = alto - puxada.altura;
            puxada.altura = alto;
            definirAlturaDoMapa(alto);
            aplicarVista();
            return;
        }

        // ---- um dedo ----
        if (!arrasto) {
            return;
        }

        const dx = evento.clientX - arrasto.x0;
        const dy = evento.clientY - arrasto.y0;

        // O primeiro movimento decide o gesto: puxar o mapa para baixo ou
        // arrastar o desenho. Depois de decidido ele não muda mais no meio.
        if (!arrasto.decidido) {
            if (Math.hypot(dx, dy) < 8) {
                return;
            }
            arrasto.decidido = true;
            arrasto.mexeu = true;

            const verticalParaBaixo = dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.5;
            if (noCelular() && !estado.mapa.expandido && verticalParaBaixo) {
                const altura = mapa.getBoundingClientRect().height;
                puxada = {
                    y0: evento.clientY, base: altura, altura: altura,
                    ultimoAvanco: 0, comecouExpandido: false
                };
                mapa.classList.remove('mapa--animando');
                arrasto = null;
                return;
            }
        }

        const passo = porPixel();
        estado.mapa.cx -= (evento.clientX - arrasto.x) * passo;
        estado.mapa.cy -= (evento.clientY - arrasto.y) * passo;
        arrasto.x = evento.clientX;
        arrasto.y = evento.clientY;
        aplicarVista();
    });

    function soltar(evento) {
        dedos.delete(evento.pointerId);
        try {
            svg.releasePointerCapture(evento.pointerId);
        } catch (erro) {
            // já pode ter sido solto
        }

        if (dedos.size < 2) {
            pinca = null;
        }
        if (dedos.size === 0) {
            encerrarPuxada(evento.type === 'pointercancel');

            // Dois toques rápidos no mesmo lugar aproximam o mapa
            if (arrasto && !arrasto.mexeu) {
                const agora = Date.now();
                const ponto = { x: evento.clientX, y: evento.clientY };
                if (agora - ultimoToque < 320 && ultimoPonto &&
                    distanciaEntre(ponto, ultimoPonto) < 34) {
                    const alvo = pontoNoMapa(ponto.x, ponto.y);
                    zoomPara(estado.mapa.zoom * 1.8, alvo.x, alvo.y);
                    mostrarSeloZoom();
                    vibrar(10);
                    ultimoToque = 0;
                } else {
                    ultimoToque = agora;
                    ultimoPonto = ponto;
                }
            }
            arrasto = null;
        }
    }

    ['pointerup', 'pointercancel'].forEach(function (nome) {
        svg.addEventListener(nome, soltar);
    });

    // ---- rodinha do mouse, no computador ----
    svg.addEventListener('wheel', function (evento) {
        evento.preventDefault();
        const alvo = pontoNoMapa(evento.clientX, evento.clientY);
        zoomPara(estado.mapa.zoom * (evento.deltaY < 0 ? 1.14 : 0.88), alvo.x, alvo.y);
        mostrarSeloZoom();
    }, { passive: false });

    // ---- teclado, com o mapa em foco ----
    svg.addEventListener('keydown', function (evento) {
        const passo = 40 / estado.mapa.zoom;
        const teclas = {
            ArrowUp: [0, -passo], ArrowDown: [0, passo],
            ArrowLeft: [-passo, 0], ArrowRight: [passo, 0]
        };
        if (teclas[evento.key]) {
            evento.preventDefault();
            estado.mapa.cx += teclas[evento.key][0];
            estado.mapa.cy += teclas[evento.key][1];
            aplicarVista();
        } else if (evento.key === '+' || evento.key === '=') {
            evento.preventDefault();
            zoomPara(estado.mapa.zoom * 1.4);
            mostrarSeloZoom();
        } else if (evento.key === '-' || evento.key === '_') {
            evento.preventDefault();
            zoomPara(estado.mapa.zoom / 1.4);
            mostrarSeloZoom();
        }
    });

    // ---- a alça que amplia o mapa ----
    if (puxador) {
        let alcaAtiva = null;

        puxador.addEventListener('pointerdown', function (evento) {
            evento.preventDefault();
            try {
                puxador.setPointerCapture(evento.pointerId);
            } catch (erro) {
                // sem captura o gesto ainda funciona dentro da alça
            }
            const altura = mapa.getBoundingClientRect().height;
            alcaAtiva = { id: evento.pointerId, y0: evento.clientY, mexeu: false };
            puxada = {
                y0: evento.clientY, base: altura, altura: altura,
                ultimoAvanco: 0, comecouExpandido: estado.mapa.expandido
            };
            mapa.classList.remove('mapa--animando');
        });

        puxador.addEventListener('pointermove', function (evento) {
            if (!alcaAtiva || alcaAtiva.id !== evento.pointerId || !puxada) {
                return;
            }
            if (Math.abs(evento.clientY - alcaAtiva.y0) > 5) {
                alcaAtiva.mexeu = true;
            }
            const alto = Math.max(MAPA_RECOLHIDO,
                Math.min(alturaMaximaDoMapa(), puxada.base + (evento.clientY - puxada.y0)));
            puxada.ultimoAvanco = alto - puxada.altura;
            puxada.altura = alto;
            definirAlturaDoMapa(alto);
            aplicarVista();
        });

        ['pointerup', 'pointercancel'].forEach(function (nome) {
            puxador.addEventListener(nome, function (evento) {
                if (!alcaAtiva || alcaAtiva.id !== evento.pointerId) {
                    return;
                }
                // Um toque simples na alça também alterna, sem precisar arrastar
                if (!alcaAtiva.mexeu) {
                    puxada = null;
                    alternarMapa();
                } else {
                    encerrarPuxada(nome === 'pointercancel');
                }
                alcaAtiva = null;
            });
        });

        puxador.addEventListener('keydown', function (evento) {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                alternarMapa();
            }
        });
    }

    // Girar o aparelho ou mudar a janela muda o formato da caixa do mapa
    window.addEventListener('resize', function () {
        if (estado.mapa.expandido && noCelular()) {
            definirAlturaDoMapa(alturaMaximaDoMapa());
        } else if (!noCelular()) {
            elMapa.style.removeProperty('--altura-mapa');
        }
        aplicarVista();
    });

    ajustarMapa(false, false);
}
