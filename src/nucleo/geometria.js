/* Geometria das rotas: nada aqui depende da tela nem do estado do app.
   Uma rota é uma lista de pontos; estas funções medem, cortam e caminham
   sobre ela. */

export function comprimentoRota(rota) {
    let total = 0;
    for (let i = 0; i < rota.length - 1; i++) {
        total += Math.hypot(rota[i + 1].x - rota[i].x, rota[i + 1].y - rota[i].y);
    }
    return total;
}

// Devolve o ponto que está a "distancia" do início da rota
export function pontoEm(rota, distancia) {
    let restante = distancia;
    for (let i = 0; i < rota.length - 1; i++) {
        const a = rota[i];
        const b = rota[i + 1];
        const trecho = Math.hypot(b.x - a.x, b.y - a.y);
        if (restante <= trecho) {
            const t = trecho === 0 ? 0 : restante / trecho;
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        restante -= trecho;
    }
    return rota[rota.length - 1];
}

// Separa a rota em trecho já percorrido e trecho que ainda falta
export function dividirRota(rota, distancia) {
    const percorrido = [rota[0]];
    const previsto = [];
    let restante = distancia;
    let cortou = false;

    for (let i = 0; i < rota.length - 1; i++) {
        const a = rota[i];
        const b = rota[i + 1];
        const trecho = Math.hypot(b.x - a.x, b.y - a.y);

        if (!cortou && restante <= trecho) {
            const t = trecho === 0 ? 0 : restante / trecho;
            const corte = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
            percorrido.push(corte);
            previsto.push(corte, b);
            cortou = true;
        } else if (cortou) {
            previsto.push(b);
        } else {
            percorrido.push(b);
            restante -= trecho;
        }
    }
    return { percorrido: percorrido, previsto: previsto };
}

// Recorta o pedaço da rota entre duas distâncias percorridas
export function trechoRota(rota, de, ate) {
    const pontos = [];
    let acumulado = 0;

    for (let i = 0; i < rota.length - 1; i++) {
        const a = rota[i];
        const b = rota[i + 1];
        const comprimento = Math.hypot(b.x - a.x, b.y - a.y);
        const inicio = acumulado;
        const fim = acumulado + comprimento;

        if (fim > de && inicio < ate) {
            const t1 = Math.max(0, (de - inicio) / comprimento);
            const t2 = Math.min(1, (ate - inicio) / comprimento);
            const p1 = { x: a.x + (b.x - a.x) * t1, y: a.y + (b.y - a.y) * t1 };
            const p2 = { x: a.x + (b.x - a.x) * t2, y: a.y + (b.y - a.y) * t2 };
            if (pontos.length === 0) {
                pontos.push(p1);
            }
            pontos.push(p2);
        }
        acumulado = fim;
    }
    return pontos;
}

export function paraD(pontos) {
    return pontos.map(function (p, i) {
        return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    }).join(' ');
}

// Para que lado o caminhão está indo. Olha o trecho em que ele está; se aquele
// trecho for vertical, vale o último trecho horizontal antes dele - é o rumo
// que o caminhão trazia ao entrar na esquina.
//
// Antes isto era um campo guardado no caminhão e atualizado pelo relógio de um
// em um segundo. Como o sentido é consequência de onde ele está, calcular na
// hora dispensa guardar - e some a chance de o desenho ficar defasado.
export function sentidoNaRota(rota, distancia) {
    const trechos = rota.length - 1;
    const total = comprimentoRota(rota);
    const d = ((distancia % total) + total) % total;

    let acumulado = 0;
    let atual = 0;
    for (let i = 0; i < trechos; i++) {
        const passo = Math.hypot(rota[i + 1].x - rota[i].x, rota[i + 1].y - rota[i].y);
        atual = i;
        if (d <= acumulado + passo) {
            break;
        }
        acumulado += passo;
    }

    for (let k = 0; k < trechos; k++) {
        const i = ((atual - k) % trechos + trechos) % trechos;
        const dx = rota[i + 1].x - rota[i].x;
        if (Math.abs(dx) > 0.4) {
            return dx < 0 ? -1 : 1;
        }
    }
    return 1;
}
