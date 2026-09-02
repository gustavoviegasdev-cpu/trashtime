<template>
    <div class="app">
        <IconesSvg />

        <!-- Só a tela ativa existe no documento. O keep-alive guarda o mapa
             montado, senão voltar para ele recomeçaria a montagem do SVG. -->
        <KeepAlive include="TelaMapa">
            <component :is="TELAS[estado.tela]"
                       @abrir-relato="folha = 'relato'"
                       @abrir-itinerario="folha = 'itinerario'"
                       @alterar-endereco="editandoEndereco = true" />
        </KeepAlive>

        <BarraAbas />

        <div class="folha-fundo" v-if="folha" @click="folha = null"></div>
        <FolhaRelato v-if="folha === 'relato'" @fechar="folha = null" />
        <FolhaItinerario v-if="folha === 'itinerario'" @fechar="folha = null" />

        <BoasVindas v-if="!estado.configurado || editandoEndereco"
                    :edicao="editandoEndereco"
                    @pronto="editandoEndereco = false" />

        <AlertaFlutuante />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import IconesSvg from './componentes/IconesSvg.vue';
import BarraAbas from './componentes/BarraAbas.vue';
import BoasVindas from './componentes/BoasVindas.vue';
import FolhaRelato from './componentes/FolhaRelato.vue';
import FolhaItinerario from './componentes/FolhaItinerario.vue';
import AlertaFlutuante from './componentes/AlertaFlutuante.vue';
import TelaMapa from './telas/TelaMapa.vue';
import TelaCalendario from './telas/TelaCalendario.vue';
import TelaAvisos from './telas/TelaAvisos.vue';
import TelaConfiguracoes from './telas/TelaConfiguracoes.vue';

import { REGIOES } from './dados/regioes.js';
import { estado, frota, novoAviso, jaAvisou, marcarAvisado } from './estado/estado.js';
import { metrosDoUsuario } from './estado/frota.js';
import { comprimentoRota } from './nucleo/geometria.js';
import { aplicarVista } from './mapa/usarMapa.js';

const TELAS = {
    mapa: TelaMapa,
    calendario: TelaCalendario,
    avisos: TelaAvisos,
    config: TelaConfiguracoes
};

const folha = ref(null);
const editandoEndereco = ref(false);

// Fechar a folha com Escape
function aoTeclar(evento) {
    if (evento.key === 'Escape' && folha.value) {
        folha.value = null;
    }
}

/* ---------- a simulação do deslocamento ---------- */

function avancarCaminhoes() {
    frota.forEach((caminhao) => {
        if (caminhao.velocidade === 0) {
            return;
        }
        const total = comprimentoRota(caminhao.rota);
        caminhao.progresso += caminhao.velocidade / total;

        if (caminhao.progresso >= 1) {
            caminhao.progresso = 0;
            caminhao.voltas++;
            marcarAvisado(caminhao.id, false);
        }
    });

    verificarProximidade();
}

function verificarProximidade() {
    if (!estado.config.proximidade) {
        return;
    }

    // Só interessa o caminhão que atende a região do morador
    const meuCaminhao = REGIOES[estado.regiao].caminhao;

    frota.forEach((caminhao) => {
        if (caminhao.velocidade === 0 || jaAvisou(caminhao.id)) {
            return;
        }
        if (caminhao.nome.indexOf(meuCaminhao) < 0) {
            return;
        }
        const metros = metrosDoUsuario(caminhao);
        if (metros <= estado.config.distancia) {
            marcarAvisado(caminhao.id, true);
            novoAviso({
                id: 'prox-' + caminhao.id + '-' + caminhao.voltas,
                tipo: 'caminhao',
                titulo: 'Caminhão a ' + Math.round(metros) + ' m de você',
                corpo: 'O ' + caminhao.nome.replace('Caminhão ', '') +
                       ' está chegando. Leve o lixo para a calçada.',
                quando: 'agora'
            });
        }
    });
}

let relogio = null;

onMounted(() => {
    document.addEventListener('keydown', aoTeclar);
    relogio = window.setInterval(avancarCaminhoes, 1000);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', aoTeclar);
    window.clearInterval(relogio);
});

// Voltar para o mapa: a caixa recuperou o tamanho, a janela é refeita
watch(() => estado.tela, (tela) => {
    if (tela === 'mapa') {
        window.requestAnimationFrame(aplicarVista);
    }
});
</script>
