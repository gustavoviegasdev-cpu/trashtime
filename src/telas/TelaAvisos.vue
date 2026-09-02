<template>
    <section class="tela tela--ativa" id="tela-avisos">
        <header class="cabecalho cabecalho--acao">
            <div class="cabecalho__texto">
                <h1 class="cabecalho__titulo">Avisos</h1>
                <p class="cabecalho__subtitulo">{{ resumo }}</p>
            </div>
            <button class="botao-claro" @click="marcarTodasLidas">Marcar lidas</button>
        </header>

        <div class="chips">
            <button class="chip" v-for="filtro in FILTROS" :key="filtro.id"
                    :class="{ 'chip--ativo': filtro.id === estado.filtroAvisos }"
                    @click="estado.filtroAvisos = filtro.id">{{ filtro.nome }}</button>
        </div>

        <div class="lista lista--avisos">
            <p class="vazio" v-if="visiveis.length === 0">Nenhum aviso neste filtro.</p>
            <button class="aviso" v-for="aviso in visiveis" :key="aviso.id"
                    :class="{ 'aviso--lido': aviso.lido }" @click="alternarLido(aviso.id)">
                <span class="aviso__icone" :class="{ 'aviso__icone--alerta': aviso.tipo === 'aviso' }">
                    <svg class="icone" width="21" height="21"><use :href="`#${aviso.icone}`" /></svg>
                </span>
                <span class="aviso__meio">
                    <span class="aviso__topo">
                        <span class="aviso__titulo">{{ aviso.titulo }}</span>
                        <span class="aviso__hora">{{ aviso.quando }}</span>
                    </span>
                    <span class="aviso__corpo">{{ aviso.corpo }}</span>
                </span>
                <span class="aviso__ponto"></span>
            </button>
        </div>

        <p class="nota-rodape">Avisos são guardados por 30 dias</p>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { FILTROS } from '../dados/listas.js';
import { estado, avisos, naoLidos, alternarLido, marcarTodasLidas } from '../estado/estado.js';

const ICONES = { horario: 'ic-relogio', aviso: 'ic-alerta' };

const resumo = computed(() =>
    naoLidos.value === 0
        ? 'Tudo em dia por aqui'
        : `${naoLidos.value} não lidos · toque para marcar`);

const visiveis = computed(() => avisos.value
    .filter((a) => estado.filtroAvisos === 'todos' || a.tipo === estado.filtroAvisos)
    .map((a) => ({
        ...a,
        lido: estado.lidos.indexOf(a.id) >= 0,
        icone: ICONES[a.tipo] || 'ic-caminhao'
    })));
</script>
