/* Modo claro e modo escuro.

   Enquanto o morador não escolher, o app segue o ajuste do aparelho - e
   acompanha se ele mudar no meio do uso. */

import { watchEffect } from 'vue';
import { estado } from './estado.js';

export function preferenciaDoAparelho() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'escuro' : 'claro';
}

export function temaAtual() {
    return estado.config.tema || preferenciaDoAparelho();
}

export function trocarTema(escuro) {
    estado.config.tema = escuro ? 'escuro' : 'claro';
}

// O watchEffect refaz isto sozinho quando estado.config.tema muda: não é
// preciso lembrar de chamar nada depois de trocar o tema.
export function ligarTema() {
    watchEffect(() => {
        const tema = temaAtual();
        document.documentElement.setAttribute('data-tema', tema);

        // A barra do navegador acompanha o fundo do app
        const marca = document.querySelector('meta[name="theme-color"]');
        if (marca) {
            marca.setAttribute('content', tema === 'escuro' ? '#0B0F0C' : '#14532D');
        }
    });

    if (window.matchMedia) {
        const escuta = window.matchMedia('(prefers-color-scheme: dark)');
        if (escuta.addEventListener) {
            escuta.addEventListener('change', () => {
                // Só interessa quando o morador não escolheu nada
                if (estado.config.tema === null) {
                    document.documentElement.setAttribute('data-tema', preferenciaDoAparelho());
                }
            });
        }
    }
}
