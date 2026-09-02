/* Contas de calendário: que dia tem coleta, qual a próxima, como escrever
   uma hora. Também é tudo função pura. */

import { DIAS_SEMANA, MESES_MIN } from '../dados/listas.js';
import { REGIOES } from '../dados/regioes.js';

export function chaveData(data) {
    return data.getFullYear() + '-' + data.getMonth() + '-' + data.getDate();
}

export function tipoDeColeta(regiao, data) {
    const dia = data.getDay();
    if (REGIOES[regiao].comum.indexOf(dia) >= 0) {
        return 'comum';
    }
    if (REGIOES[regiao].seletiva.indexOf(dia) >= 0) {
        return 'seletiva';
    }
    return 'nenhum';
}

export function proximasColetas(regiao, quantidade) {
    const encontradas = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60 && encontradas.length < quantidade; i++) {
        const tipo = tipoDeColeta(regiao, cursor);
        if (tipo !== 'nenhum') {
            encontradas.push({ data: new Date(cursor), tipo: tipo, hoje: i === 0 });
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return encontradas;
}

export function janelaDe(regiao, tipo) {
    return tipo === 'seletiva' ? REGIOES[regiao].janelaSeletiva : REGIOES[regiao].janela;
}

export function doisDigitos(numero) {
    return numero < 10 ? '0' + numero : String(numero);
}

export function minutosDe(hora) {
    const partes = hora.split(':');
    return Number(partes[0]) * 60 + Number(partes[1]);
}

export function horaDeMinutos(minutos) {
    const m = Math.round(minutos);
    return doisDigitos(Math.floor(m / 60) % 24) + ':' + doisDigitos(m % 60);
}

export function somarMinutos(hora, minutos) {
    const partes = hora.split(':');
    const total = Number(partes[0]) * 60 + Number(partes[1]) + minutos;
    return doisDigitos(Math.floor(total / 60) % 24) + ':' + doisDigitos(total % 60);
}

// Semente estável a partir do texto: o mesmo dia devolve sempre o mesmo resultado.
// Usa FNV-1a com mistura final, senão datas vizinhas caem quase no mesmo valor.
export function semente(texto) {
    let valor = 2166136261;
    for (let i = 0; i < texto.length; i++) {
        valor ^= texto.charCodeAt(i);
        valor = Math.imul(valor, 16777619);
    }
    valor ^= valor >>> 15;
    valor = Math.imul(valor, 2246822507);
    valor ^= valor >>> 13;
    return (valor >>> 0) / 4294967296;
}

export function rotuloQuando(iso) {
    const data = new Date(iso);
    const hoje = new Date();
    if (chaveData(data) === chaveData(hoje)) {
        return 'hoje';
    }
    return doisDigitos(data.getDate()) + '/' + doisDigitos(data.getMonth() + 1);
}
