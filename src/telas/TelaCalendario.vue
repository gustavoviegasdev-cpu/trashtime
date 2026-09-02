<template>
    <section class="tela tela--ativa" id="tela-calendario">
        <header class="cabecalho cabecalho--simples">
            <div class="cabecalho__texto">
                <h1 class="cabecalho__titulo">Calendário</h1>
                <p class="cabecalho__subtitulo">Dias e horários de coleta por região</p>
            </div>
        </header>

        <div class="faixa faixa--principal">
            <div class="chips">
                <button class="chip" v-for="(regiao, id) in REGIOES" :key="id"
                        :class="{ 'chip--ativo': id === estado.regiao }"
                        @click="trocarRegiao(id)">{{ regiao.nome }}</button>
            </div>

            <div class="mes">
                <button class="botao-mes" aria-label="Mês anterior" @click="andarMes(-1)">‹</button>
                <div class="mes__texto">
                    <p class="mes__nome">{{ MESES[estado.mesVisivel] }} de {{ estado.anoVisivel }}</p>
                    <p class="mes__resumo">
                        {{ resumo.comuns }} coletas comuns · {{ resumo.seletivas }} seletivas
                    </p>
                </div>
                <button class="botao-mes" aria-label="Próximo mês" @click="andarMes(1)">›</button>
            </div>

            <div class="semana">
                <span v-for="d in DIAS_CURTOS" :key="d">{{ d }}</span>
            </div>

            <div class="grade">
                <div class="dia dia--vazio" v-for="n in vazios" :key="`v${n}`"></div>
                <button v-for="dia in dias" :key="dia.chave" class="dia"
                        :class="{
                            'dia--coleta': dia.tipo !== 'nenhum',
                            'dia--hoje': dia.hoje,
                            'dia--selecionado': dia.selecionado
                        }"
                        @click="estado.diaSelecionado = dia.chave">
                    <span class="dia__numero">{{ dia.numero }}</span>
                    <span class="dia__ponto" :style="{ background: dia.cor }"></span>
                </button>
            </div>

            <div class="legenda-cal">
                <span class="legenda__item"><i class="bolinha bolinha--comum"></i>Coleta comum</span>
                <span class="legenda__item"><i class="bolinha bolinha--seletiva"></i>Coleta seletiva</span>
                <span class="legenda__item"><i class="bolinha bolinha--hoje"></i>Hoje</span>
            </div>
        </div>

        <div class="faixa faixa--lado">
            <div>
                <div class="detalhe">
                    <div class="detalhe__topo">
                        <div style="flex-grow: 1">
                            <p class="detalhe__titulo">{{ detalhe.titulo }}</p>
                            <p class="detalhe__regiao">{{ regiaoAtual.nome }} · sua região</p>
                        </div>
                        <span class="marca" :class="detalhe.classeMarca" :style="detalhe.estiloMarca">
                            {{ detalhe.marca }}
                        </span>
                    </div>

                    <div class="detalhe__caixas" v-if="detalhe.caixas">
                        <div class="caixa">
                            <p class="caixa__rotulo">{{ detalhe.caixas[0].rotulo }}</p>
                            <p class="caixa__valor">{{ detalhe.caixas[0].valor }}</p>
                        </div>
                        <div class="caixa">
                            <p class="caixa__rotulo">{{ detalhe.caixas[1].rotulo }}</p>
                            <p class="caixa__valor" :class="detalhe.caixas[1].classe">
                                {{ detalhe.caixas[1].valor }}
                            </p>
                        </div>
                    </div>

                    <p class="detalhe__relato" v-if="detalhe.relato">{{ detalhe.relato }}</p>
                </div>
            </div>

            <div class="secao">
                <div class="secao__cabecalho">
                    <h2 class="secao__titulo">Últimas coletas</h2>
                </div>
                <div>
                    <div class="historico__item" v-for="item in historico" :key="item.chave">
                        <span class="historico__marca" :class="`historico__marca--${item.cor}`"></span>
                        <div style="flex-grow: 1">
                            <p class="historico__data">{{ item.data }}</p>
                            <p class="historico__situacao">{{ item.situacao }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { REGIOES } from '../dados/regioes.js';
import { MESES, MESES_MIN, DIAS_SEMANA, DIAS_CURTOS } from '../dados/listas.js';
import { estado, regiaoAtual, trocarRegiao } from '../estado/estado.js';
import { historicoDoDia, relatoDoDia } from '../estado/frota.js';
import { chaveData, tipoDeColeta, janelaDe, doisDigitos } from '../nucleo/datas.js';

function andarMes(passo) {
    let mes = estado.mesVisivel + passo;
    let ano = estado.anoVisivel;
    if (mes < 0) { mes = 11; ano--; }
    if (mes > 11) { mes = 0; ano++; }
    estado.mesVisivel = mes;
    estado.anoVisivel = ano;
}

const vazios = computed(() => new Date(estado.anoVisivel, estado.mesVisivel, 1).getDay());

const dias = computed(() => {
    const total = new Date(estado.anoVisivel, estado.mesVisivel + 1, 0).getDate();
    const chaveHoje = chaveData(new Date());
    const lista = [];

    for (let numero = 1; numero <= total; numero++) {
        const data = new Date(estado.anoVisivel, estado.mesVisivel, numero);
        const tipo = tipoDeColeta(estado.regiao, data);
        const chave = chaveData(data);
        const selecionado = chave === estado.diaSelecionado;

        let cor = 'transparent';
        if (tipo === 'comum') {
            cor = selecionado ? '#FFFFFF' : 'var(--verde)';
        } else if (tipo === 'seletiva') {
            cor = selecionado ? '#FFE7B8' : 'var(--ambar)';
        }
        lista.push({ numero, chave, tipo, cor, selecionado, hoje: chave === chaveHoje });
    }
    return lista;
});

const resumo = computed(() => ({
    comuns: dias.value.filter((d) => d.tipo === 'comum').length,
    seletivas: dias.value.filter((d) => d.tipo === 'seletiva').length
}));

const detalhe = computed(() => {
    const partes = estado.diaSelecionado.split('-');
    const data = new Date(Number(partes[0]), Number(partes[1]), Number(partes[2]));
    const tipo = tipoDeColeta(estado.regiao, data);
    const passado = historicoDoDia(estado.regiao, data);
    const relato = relatoDoDia(data);

    let marca = 'Sem coleta';
    let classeMarca = '';
    let estiloMarca = 'background: var(--borda-suave); color: var(--texto-suave)';
    if (tipo === 'comum') {
        marca = 'Coleta comum'; classeMarca = 'marca--comum'; estiloMarca = '';
    } else if (tipo === 'seletiva') {
        marca = 'Coleta seletiva'; classeMarca = 'marca--seletiva'; estiloMarca = '';
    }

    let caixas = null;
    if (passado) {
        // Dia que já aconteceu: mostra o que de fato foi feito
        caixas = [
            { rotulo: 'HORÁRIO REAL', valor: passado.hora },
            { rotulo: 'SITUAÇÃO', valor: passado.situacao, classe: `caixa__valor--${passado.cor}` }
        ];
    } else if (tipo !== 'nenhum') {
        caixas = [
            { rotulo: 'HORÁRIO PREVISTO', valor: janelaDe(estado.regiao, tipo) },
            { rotulo: 'CAMINHÃO', valor: regiaoAtual.value.caminhao }
        ];
    }

    return {
        titulo: DIAS_SEMANA[data.getDay()] + ', ' + data.getDate() +
                ' de ' + MESES_MIN[data.getMonth()],
        marca, classeMarca, estiloMarca, caixas,
        relato: relato
            ? `Você relatou um problema neste dia · ${relato.protocolo} · ${relato.situacao}`
            : null
    };
});

const historico = computed(() => {
    const itens = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(cursor.getDate() - 1);

    for (let i = 0; i < 40 && itens.length < 4; i++) {
        const registro = historicoDoDia(estado.regiao, cursor);
        if (registro) {
            const d = new Date(cursor);
            itens.push({
                chave: chaveData(d),
                cor: registro.cor,
                data: `${DIAS_CURTOS[d.getDay()]} · ${doisDigitos(d.getDate())}/` +
                      `${doisDigitos(d.getMonth() + 1)} · ` +
                      (registro.tipo === 'seletiva' ? 'seletiva' : 'comum'),
                situacao: registro.situacao + (registro.hora === '—' ? '' : ' às ' + registro.hora)
            });
        }
        cursor.setDate(cursor.getDate() - 1);
    }
    return itens;
});
</script>
