/* O estado do app, em um lugar só.

   Isto é o coração da mudança para o Vue: `estado` é um objeto reativo, então
   mexer em qualquer campo dele redesenha sozinho tudo que depende daquele
   campo. Na versão anterior era preciso lembrar de chamar desenharCalendario(),
   desenharAvisos(), desenharStatus() e mais dezessete funções na mão depois de
   cada alteração - e esquecer uma delas deixava a tela desatualizada. */

import { reactive, ref, computed, watch } from 'vue';
import { REGIOES } from '../dados/regioes.js';
import { CAMINHOES } from '../dados/caminhoes.js';
import { AVISOS_BASE } from '../dados/listas.js';
import { CHAVE_ARMAZENAMENTO, ZOOM_PADRAO } from '../dados/constantes.js';
import { chaveData, rotuloQuando } from '../nucleo/datas.js';

export const estado = reactive({
    tela: 'mapa',
    regiao: 'campina',
    caminhaoSelecionado: 'ct104',
    mapa: { zoom: ZOOM_PADRAO, cx: 251.4, cy: 208.3, expandido: false },
    seguindo: true,
    mesVisivel: new Date().getMonth(),
    anoVisivel: new Date().getFullYear(),
    diaSelecionado: chaveData(new Date()),
    filtroAvisos: 'todos',
    lidos: [],
    relatos: [],
    endereco: '',
    configurado: false,
    contadorProtocolo: 1,
    config: {
        proximidade: true,
        horario: true,
        prefeitura: true,
        resumo: false,
        distancia: 500,
        hora: '20:00',
        tema: null            // null = segue o aparelho; 'claro' ou 'escuro' = escolha do morador
    }
});

// A frota também é reativa: quando um caminhão anda, o mapa acompanha
export const frota = reactive(CAMINHOES);

export const avisosDinamicos = ref([]);

/* ---------- o que o app lembra entre uma visita e outra ---------- */

export function carregarPreferencias() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_ARMAZENAMENTO));
        if (!salvo) {
            return;
        }
        if (salvo.regiao && REGIOES[salvo.regiao]) {
            estado.regiao = salvo.regiao;
        }
        if (Array.isArray(salvo.lidos)) {
            estado.lidos = salvo.lidos;
        }
        if (salvo.config) {
            Object.assign(estado.config, salvo.config);
        }
        if (Array.isArray(salvo.relatos)) {
            estado.relatos = salvo.relatos;
        }
        if (typeof salvo.contadorProtocolo === 'number') {
            estado.contadorProtocolo = salvo.contadorProtocolo;
        }
        if (typeof salvo.endereco === 'string') {
            estado.endereco = salvo.endereco;
        }
        estado.configurado = salvo.configurado === true;
    } catch (erro) {
        // Navegador sem localStorage disponível: segue com os valores padrão
    }
}

export function salvarPreferencias() {
    try {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({
            regiao: estado.regiao,
            lidos: estado.lidos,
            config: estado.config,
            relatos: estado.relatos,
            contadorProtocolo: estado.contadorProtocolo,
            endereco: estado.endereco,
            configurado: estado.configurado
        }));
    } catch (erro) {
        // Sem persistência: o app continua funcionando na sessão atual
    }
}

// Guardar deixou de ser uma chamada espalhada por dez lugares: o watch percebe
// qualquer alteração no que interessa e salva sozinho.
export function ligarSalvamentoAutomatico() {
    watch(
        () => [estado.regiao, estado.lidos, estado.config, estado.relatos,
               estado.contadorProtocolo, estado.endereco, estado.configurado],
        salvarPreferencias,
        { deep: true }
    );
}

/* ---------- valores derivados ---------- */

export const regiaoAtual = computed(() => REGIOES[estado.regiao]);

export const pontoUsuario = computed(() => REGIOES[estado.regiao].ponto);

export const caminhaoAtual = computed(
    () => frota.find((c) => c.id === estado.caminhaoSelecionado) || frota[0]
);

// A lista de avisos junta três origens: os que o app gerou agora, os relatos
// enviados pelo morador e os avisos de base.
export const avisos = computed(() => {
    const deRelatos = estado.relatos.map((relato) => ({
        id: 'relato-' + relato.protocolo,
        tipo: 'aviso',
        titulo: 'Relato registrado · ' + relato.protocolo,
        corpo: relato.rotulo + ' · ' + relato.situacao +
            '. Você recebe um aviso quando houver resposta.',
        quando: rotuloQuando(relato.criadoEm)
    }));
    return avisosDinamicos.value.concat(deRelatos).concat(AVISOS_BASE);
});

export const naoLidos = computed(
    () => avisos.value.filter((a) => estado.lidos.indexOf(a.id) < 0).length
);

/* ---------- ações ---------- */

export function irPara(tela) {
    estado.tela = tela;
    window.scrollTo({ top: 0, behavior: 'instant' });
}

export function trocarRegiao(id) {
    estado.regiao = id;
    zerarAlertas();

    // O caminhão em destaque passa a ser o que atende o bairro escolhido
    const daRegiao = frota.find((c) => c.nome.indexOf(REGIOES[id].caminhao) >= 0);
    if (daRegiao) {
        estado.caminhaoSelecionado = daRegiao.id;
    }
}

export function alternarLido(id) {
    const n = estado.lidos.indexOf(id);
    if (n >= 0) {
        estado.lidos.splice(n, 1);
    } else {
        estado.lidos.push(id);
    }
}

export function marcarTodasLidas() {
    avisos.value.forEach((a) => {
        if (estado.lidos.indexOf(a.id) < 0) {
            estado.lidos.push(a.id);
        }
    });
}

/* ---------- o alerta que aparece no rodapé ---------- */

export const alerta = reactive({ visivel: false, titulo: '', texto: '', icone: 'ic-caminhao' });
let relogioAlerta = null;

export function mostrarAlerta(titulo, texto, icone) {
    alerta.titulo = titulo;
    alerta.texto = texto;
    alerta.icone = icone || 'ic-caminhao';
    alerta.visivel = true;
    window.clearTimeout(relogioAlerta);
    relogioAlerta = window.setTimeout(() => { alerta.visivel = false; }, 6000);
}

export function novoAviso(aviso) {
    avisosDinamicos.value.unshift(aviso);
    mostrarAlerta(aviso.titulo, aviso.corpo);
}

/* ---------- controle dos alertas de proximidade ---------- */

const alertaEnviado = {};

export function jaAvisou(id) {
    return alertaEnviado[id] === true;
}

export function marcarAvisado(id, valor) {
    alertaEnviado[id] = valor;
}

export function zerarAlertas() {
    Object.keys(alertaEnviado).forEach((k) => { delete alertaEnviado[k]; });
}
