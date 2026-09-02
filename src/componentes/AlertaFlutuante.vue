<template>
    <div class="alerta" role="status" aria-live="polite" v-if="alerta.visivel">
        <svg class="icone" width="24" height="24"><use :href="`#${alerta.icone}`" /></svg>
        <div>
            <p class="alerta__titulo">{{ alerta.titulo }}</p>
            <p class="alerta__texto">{{ alerta.texto }}</p>
        </div>
    </div>
</template>

<script setup>
import { alerta } from '../estado/estado.js';
</script>
