/* O caminhão de coleta desenhado como volume: uma projeção leva cada ponto
   do espaço (comprimento, altura, profundidade) para as duas coordenadas do
   SVG, e cada face recebe um tom conforme pega a luz. */

import { CAMINHOES } from '../dados/caminhoes.js';

// Quanto a profundidade desloca o desenho para o lado e para cima
export const FUGA_X = 0.42;
export const FUGA_Y = 0.34;
export const TAMANHO_CAMINHAO = 1.18;

export function proj(x, y, z) {
    return ((x + FUGA_X * z) * TAMANHO_CAMINHAO).toFixed(1) + ',' +
           ((y - FUGA_Y * z) * TAMANHO_CAMINHAO).toFixed(1);
}

export function esc(v) {
    return (v * TAMANHO_CAMINHAO).toFixed(1);
}

export function face(pontos) {
    return pontos.map(function (p) { return proj(p[0], p[1], p[2]); }).join(' ');
}

// Clareia ou escurece uma cor: cada face pega a luz de um jeito
export function tom(cor, quanto) {
    const n = parseInt(cor.slice(1), 16);
    const canal = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (c) {
        const v = quanto >= 0 ? c + (255 - c) * quanto : c * (1 + quanto);
        return Math.max(0, Math.min(255, Math.round(v)));
    });
    return '#' + canal.map(function (c) { return ('0' + c.toString(16)).slice(-2); }).join('');
}

// As definições que o desenho usa: a sombra do chão e o degradê que faz a
// lateral da caçamba receber mais luz em cima do que embaixo.
export function defsDoCaminhao() {
    const cores = [];
    CAMINHOES.forEach(function (c) {
        if (cores.indexOf(c.cor) < 0) {
            cores.push(c.cor);
        }
    });
    return '<defs>' +
        '<radialGradient id="sombra-caminhao">' +
            '<stop offset="0.35" stop-color="#0F1D14" stop-opacity="0.34" />' +
            '<stop offset="1" stop-color="#0F1D14" stop-opacity="0" />' +
        '</radialGradient>' +
        cores.map(function (cor) {
            return '<linearGradient id="lado-' + cor.slice(1) + '" x1="0" y1="0" x2="0" y2="1">' +
                '<stop offset="0" stop-color="' + tom(cor, 0.16) + '" />' +
                '<stop offset="1" stop-color="' + tom(cor, -0.10) + '" />' +
            '</linearGradient>';
        }).join('') +
    '</defs>';
}

