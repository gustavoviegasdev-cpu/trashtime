/* Perguntas sobre a frota que dependem de onde o morador mora: a que
   distância o caminhão está, o que ele já fez hoje, por onde ele passa.
   Ficam separadas da geometria pura porque leem o estado do app. */

import { REGIOES } from '../dados/regioes.js';
import { ESCALA } from '../dados/constantes.js';
import { estado, pontoUsuario } from './estado.js';
import { comprimentoRota, pontoEm, dividirRota } from '../nucleo/geometria.js';
import {
    chaveData, minutosDe, horaDeMinutos, somarMinutos, semente, tipoDeColeta, janelaDe
} from '../nucleo/datas.js';

// Quantos metros de rota ainda faltam até o ponto mais próximo do usuário
export function metrosAteUsuario(caminhao) {
    let melhorDistancia = Infinity;
    let melhorAoLongo = 0;
    let acumulado = 0;

    const eu = pontoUsuario.value;

    for (let i = 0; i < caminhao.rota.length - 1; i++) {
        const a = caminhao.rota[i];
        const b = caminhao.rota[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const trecho = Math.hypot(dx, dy);
        let t = trecho === 0 ? 0 : ((eu.x - a.x) * dx + (eu.y - a.y) * dy) / (trecho * trecho);
        t = Math.max(0, Math.min(1, t));
        const px = a.x + dx * t;
        const py = a.y + dy * t;
        const distancia = Math.hypot(eu.x - px, eu.y - py);

        if (distancia < melhorDistancia) {
            melhorDistancia = distancia;
            melhorAoLongo = acumulado + trecho * t;
        }
        acumulado += trecho;
    }

    const percorrido = caminhao.progresso * comprimentoRota(caminhao.rota);
    return (melhorAoLongo - percorrido) * ESCALA;
}

// Distância em linha reta entre o caminhão e o morador
export function metrosDoUsuario(caminhao) {
    const total = comprimentoRota(caminhao.rota);
    const ponto = pontoEm(caminhao.rota, caminhao.progresso * total);
    const eu = pontoUsuario.value;
    return Math.hypot(eu.x - ponto.x, eu.y - ponto.y) * ESCALA;
}

export function textoChegada(caminhao) {
    if (caminhao.velocidade === 0) {
        return 'rota ainda não iniciada';
    }
    const metros = metrosAteUsuario(caminhao);
    if (metros <= 0) {
        return 'já passou pela sua rua';
    }
    const segundos = metros / (caminhao.velocidade * ESCALA);
    if (segundos < 60) {
        return 'chega em menos de 1 min';
    }
    return 'chega em ~' + Math.round(segundos / 60) + ' min';
}

export function textoSituacao(caminhao) {
    if (caminhao.velocidade === 0) {
        return 'Aguardando início da rota';
    }
    const metros = metrosAteUsuario(caminhao);
    if (metros <= 0) {
        return 'Já passou pela sua região';
    }
    if (metros < 600) {
        return 'A caminho do seu bairro';
    }
    return 'Coletando';
}

// Qual bairro este caminhão atende
export function regiaoDoCaminhao(caminhao) {
    const chave = Object.keys(REGIOES).find(function (id) {
        return caminhao.nome.indexOf(REGIOES[id].caminhao) >= 0;
    });
    return chave ? REGIOES[chave] : null;
}

// Estado de cada rua da rota, comparando o quanto o caminhão já andou
export function itinerarioDe(caminhao) {
    const total = comprimentoRota(caminhao.rota);
    const andado = caminhao.progresso * total;
    const parado = caminhao.velocidade === 0;
    const regiao = regiaoDoCaminhao(caminhao);
    const itens = [];

    // Os horários saem da janela de coleta do bairro, não do relógio: o caminhão
    // percorre a rota ao longo dela, então o itinerário fecha com o que o
    // calendário e os cartões de status prometem.
    const janela = regiao ? regiao.janela : '06:00 – 09:00';
    const partida = minutosDe(janela.split(' – ')[0]);
    const chegada = minutosDe(janela.split(' – ')[1]);

    const horaNaDistancia = function (distancia) {
        return horaDeMinutos(partida + (distancia / total) * (chegada - partida));
    };

    let inicio = 0;
    for (let i = 0; i < caminhao.rota.length - 1; i++) {
        const a = caminhao.rota[i];
        const b = caminhao.rota[i + 1];
        const fim = inicio + Math.hypot(b.x - a.x, b.y - a.y);
        const nome = caminhao.ruas[i] || 'Trecho ' + (i + 1);

        let situacao = 'pendente';
        let hora = horaNaDistancia(inicio);

        if (parado) {
            situacao = 'pendente';
        } else if (andado >= fim) {
            situacao = 'atendida';
            hora = horaNaDistancia(fim);
        } else if (andado > inicio) {
            situacao = 'agora';
            hora = 'agora';
        }

        itens.push({ nome: nome, situacao: situacao, hora: hora });
        inicio = fim;
    }
    return itens;
}

// Devolve o que aconteceu num dia passado, ou null se o dia ainda não chegou
export function historicoDoDia(regiao, data) {
    const tipo = tipoDeColeta(regiao, data);
    if (tipo === 'nenhum') {
        return null;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(data);
    alvo.setHours(0, 0, 0, 0);
    if (alvo >= hoje) {
        return null;
    }

    const sorte = semente(regiao + '-' + chaveData(data));
    const janela = janelaDe(regiao, tipo);
    const inicio = janela.split(' – ')[0];
    const fim = janela.split(' – ')[1];

    if (sorte < 0.05) {
        return { situacao: 'Não realizada', hora: '—', cor: 'reprovada', tipo: tipo };
    }
    if (sorte < 0.16) {
        return {
            situacao: 'Com atraso',
            hora: somarMinutos(fim, 15 + Math.floor(sorte * 100)),
            cor: 'atrasada',
            tipo: tipo
        };
    }
    return {
        situacao: 'Realizada',
        hora: somarMinutos(inicio, 20 + Math.floor(sorte * 90)),
        cor: 'aprovada',
        tipo: tipo
    };
}

// Relato que o morador abriu naquele dia, se houver
export function relatoDoDia(data) {
    return estado.relatos.find(function (relato) {
        return chaveData(new Date(relato.criadoEm)) === chaveData(data);
    });
}
