<template>
    <nav class="abas">
        <div class="marca-lateral">
            <span class="marca-lateral__icone">
                <svg class="icone" width="22" height="22"><use href="#ic-caminhao" /></svg>
            </span>
            <span class="marca-lateral__nome">TrashTime</span>
        </div>
        <button class="aba" v-for="aba in ABAS" :key="aba.id"
                :class="{ 'aba--ativa': estado.tela === aba.id }" @click="irPara(aba.id)">
            <svg class="icone" width="23" height="23"><use :href="`#${aba.icone}`" /></svg>
            <span>{{ aba.nome }}</span>
            <i class="selo selo--aba" v-if="aba.id === 'avisos' && naoLidos > 0">{{ naoLidos }}</i>
        </button>
    </nav>
</template>

<script setup>
import { estado, naoLidos, irPara } from '../estado/estado.js';

const ABAS = [
    { id: 'mapa', nome: 'Mapa', icone: 'ic-pino' },
    { id: 'calendario', nome: 'Calendário', icone: 'ic-calendario' },
    { id: 'avisos', nome: 'Avisos', icone: 'ic-sino' },
    { id: 'config', nome: 'Configurações', icone: 'ic-config' }
];
</script>
