<template>
    <div class="mapa" ref="caixa">
        <svg class="mapa__svg" ref="svg" tabindex="0" :viewBox="vista.viewBox"
             preserveAspectRatio="xMidYMid slice">
            <FundoMapa />

            <!-- Pontos conhecidos da cidade. São onze e mudam pouco, então
                 valem a pena declarativos: o Vue só mexe no que mudou. -->
            <g>
                <g v-for="ponto in PONTOS_BELEM" :key="ponto.nome" class="marco"
                   :class="{ 'marco--com-nome': mostrarNomes }"
                   :transform="`translate(${ponto.x},${ponto.y}) scale(${escalaMarcador.toFixed(3)})`">
                    <g class="marco__nome">
                        <rect class="marco__tarja" x="9" y="-8" rx="8" height="16"
                              :width="(ponto.nome.length * 5.1 + 16).toFixed(1)" />
                        <text class="marco__texto" x="16" y="3.6">{{ ponto.nome }}</text>
                    </g>
                    <circle class="marco__ponto" r="4.2" />
                    <circle class="marco__miolo" r="1.7" />
                </g>
            </g>

            <!-- A frota. Aqui está o ganho mais visível do Vue: antes eram
                 quatro funções montando texto de SVG na mão a cada segundo. -->
            <g id="camada-frota">
                <defs>
                    <radialGradient id="sombra-caminhao">
                        <stop offset="0.35" stop-color="#0F1D14" stop-opacity="0.34" />
                        <stop offset="1" stop-color="#0F1D14" stop-opacity="0" />
                    </radialGradient>
                    <linearGradient v-for="cor in coresDaFrota" :key="cor"
                                    :id="`lado-${cor.slice(1)}`" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" :stop-color="tom(cor, 0.16)" />
                        <stop offset="1" :stop-color="tom(cor, -0.10)" />
                    </linearGradient>
                </defs>

                <template v-for="c in desenhos" :key="c.id">
                    <path class="rota rota--passou" :d="c.passou" :opacity="c.opacidade"
                          :stroke-width="c.larguraGrossa" fill="none"
                          stroke-linecap="round" stroke-linejoin="round" />
                    <path class="rota rota--prevista" :d="c.prevista" :opacity="c.opacidade"
                          :stroke-width="c.larguraGrossa" :stroke-dasharray="c.tracoPrevisto"
                          fill="none" stroke-linecap="round" stroke-linejoin="round" />
                    <path class="rota rota--pendente" :d="c.pendente" :opacity="c.opacidade"
                          :stroke-width="c.larguraFina" :stroke-dasharray="c.tracoPendente"
                          fill="none" stroke-linecap="round" stroke-linejoin="round" />
                </template>

                <g id="grupo-usuario" :transform="transformUsuario">
                    <circle class="usuario__halo" id="halo-usuario" r="16" />
                    <circle class="usuario__ponto" r="7" stroke-width="3" />
                </g>

                <g v-for="c in desenhos" :key="`m-${c.id}`" class="caminhao-marcador"
                   :id="`marcador-${c.id}`" tabindex="0" role="button"
                   :class="{
                       'caminhao-marcador--andando': c.andando,
                       'caminhao-marcador--parado': !c.andando,
                       'caminhao-marcador--ativo': c.selecionado
                   }"
                   :transform="c.transform" :aria-label="c.rotulo"
                   @click="selecionar(c.id)" @keydown.enter.prevent="selecionar(c.id)"
                   @keydown.space.prevent="selecionar(c.id)">
                    <circle class="caminhao__halo" :id="`halo-${c.id}`"
                            :r="c.selecionado ? 30 : 26" :fill="c.cor"
                            :opacity="c.selecionado ? 0.30 : 0.13" />
                    <ellipse class="caminhao__chao" cx="1.5" cy="1.8" rx="19" ry="4" />
                    <g class="caminhao__corpo">
                        <g class="caminhao__frente" :id="`frente-${c.id}`"
                           :transform="c.olhando === -1 ? 'scale(-1,1)' : 'scale(1,1)'"
                           v-html="desenhoPorCor[c.cor]"></g>
                    </g>
                    <circle class="caminhao__toque" r="21" fill="transparent" />
                </g>
            </g>
        </svg>

        <div class="mapa__controles">
            <button class="botao-flutuante" aria-label="Ver o caminhão do meu bairro"
                    @click="acharMorador">
                <svg class="icone" width="21" height="21"><use href="#ic-alvo" /></svg>
            </button>
            <button class="botao-flutuante botao-zoom" aria-label="Aproximar"
                    :disabled="!podeAproximar" @click="aproximar">+</button>
            <button class="botao-flutuante botao-zoom" aria-label="Afastar"
                    :disabled="!podeAfastar" @click="afastar">&#8722;</button>
        </div>

        <span class="selo-zoom" :class="{ 'selo-zoom--visivel': vista.seloVisivel }"
              aria-hidden="true">{{ vista.selo }}</span>

        <div class="legenda">
            <span class="legenda__item"><i class="traco traco--percorrido"></i>Já passou</span>
            <span class="legenda__item"><i class="traco traco--previsto"></i>Rota prevista</span>
            <span class="legenda__item"><i class="traco traco--pendente"></i>Ainda não passou</span>
            <span class="legenda__item"><i class="ponto-voce"></i>Você</span>
        </div>

        <button class="mapa__puxador" ref="puxador"
                :aria-expanded="estado.mapa.expandido ? 'true' : 'false'"
                :aria-label="estado.mapa.expandido ? 'Recolher o mapa' : 'Ampliar o mapa'">
            <span class="mapa__puxador-alca"></span>
            <span class="mapa__puxador-texto">
                {{ estado.mapa.expandido ? 'Arraste para recolher' : 'Arraste para ampliar' }}
            </span>
        </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import FundoMapa from './FundoMapa.vue';
