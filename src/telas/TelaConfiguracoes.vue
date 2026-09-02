<template>
    <section class="tela tela--ativa" id="tela-config">
        <header class="cabecalho cabecalho--simples">
            <div class="cabecalho__texto">
                <h1 class="cabecalho__titulo">Configurações</h1>
                <p class="cabecalho__subtitulo">Região, alertas e lembretes</p>
            </div>
        </header>

        <div class="faixa faixa--principal">
            <p class="secao__rotulo">SUA REGIÃO</p>
            <div class="chips chips--coluna">
                <button class="chip" v-for="(regiao, id) in REGIOES" :key="id"
                        :class="{ 'chip--ativo': id === estado.regiao }" @click="trocarRegiao(id)">
                    {{ regiao.nome }}
                    <span class="chip__detalhe">{{ regiao.endereco }}</span>
                </button>
            </div>

            <div class="cartao" style="margin-top: 10px">
                <div class="linha">
                    <div>
                        <p class="linha__titulo">Seu endereço</p>
                        <p class="linha__texto">{{ enderecoAtual }}</p>
                    </div>
                    <button class="botao-claro" @click="$emit('alterar-endereco')">Alterar</button>
                </div>
            </div>
        </div>

        <div class="faixa faixa--lado">
            <p class="secao__rotulo">APARÊNCIA</p>
            <div class="cartao">
                <div class="linha">
                    <div>
                        <p class="linha__titulo">Modo escuro</p>
                        <p class="linha__texto">{{ textoTema }}</p>
                    </div>
                    <button class="interruptor" :class="{ 'interruptor--ligado': escuro }"
                            role="switch" :aria-checked="escuro ? 'true' : 'false'"
                            aria-label="Modo escuro" @click="trocarTema(!escuro)">
                        <span class="interruptor__bolinha"></span>
                    </button>
                </div>
            </div>

            <p class="secao__rotulo">NOTIFICAÇÕES</p>
            <div class="cartao">
                <div class="linha" v-for="item in INTERRUPTORES" :key="item.id">
                    <div>
                        <p class="linha__titulo">{{ item.titulo }}</p>
                        <p class="linha__texto">{{ item.texto }}</p>
                    </div>
                    <button class="interruptor"
                            :class="{ 'interruptor--ligado': estado.config[item.id] }"
                            role="switch" :aria-checked="estado.config[item.id] ? 'true' : 'false'"
                            :aria-label="item.titulo"
                            @click="estado.config[item.id] = !estado.config[item.id]">
                        <span class="interruptor__bolinha"></span>
                    </button>
                </div>
            </div>

            <div class="bloco-distancia" v-if="estado.config.proximidade">
                <p class="bloco-distancia__rotulo">Avisar quando o caminhão estiver a</p>
                <div class="chips chips--interno">
                    <button class="chip" v-for="valor in DISTANCIAS" :key="valor"
                            :class="{ 'chip--ativo': valor === estado.config.distancia }"
                            @click="estado.config.distancia = valor">
                        {{ valor >= 1000 ? (valor / 1000) + ' km' : valor + ' m' }}
                    </button>
                </div>
            </div>

            <p class="secao__rotulo">LEMBRETE DE COLETA</p>
            <div class="cartao">
                <div class="linha">
                    <div>
                        <p class="linha__titulo">Lembrar na véspera</p>
                        <p class="linha__texto">Uma notificação no fim do dia anterior</p>
                    </div>
                    <span class="pilula-hora">{{ estado.config.hora }}</span>
                </div>
                <div class="chips chips--interno">
                    <button class="chip" v-for="hora in HORAS_LEMBRETE" :key="hora"
                            :class="{ 'chip--ativo': hora === estado.config.hora }"
                            @click="estado.config.hora = hora">{{ hora }}</button>
                </div>
            </div>

            <p class="nota-rodape">TrashTime · versão 2.0 · dados simulados</p>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { REGIOES } from '../dados/regioes.js';
import { INTERRUPTORES, DISTANCIAS, HORAS_LEMBRETE } from '../dados/listas.js';
import { estado, regiaoAtual, trocarRegiao } from '../estado/estado.js';
import { temaAtual, trocarTema } from '../estado/tema.js';

defineEmits(['alterar-endereco']);

const escuro = computed(() => temaAtual() === 'escuro');

const textoTema = computed(() => {
    if (estado.config.tema === null) {
        return 'Seguindo o ajuste do seu aparelho';
    }
    return escuro.value ? 'Fundo escuro, melhor de ler à noite' : 'Fundo claro, melhor sob o sol';
});

const enderecoAtual = computed(() => estado.endereco || regiaoAtual.value.endereco);
</script>
