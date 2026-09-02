<template>
    <div class="folha" role="dialog" aria-modal="true" aria-labelledby="folha-titulo">
        <div class="folha__puxador"></div>
        <div class="folha__topo">
            <h2 class="folha__titulo" id="folha-titulo">Relatar um problema</h2>
            <button class="folha__fechar" aria-label="Fechar" @click="$emit('fechar')">×</button>
        </div>
        <p class="folha__texto">
            Seu relato vira um protocolo que a prefeitura pode acompanhar.
        </p>

        <p class="campo__rotulo">O que aconteceu?</p>
        <div class="grade-tipos">
            <button class="tipo" v-for="tipo in TIPOS_RELATO" :key="tipo.id"
                    :class="{ 'tipo--ativo': tipo.id === escolhido }"
                    :aria-pressed="tipo.id === escolhido" @click="escolhido = tipo.id">
                {{ tipo.rotulo }}
            </button>
        </div>

        <label class="campo__rotulo" for="descricao-relato">Descrição (opcional)</label>
        <textarea class="campo" id="descricao-relato" rows="3" v-model="descricao"
                  placeholder="Ex.: o caminhão passou na rua mas não recolheu o lado par."></textarea>

        <div class="campo-local">
            <svg class="icone" width="16" height="16"><use href="#ic-pino" /></svg>
            <span>{{ local }}</span>
        </div>

        <button class="botao-principal" :disabled="!escolhido" @click="enviar">Enviar relato</button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { TIPOS_RELATO } from '../dados/listas.js';
import { estado, regiaoAtual, mostrarAlerta } from '../estado/estado.js';

const emit = defineEmits(['fechar']);

const escolhido = ref(null);
const descricao = ref('');

const local = computed(() =>
    `${regiaoAtual.value.nome} · ${estado.endereco || regiaoAtual.value.endereco}`);

function enviar() {
    if (!escolhido.value) {
        return;
    }
    const tipo = TIPOS_RELATO.find((t) => t.id === escolhido.value);

    estado.contadorProtocolo++;
    const numero = ('0000' + estado.contadorProtocolo).slice(-4);
    const protocolo = 'PT-' + new Date().getFullYear() + '-' + numero;

    estado.relatos.unshift({
        protocolo,
        tipo: tipo.id,
        rotulo: tipo.rotulo,
        descricao: descricao.value.trim(),
        regiao: estado.regiao,
        situacao: 'Em análise',
        criadoEm: new Date().toISOString()
    });

    escolhido.value = null;
    descricao.value = '';
    emit('fechar');
    mostrarAlerta('Relato ' + protocolo + ' registrado',
                  tipo.rotulo + ' · a prefeitura foi notificada.', 'ic-alerta');
}
</script>
