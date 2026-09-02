<template>
    <div v-if="estado.relatos.length > 0">
        <div class="relato" v-for="relato in estado.relatos.slice(0, 3)" :key="relato.protocolo">
            <div style="flex-grow: 1">
                <p class="relato__protocolo">
                    {{ relato.protocolo }} · {{ rotuloQuando(relato.criadoEm) }}
                </p>
                <p class="relato__tipo">{{ relato.rotulo }}</p>
            </div>
            <span class="situacao">{{ relato.situacao }}</span>
        </div>
    </div>
</template>

<script setup>
import { estado } from '../estado/estado.js';
import { rotuloQuando } from '../nucleo/datas.js';
</script>