import { PONTOS_BELEM } from '../dados/pontos.js';
import { ALCANCE_PREVISTO } from '../dados/constantes.js';
import { estado, frota, pontoUsuario } from '../estado/estado.js';
import { textoSituacao } from '../estado/frota.js';
import {
    comprimentoRota, pontoEm, trechoRota, paraD, sentidoNaRota
} from '../nucleo/geometria.js';
import { tom, desenhoDoCaminhao } from '../nucleo/caminhao3d.js';
import {
    vista, escalaMarcador, mostrarNomes, usarMapa, aplicarVista, zoomPara,
    centralizarNoMorador, ligarGestosDoMapa, mostrarSeloZoom,
    podeAproximar, podeAfastar
} from './usarMapa.js';

const caixa = ref(null);
const svg = ref(null);
const puxador = ref(null);

// O desenho do caminhão depende só da cor, então basta um por cor da frota
const coresDaFrota = computed(() => [...new Set(frota.map((c) => c.cor))]);
const desenhoPorCor = computed(() => {
    const mapa = {};
    coresDaFrota.value.forEach((cor) => { mapa[cor] = desenhoDoCaminhao(cor); });
    return mapa;
});

const transformUsuario = computed(() => {
    const eu = pontoUsuario.value;
    return `translate(${eu.x},${eu.y}) scale(${escalaMarcador.value.toFixed(3)})`;
});

// Tudo que o mapa precisa saber de cada caminhão, recalculado sozinho sempre
// que o progresso, o zoom ou a seleção mudam.
const desenhos = computed(() => {
    const escala = escalaMarcador.value;
    return frota.map((caminhao) => {
        const total = comprimentoRota(caminhao.rota);
        const andado = caminhao.progresso * total;
        const parado = caminhao.velocidade === 0;
        const selecionado = caminhao.id === estado.caminhaoSelecionado;
        const ateAqui = parado ? 0 : andado;
        const ateOndePrevisto = parado ? 0 : Math.min(andado + ALCANCE_PREVISTO, total);

        const trecho = (de, ate) => {
            const pedaco = trechoRota(caminhao.rota, de, ate);
            return pedaco.length > 1 ? paraD(pedaco) : '';
        };
        const ponto = pontoEm(caminhao.rota, andado);

        return {
            id: caminhao.id,
            cor: caminhao.cor,
            olhando: sentidoNaRota(caminhao.rota, andado),
            andando: !parado,
            selecionado,
            opacidade: selecionado ? 1 : 0.45,
            passou: trecho(0, ateAqui),
            prevista: trecho(ateAqui, ateOndePrevisto),
            pendente: trecho(ateOndePrevisto, total),
            larguraGrossa: (5 * escala).toFixed(2),
            larguraFina: (4.5 * escala).toFixed(2),
            tracoPrevisto: (9 * escala).toFixed(2) + ' ' + (9 * escala).toFixed(2),
            tracoPendente: (2 * escala).toFixed(2) + ' ' + (9 * escala).toFixed(2),
            transform: `translate(${ponto.x.toFixed(1)},${ponto.y.toFixed(1)}) scale(${escala.toFixed(3)})`,
            rotulo: caminhao.nome + ', ' + textoSituacao(caminhao)
        };
    });
});

function selecionar(id) {
    estado.caminhaoSelecionado = id;
}

function aproximar() {
    zoomPara(estado.mapa.zoom * 1.4);
    mostrarSeloZoom();
}

function afastar() {
    zoomPara(estado.mapa.zoom / 1.4);
    mostrarSeloZoom();
}

function acharMorador() {
    centralizarNoMorador();
    const halo = document.getElementById('halo-usuario');
    if (halo) {
        halo.classList.remove('pulso');
        void halo.getBoundingClientRect();   // força o navegador a reiniciar a animação
        halo.classList.add('pulso');
    }
}

onMounted(async () => {
    usarMapa({ svg: svg.value, mapa: caixa.value });
    await nextTick();
    ligarGestosDoMapa(puxador.value);
    centralizarNoMorador();
});

onBeforeUnmount(() => {
    // Ao trocar de tela a caixa some; ao voltar, a janela é refeita com as
    // medidas de verdade.
    aplicarVista();
});
</script>
