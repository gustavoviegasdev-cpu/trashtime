<template>
    <div class="folha" role="dialog" aria-modal="true" aria-labelledby="itinerario-titulo">
        <div class="folha__puxador"></div>
        <div class="folha__topo">
            <h2 class="folha__titulo" id="itinerario-titulo">{{ caminhao.nome }}</h2>
            <button class="folha__fechar" aria-label="Fechar" @click="$emit('fechar')">×</button>
        </div>
        <p class="folha__texto">
            {{ caminhao.setor }} · {{ textoSituacao(caminhao) }} · {{ textoChegada(caminhao) }}
        </p>

        <div class="progresso">
            <div class="progresso__trilho">
                <div class="progresso__barra" :style="{ width: percentual + '%' }"></div>
            </div>
            <span class="progresso__valor">{{ percentual }}%</span>
        </div>

        <p class="campo__rotulo">Ruas da rota</p>
        <div>
            <div class="rua" v-for="(rua, n) in ruas" :key="n" :class="`rua--${rua.situacao}`">
                <span class="rua__marca"></span>
                <span class="rua__nome">{{ rua.nome }}</span>
                <span class="rua__hora">{{ rua.hora }}</span>
            </div>
        </div>

        <p class="folha__nota">
            Horários distribuídos ao longo da janela de coleta do bairro.
            O deslocamento na tela é acelerado.
        </p>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { caminhaoAtual } from '../estado/estado.js';
import { textoSituacao, textoChegada, itinerarioDe } from '../estado/frota.js';

defineEmits(['fechar']);

const caminhao = caminhaoAtual;
const percentual = computed(() =>
    caminhao.value.velocidade === 0 ? 0 : Math.round(caminhao.value.progresso * 100));
const ruas = computed(() => itinerarioDe(caminhao.value));
</script>
