<template>
    <div class="boas-vindas">
        <div class="boas-vindas__marca">
            <span class="boas-vindas__icone">
                <svg class="icone" width="34" height="34"><use href="#ic-caminhao" /></svg>
            </span>
            <h1 class="boas-vindas__titulo">TrashTime</h1>
            <p class="boas-vindas__texto">
                Acompanhe a coleta de lixo do seu bairro em tempo real e saiba exatamente
                quando descer o lixo.
            </p>
        </div>

        <p class="campo__rotulo">Onde você mora?</p>
        <div class="chips chips--coluna">
            <button class="chip" v-for="(regiao, id) in REGIOES" :key="id"
                    :class="{ 'chip--ativo': id === escolhida }" @click="escolhida = id">
                {{ regiao.nome }}
                <span class="chip__detalhe">{{ regiao.comum.length }} coletas comuns por semana</span>
            </button>
        </div>

        <label class="campo__rotulo" for="boas-vindas-endereco">Rua e número (opcional)</label>
        <input class="campo" id="boas-vindas-endereco" type="text" v-model="endereco"
               :placeholder="REGIOES[escolhida || estado.regiao].endereco">

        <button class="botao-principal" :disabled="!escolhida" @click="confirmar">
            {{ edicao ? 'Salvar' : 'Começar' }}
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { REGIOES } from '../dados/regioes.js';
import { estado, trocarRegiao } from '../estado/estado.js';

const props = defineProps({ edicao: { type: Boolean, default: false } });
const emit = defineEmits(['pronto']);

const escolhida = ref(props.edicao ? estado.regiao : null);
const endereco = ref(props.edicao ? estado.endereco : '');

function confirmar() {
    if (!escolhida.value) {
        return;
    }
    estado.endereco = endereco.value.trim();
    estado.configurado = true;
    trocarRegiao(escolhida.value);
    emit('pronto');
}
</script>