export function desenhoDoCaminhao(cor) {
    // Caçamba com a cor do caminhão, cabine branca - como nos caminhões de
    // coleta de verdade. Atrás fica a tremonha, aquela rampa inclinada onde o
    // lixo é despejado: é ela que faz o contorno ser reconhecível de longe.
    const LADO = 'url(#lado-' + cor.slice(1) + ')';
    const TOPO = tom(cor, 0.32);
    const RAMPA = tom(cor, 0.12);
    const TRASEIRA = tom(cor, -0.28);
    const VINCO = tom(cor, -0.20);

    const CABINE = '#F1F4F2';
    const CABINE_TOPO = '#FFFFFF';
    const CABINE_FRENTE = '#DCE3DE';
    const VIDRO = '#2C3B44';
    const VIDRO_CLARO = '#445862';

    const CHASSI = '#2A332D';
    const PARACHOQUE = '#39443C';
    const FAROL = '#FFE9A8';
    const PNEU = '#1B221D';
    const ARO = '#9BA79F';
    const CUBO = '#5C6862';

    const P = 11;                        // profundidade
    const X0 = -17, XR = -11.5;          // traseira e o pé da rampa
    const X1 = 1.5, X2 = 15, XF = 16.4;  // junta, frente da cabine, para-choque
    const CH_T = -7, CH_B = -4.4;        // chassi
    const C_T = -20, R_T = -15.2;        // teto da caçamba e topo da traseira
    const K_T = -15.4;                   // teto da cabine
    const RODA_Y = -4.2, RODA_R = 4.3;
    const EIXO_TRAS = -9.5, EIXO_FRENTE = 9.8;

    const poli = function (preenche, pontos, extra) {
        return '<polygon fill="' + preenche + '" points="' + face(pontos) + '"' + (extra || '') + ' />';
    };

    // A aba do para-lama: um arco fino por cima do pneu, não uma mancha cheia
    const paraLama = function (x) {
        const c = proj(x, CH_T + 0.6, 0).split(',');
        const r = RODA_R + 0.9;
        return '<path fill="none" stroke="' + CHASSI + '" stroke-width="' + esc(1) +
            '" stroke-linecap="round" d="M' + esc(Number(c[0]) - r) + ' ' + esc(Number(c[1])) +
            ' a' + esc(r) + ' ' + esc(r) + ' 0 0 1 ' + esc(r * 2) + ' 0" />';
    };

    const roda = function (x, z, k) {
        const c = proj(x, RODA_Y, z).split(',');
        const cx = esc(Number(c[0])), cy = esc(Number(c[1]));
        return '<g class="caminhao__roda">' +
            '<circle fill="' + PNEU + '" cx="' + cx + '" cy="' + cy + '" r="' + esc(RODA_R * k) + '" />' +
            '<circle fill="' + ARO + '" cx="' + cx + '" cy="' + cy + '" r="' + esc(2.3 * k) + '" />' +
            '<circle fill="' + CUBO + '" cx="' + cx + '" cy="' + cy + '" r="' + esc(0.85 * k) + '" />' +
        '</g>';
    };

    return (
        // ---- o que fica do outro lado, atrás de tudo ----
        roda(EIXO_TRAS, P - 2.5, 0.88) + roda(EIXO_FRENTE, P - 2.5, 0.88) +

        // escapamento subindo atrás da cabine
        poli('#77837B', [[X1 + 0.7, K_T + 1, P - 3], [X1 + 1.7, K_T + 1, P - 3],
                         [X1 + 1.7, K_T - 3.4, P - 3], [X1 + 0.7, K_T - 3.4, P - 3]]) +

        // ---- chassi e para-choques ----
        poli(CHASSI, [[X0, CH_T, 0], [XF, CH_T, 0], [XF, CH_B, 0], [X0, CH_B, 0]]) +
        poli(PARACHOQUE, [[XF - 1.4, CH_T + 0.4, -0.4], [XF, CH_T + 0.4, -0.4],
                          [XF, CH_B + 0.6, -0.4], [XF - 1.4, CH_B + 0.6, -0.4]]) +
        poli(PARACHOQUE, [[X0 - 1.2, CH_T + 0.6, -0.4], [X0 + 0.6, CH_T + 0.6, -0.4],
                          [X0 + 0.6, CH_B + 0.4, -0.4], [X0 - 1.2, CH_B + 0.4, -0.4]]) +

        // ---- caçamba: traseira, rampa da tremonha, teto ----
        poli(TRASEIRA, [[X0, CH_T, 0], [X0, R_T, 0], [X0, R_T, P], [X0, CH_T, P]]) +
        poli(RAMPA, [[X0, R_T, 0], [XR, C_T, 0], [XR, C_T, P], [X0, R_T, P]]) +
        poli(TOPO, [[XR, C_T, 0], [X1, C_T, 0], [X1, C_T, P], [XR, C_T, P]]) +
        poli(tom(cor, 0.46), [[XR + 2, C_T, 2.2], [X1 - 1.8, C_T, 2.2],
                              [X1 - 1.8, C_T, P - 2.2], [XR + 2, C_T, P - 2.2]]) +

        // ---- cabine: teto, frente, para-brisa, grade e farol ----
        poli(CABINE_TOPO, [[X1, K_T, 0], [X2, K_T, 0], [X2, K_T, P], [X1, K_T, P]]) +
        poli(CABINE_FRENTE, [[X2, CH_B, 0], [X2, K_T, 0], [X2, K_T, P], [X2, CH_B, P]]) +
        poli(VIDRO, [[X2 + 0.25, -8, 1.2], [X2 + 0.25, K_T + 1.5, 1.2],
                     [X2 + 0.25, K_T + 1.5, P - 1.2], [X2 + 0.25, -8, P - 1.2]]) +
        poli(VIDRO_CLARO, [[X2 + 0.4, -8, 1.2], [X2 + 0.4, -10.8, 1.2],
                           [X2 + 0.4, -10.8, 4.8], [X2 + 0.4, -8, 4.8]]) +
        poli(CHASSI, [[X2 + 0.3, -5.6, 2.4], [X2 + 0.3, -7, 2.4],
                      [X2 + 0.3, -7, P - 2.4], [X2 + 0.3, -5.6, P - 2.4]], ' opacity="0.5"') +
        poli(FAROL, [[X2 + 0.35, -4.6, 1], [X2 + 0.35, -5.6, 1],
                     [X2 + 0.35, -5.6, 3.2], [X2 + 0.35, -4.6, 3.2]]) +
        poli(FAROL, [[X2 + 0.35, -4.6, P - 3.2], [X2 + 0.35, -5.6, P - 3.2],
                     [X2 + 0.35, -5.6, P - 1], [X2 + 0.35, -4.6, P - 1]]) +

        // ---- lataria do lado de cá ----
        poli(LADO, [[X0, CH_T, 0], [X1, CH_T, 0], [X1, C_T, 0], [XR, C_T, 0], [X0, R_T, 0]]) +
        poli(VINCO, [[X0 + 1.4, -9, -0.3], [X1 - 1, -9, -0.3], [X1 - 1, -10.2, -0.3], [X0 + 1.4, -10.2, -0.3]]) +
        poli('#FFFFFF', [[X0 + 1.4, -12.8, -0.35], [X1 - 1, -12.8, -0.35],
                         [X1 - 1, -14.6, -0.35], [X0 + 1.4, -14.6, -0.35]], ' opacity="0.72"') +
        paraLama(EIXO_TRAS) +

        // ---- lateral da cabine, porta e janela ----
        poli(CABINE, [[X1, CH_T, 0], [X2, CH_T, 0], [X2, K_T, 0], [X1, K_T, 0]]) +
        poli(VIDRO, [[X1 + 1.3, -8.6, -0.3], [X2 - 1.5, -8.6, -0.3],
                     [X2 - 1.5, -13.4, -0.3], [X1 + 1.3, -13.4, -0.3]]) +
        poli(CABINE_FRENTE, [[X1 + 1.2, CH_T, -0.3], [X1 + 1.7, CH_T, -0.3],
                             [X1 + 1.7, K_T, -0.3], [X1 + 1.2, K_T, -0.3]]) +
        poli('#8E9A93', [[X1, CH_T, -0.35], [X1 + 0.45, CH_T, -0.35],
                         [X1 + 0.45, K_T, -0.35], [X1, K_T, -0.35]]) +
        paraLama(EIXO_FRENTE) +

        // retrovisor
        poli('#4A554D', [[X2 - 1.6, -13.2, -0.5], [X2 - 0.4, -13.2, -0.5],
                         [X2 - 0.4, -13.6, -0.5], [X2 - 1.6, -13.6, -0.5]]) +
        poli('#4A554D', [[X2 - 1.9, -12.2, -0.5], [X2 - 1, -12.2, -0.5],
                         [X2 - 1, -14.2, -0.5], [X2 - 1.9, -14.2, -0.5]]) +

        // ---- rodas do lado de cá ----
        roda(EIXO_TRAS, 0.4, 1) + roda(EIXO_FRENTE, 0.4, 1) +

        // giroflex no teto da cabine
        '<circle class="caminhao__giroflex" fill="#F5C542" cx="' + esc(X1 + 2.6 + FUGA_X * 5.5) +
            '" cy="' + esc(K_T - 1.6 - FUGA_Y * 5.5) + '" r="' + esc(1.7) + '" />'
    );
}
