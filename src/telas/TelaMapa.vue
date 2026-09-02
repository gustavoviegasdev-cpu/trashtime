<template>
    <section class="tela tela--ativa" id="tela-mapa">
        <header class="cabecalho">
            <div class="cabecalho__texto">
                <h1 class="cabecalho__titulo">Coleta de Lixo</h1>
                <p class="cabecalho__subtitulo">Acompanhe em tempo real</p>
            </div>
            <button class="cabecalho__sino" aria-label="Ver avisos" @click="irPara('avisos')">
                <svg class="icone" width="24" height="24"><use href="#ic-sino" /></svg>
                <span class="selo" v-if="naoLidos > 0">{{ naoLidos }}</span>
            </button>
        </header>

        <div class="faixa faixa--status">
            <div class="cartoes-status">
                <div class="cartao-status">
                    <div class="cartao-status__icone">
                        <svg class="icone" width="21" height="21"><use href="#ic-caminhao" /></svg>
                    </div>
                    <div>
                        <p class="rotulo">Caminhões em rota</p>
                        <p class="numerao">{{ emRota }} de {{ frota.length }}</p>
                        <p class="rotulo">em rota no centro</p>
                    </div>
                </div>
                <div class="cartao-status">
                    <div class="cartao-status__icone">
                        <svg class="icone" width="20" height="20"><use href="#ic-calendario" /></svg>
                    </div>
                    <div>
                        <p class="rotulo">Próxima coleta</p>
                        <p class="destaque">{{ proxima.dia }}</p>
                        <p class="rotulo">{{ proxima.hora }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="faixa faixa--principal">
            <MapaBelem />

            <div>
                <div class="cartao-caminhao" v-if="caminhaoAtual">
                    <span class="cartao-caminhao__ponto" :style="{ background: caminhaoAtual.cor }"></span>
                    <button class="cartao-caminhao__info" @click="$emit('abrir-itinerario')">
                        <p class="cartao-caminhao__nome">{{ caminhaoAtual.nome }}</p>
                        <p class="cartao-caminhao__setor">
                            {{ caminhaoAtual.setor }} · {{ textoSituacao(caminhaoAtual) }}
                        </p>
                        <p class="cartao-caminhao__eta">
                            {{ textoChegada(caminhaoAtual) }}
                            <span class="cartao-caminhao__ver">· ver itinerário ›</span>
                        </p>
                    </button>
                    <button class="botao-seguir" :class="{ 'botao-seguir--ativo': estado.seguindo }"
                            @click="estado.seguindo = !estado.seguindo">
                        {{ estado.seguindo ? 'Seguindo' : 'Seguir' }}
                    </button>
                </div>
            </div>
        </div>

        <div class="faixa faixa--lado">
            <div class="secao">
                <div class="secao__cabecalho">
                    <h2 class="secao__titulo">Próximas coletas</h2>
                    <button class="link" @click="irPara('calendario')">Ver calendário ›</button>
                </div>
                <div class="lista">
                    <div class="item-coleta" v-for="item in proximasDuas" :key="item.chave">
                        <div class="etiqueta-data"
                             :style="{ background: item.corFundo, color: item.corTexto }">
                            <p class="etiqueta-data__dia">{{ item.rotulo }}</p>
                            <p class="etiqueta-data__data">{{ item.data }}</p>
                        </div>
                        <div class="item-coleta__meio">
                            <div class="item-coleta__linha">
                                <svg class="icone" width="12" height="12"><use href="#ic-relogio" /></svg>
                                <span class="item-coleta__hora">{{ item.hora }}</span>
                            </div>
                            <div class="item-coleta__linha">
                                <svg class="icone" width="12" height="12"><use href="#ic-pino" /></svg>
                                <span class="item-coleta__bairro">{{ regiaoAtual.nome }} · seu bairro</span>
                            </div>
                        </div>
                        <span class="marca" :class="item.seletiva ? 'marca--seletiva' : 'marca--comum'">
                            {{ item.seletiva ? 'Seletiva' : 'Comum' }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="banner">
                <svg class="icone" width="30" height="30"><use href="#ic-lixeira" /></svg>
                <div>
                    <p class="banner__titulo">Vamos deixar nossa cidade mais limpa</p>
                    <p class="banner__texto">
                        Separe o reciclável do orgânico e leve para a calçada até 30 min antes.
                    </p>
                </div>
            </div>

            <div class="secao">
                <button class="acao-relato" @click="$emit('abrir-relato')">
                    <span class="acao-relato__icone">
                        <svg class="icone" width="21" height="21"><use href="#ic-alerta" /></svg>
                    </span>
                    <span class="acao-relato__texto">
                        <span class="acao-relato__titulo">Relatar um problema</span>
                        <span class="acao-relato__sub">
                            Coleta não realizada, lixo acumulado, horário fora do previsto
                        </span>
                    </span>
                    <span class="acao-relato__seta">›</span>
                </button>
                <MeusRelatos />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import MapaBelem from '../mapa/MapaBelem.vue';
import MeusRelatos from '../componentes/MeusRelatos.vue';
import { estado, frota, caminhaoAtual, regiaoAtual, naoLidos, irPara } from '../estado/estado.js';
import { textoChegada, textoSituacao } from '../estado/frota.js';
import { proximasColetas, janelaDe, doisDigitos, chaveData } from '../nucleo/datas.js';
import { DIAS_SEMANA, DIAS_CURTOS } from '../dados/listas.js';

defineEmits(['abrir-relato', 'abrir-itinerario']);

// Os caminhões atendem bairros diferentes, então o número é do centro inteiro
const emRota = computed(() => frota.filter((c) => c.velocidade > 0).length);

const proxima = computed(() => {
    const lista = proximasColetas(estado.regiao, 1);
    if (lista.length === 0) {
        return { dia: '—', hora: '—' };
    }
    const p = lista[0];
    return {
        dia: p.hoje ? 'Hoje' : DIAS_SEMANA[p.data.getDay()],
        hora: janelaDe(estado.regiao, p.tipo)
    };
});

const proximasDuas = computed(() => proximasColetas(estado.regiao, 2).map((item) => {
    const seletiva = item.tipo === 'seletiva';
    return {
        chave: chaveData(item.data) + item.tipo,
        seletiva,
        rotulo: item.hoje ? 'HOJE' : DIAS_CURTOS[item.data.getDay()],
        data: doisDigitos(item.data.getDate()) + '/' + doisDigitos(item.data.getMonth() + 1),
        hora: janelaDe(estado.regiao, item.tipo),
        corFundo: seletiva ? 'var(--ambar-claro)' : 'var(--verde-claro)',
        corTexto: seletiva ? 'var(--ambar-escuro)' : 'var(--verde-forte)'
    };
}));
</script>
