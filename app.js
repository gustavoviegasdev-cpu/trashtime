/* =========================================================
   TrashTime — acompanhamento da coleta de lixo
   Dados simulados: não há GPS nem servidor por trás.
   ========================================================= */

/* ---------- 1. Dados ---------- */

// 1 unidade do mapa equivale a 4 metros
const ESCALA = 4;

// Onde o morador está no mapa: cada bairro tem seu ponto
function pontoUsuario() {
    return REGIOES[estado.regiao].ponto;
}

const REGIOES = {
    campina: {
        nome: 'Campina',
        endereco: 'Trav. Campos Sales, 210',
        ponto: { x: 212, y: 94 },
        comum: [1, 3, 5],        // segunda, quarta, sexta
        seletiva: [6],           // sábado
        janela: '06:00 – 09:00',
        janelaSeletiva: '13:00 – 16:00',
        caminhao: 'CT-104'
    },
    cidadevelha: {
        nome: 'Cidade Velha',
        endereco: 'Rua Siqueira Mendes, 84',
        ponto: { x: 198, y: 200 },
        comum: [2, 4, 6],        // terça, quinta, sábado
        seletiva: [3],           // quarta
        janela: '05:30 – 08:30',
        janelaSeletiva: '14:00 – 17:00',
        caminhao: 'CT-118'
    },
    nazare: {
        nome: 'Nazaré',
        endereco: 'Av. Gentil Bittencourt, 1450',
        ponto: { x: 356, y: 60 },
        comum: [2, 4, 6],
        seletiva: [5],           // sexta
        janela: '07:00 – 10:00',
        janelaSeletiva: '15:00 – 18:00',
        caminhao: 'CT-090'
    },
    batistacampos: {
        nome: 'Batista Campos',
        endereco: 'Trav. Padre Eutíquio, 780',
        ponto: { x: 336, y: 160 },
        comum: [1, 3, 5],
        seletiva: [4],           // quinta
        janela: '06:30 – 09:30',
        janelaSeletiva: '14:30 – 17:30',
        caminhao: 'CT-076'
    }
};

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DIAS_CURTOS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_MIN = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Cada rota acompanha as ruas desenhadas no mapa
const CAMINHOES = [
    {
        id: 'ct104',
        nome: 'Caminhão CT-104',
        setor: 'Setor Campina',
        cor: '#1F7A45',
        velocidade: 1.6,
        progresso: 0.46,
        voltas: 0,
        rota: [
            { x: 104, y: 104 }, { x: 140, y: 98 }, { x: 146, y: 62 },
            { x: 198, y: 54 }, { x: 206, y: 92 }
        ],
        ruas: ['Blvd. Castilhos França', 'Rua Santo Antônio', 'Av. Presidente Vargas', 'Trav. Campos Sales']
    },
    {
        id: 'ct118',
        nome: 'Caminhão CT-118',
        setor: 'Setor Cidade Velha',
        cor: '#2FA85A',
        velocidade: 1.1,
        progresso: 0.30,
        voltas: 0,
        rota: [
            { x: 100, y: 172 }, { x: 140, y: 166 }, { x: 148, y: 200 },
            { x: 192, y: 194 }
        ],
        ruas: ['Rua Padre Champagnat', 'Rua Dr. Malcher', 'Rua Siqueira Mendes']
    },
    {
        id: 'ct090',
        nome: 'Caminhão CT-090',
        setor: 'Setor Nazaré',
        cor: '#2FA85A',
        velocidade: 1.3,
        progresso: 0.22,
        voltas: 0,
        rota: [
            { x: 238, y: 34 }, { x: 292, y: 26 }, { x: 300, y: 62 },
            { x: 352, y: 54 }
        ],
        ruas: ['Av. Nazaré', 'Trav. 14 de Março', 'Av. Gentil Bittencourt']
    },
    {
        id: 'ct076',
        nome: 'Caminhão CT-076',
        setor: 'Setor Batista Campos',
        cor: '#8A968D',
        velocidade: 0,          // ainda não saiu da garagem
        progresso: 0,
        voltas: 0,
        rota: [
            { x: 216, y: 210 }, { x: 268, y: 202 }, { x: 276, y: 164 },
            { x: 330, y: 156 }
        ],
        ruas: ['Rua dos Mundurucus', 'Trav. Padre Eutíquio', 'Av. Gov. José Malcher']
    }
];

const AVISOS_BASE = [
    { id: 'a2', tipo: 'horario', titulo: 'Coleta de amanhã mudou', corpo: 'A Campina passa a ser coletada das 05:30 às 08:30.', quando: 'há 2 h' },
    { id: 'a3', tipo: 'aviso', titulo: 'Mutirão de recicláveis', corpo: 'Entrega voluntária na Praça da República, das 08:00 às 12:00.', quando: 'ontem' },
    { id: 'a4', tipo: 'caminhao', titulo: 'Coleta concluída na rua', corpo: 'O CT-104 finalizou a Trav. Campos Sales às 07:12 de hoje.', quando: 'ontem' },
    { id: 'a5', tipo: 'aviso', titulo: 'Círio de Nazaré altera a coleta', corpo: 'No fim de semana do Círio, o entorno da Basílica tem coleta reforçada à noite.', quando: 'há 3 dias' }
];

const FILTROS = [
    { id: 'todos', nome: 'Todos' },
    { id: 'caminhao', nome: 'Caminhão' },
    { id: 'horario', nome: 'Horário' },
    { id: 'aviso', nome: 'Avisos' }
];

const INTERRUPTORES = [
    { id: 'proximidade', titulo: 'Caminhão se aproximando', texto: 'Alerta quando o caminhão entra na sua rua' },
    { id: 'horario', titulo: 'Mudança de horário', texto: 'Antecipações, atrasos e feriados' },
    { id: 'prefeitura', titulo: 'Avisos da prefeitura', texto: 'Mutirões, campanhas e interrupções' },
    { id: 'resumo', titulo: 'Resumo semanal', texto: 'Um retrato das coletas do seu bairro' }
];

const TIPOS_RELATO = [
    { id: 'nao-realizada', rotulo: 'Coleta não realizada' },
    { id: 'acumulo', rotulo: 'Lixo acumulado na via' },
    { id: 'fora-horario', rotulo: 'Passou fora do horário' },
    { id: 'outro', rotulo: 'Outro problema' }
];

const DISTANCIAS = [200, 500, 1000];
const HORAS_LEMBRETE = ['18:00', '20:00', '21:30'];

/* ---------- 2. Estado ---------- */

const CHAVE_ARMAZENAMENTO = 'trashtime';

let estado = {
    tela: 'mapa',
    regiao: 'campina',
    caminhaoSelecionado: 'ct104',
    seguindo: true,
    mesVisivel: new Date().getMonth(),
    anoVisivel: new Date().getFullYear(),
    diaSelecionado: chaveData(new Date()),
    filtroAvisos: 'todos',
    lidos: [],
    relatos: [],
    endereco: '',
    configurado: false,
    tipoRelato: null,
    contadorProtocolo: 0,
    config: {
        proximidade: true,
        horario: true,
        prefeitura: true,
        resumo: false,
        distancia: 500,
        hora: '20:00'
    }
};

let avisos = AVISOS_BASE.slice();
let avisosDinamicos = [];

function carregarPreferencias() {
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
            estado.config = Object.assign(estado.config, salvo.config);
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

function salvarPreferencias() {
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

/* ---------- 3. Geometria das rotas ---------- */

function comprimentoRota(rota) {
    let total = 0;
    for (let i = 0; i < rota.length - 1; i++) {
        total += Math.hypot(rota[i + 1].x - rota[i].x, rota[i + 1].y - rota[i].y);
    }
    return total;
}

// Devolve o ponto que está a "distancia" do início da rota
function pontoEm(rota, distancia) {
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
function dividirRota(rota, distancia) {
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

// Quantos metros de rota ainda faltam até o ponto mais próximo do usuário
function metrosAteUsuario(caminhao) {
    let melhorDistancia = Infinity;
    let melhorAoLongo = 0;
    let acumulado = 0;

    const eu = pontoUsuario();

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
function metrosDoUsuario(caminhao) {
    const total = comprimentoRota(caminhao.rota);
    const ponto = pontoEm(caminhao.rota, caminhao.progresso * total);
    const eu = pontoUsuario();
    return Math.hypot(eu.x - ponto.x, eu.y - ponto.y) * ESCALA;
}

function textoChegada(caminhao) {
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

function textoSituacao(caminhao) {
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

/* ---------- 4. Datas e coletas ---------- */

function chaveData(data) {
    return data.getFullYear() + '-' + data.getMonth() + '-' + data.getDate();
}

function tipoDeColeta(regiao, data) {
    const dia = data.getDay();
    if (REGIOES[regiao].comum.indexOf(dia) >= 0) {
        return 'comum';
    }
    if (REGIOES[regiao].seletiva.indexOf(dia) >= 0) {
        return 'seletiva';
    }
    return 'nenhum';
}

function proximasColetas(regiao, quantidade) {
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

function janelaDe(regiao, tipo) {
    return tipo === 'seletiva' ? REGIOES[regiao].janelaSeletiva : REGIOES[regiao].janela;
}

function doisDigitos(numero) {
    return numero < 10 ? '0' + numero : String(numero);
}

/* ---------- 5. Tela do mapa ---------- */

let frotaMontada = false;

// A camada do mapa é criada UMA vez; depois só os atributos mudam.
// Recriar tudo a cada segundo destruía o foco do teclado e desperdiçava trabalho.
function montarFrota() {
    const camada = document.getElementById('camada-frota');
    let svg = '';

    CAMINHOES.forEach(function (caminhao) {
        const parado = caminhao.velocidade === 0;
        svg += '<path id="rota-a-' + caminhao.id + '" d="" stroke="#2FA85A" stroke-width="5" fill="none" ' +
            'stroke-linecap="round" stroke-linejoin="round" />';
        svg += '<path id="rota-b-' + caminhao.id + '" d="" stroke="' + (parado ? '#B9C4BC' : '#4CC97A') + '" ' +
            'stroke-width="' + (parado ? '4.5' : '5') + '" fill="none" ' +
            'stroke-dasharray="' + (parado ? '2 9' : '9 9') + '" stroke-linecap="round" stroke-linejoin="round" />';
    });

    // Localização do morador (acompanha o bairro escolhido)
    svg += '<circle id="halo-usuario" r="16" fill="#1F7AEC" opacity="0.16" />';
    svg += '<circle id="ponto-usuario" r="7" fill="#1F7AEC" stroke="#FFFFFF" stroke-width="3" />';

    CAMINHOES.forEach(function (caminhao) {
        svg += '<g class="caminhao-marcador" id="marcador-' + caminhao.id + '" tabindex="0" role="button">' +
            '<circle id="halo-' + caminhao.id + '" r="24" fill="' + caminhao.cor + '" opacity="0.14" />' +
            '<circle id="corpo-' + caminhao.id + '" r="17" fill="' + caminhao.cor + '" stroke="#FFFFFF" stroke-width="3" />' +
            '<use id="icone-' + caminhao.id + '" href="#ic-caminhao" width="18" height="18" fill="none" ' +
            'stroke="#FFFFFF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />' +
        '</g>';
    });

    camada.innerHTML = svg;

    CAMINHOES.forEach(function (caminhao) {
        const grupo = document.getElementById('marcador-' + caminhao.id);
        const selecionar = function () {
            estado.caminhaoSelecionado = caminhao.id;
            atualizarFrota();
            desenharCartaoCaminhao();
        };
        grupo.addEventListener('click', selecionar);
        grupo.addEventListener('keydown', function (evento) {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                selecionar();
            }
        });
    });

    frotaMontada = true;
}

function atualizarFrota() {
    const eu = pontoUsuario();
    ['halo-usuario', 'ponto-usuario'].forEach(function (id) {
        const alvo = document.getElementById(id);
        if (alvo) {
            alvo.setAttribute('cx', eu.x);
            alvo.setAttribute('cy', eu.y);
        }
    });

    CAMINHOES.forEach(function (caminhao) {
        const total = comprimentoRota(caminhao.rota);
        const andado = caminhao.progresso * total;
        const selecionado = caminhao.id === estado.caminhaoSelecionado;
        const opacidade = selecionado ? 1 : 0.45;

        const passou = document.getElementById('rota-a-' + caminhao.id);
        const prevista = document.getElementById('rota-b-' + caminhao.id);

        if (caminhao.velocidade === 0) {
            passou.setAttribute('d', '');
            prevista.setAttribute('d', paraD(caminhao.rota));
        } else {
            const partes = dividirRota(caminhao.rota, andado);
            passou.setAttribute('d', paraD(partes.percorrido));
            prevista.setAttribute('d', partes.previsto.length > 1 ? paraD(partes.previsto) : '');
        }
        passou.setAttribute('opacity', opacidade);
        prevista.setAttribute('opacity', opacidade);

        const ponto = pontoEm(caminhao.rota, andado);
        const halo = document.getElementById('halo-' + caminhao.id);
        halo.setAttribute('cx', ponto.x);
        halo.setAttribute('cy', ponto.y);
        halo.setAttribute('r', selecionado ? 27 : 24);
        halo.setAttribute('opacity', selecionado ? 0.32 : 0.14);

        const corpo = document.getElementById('corpo-' + caminhao.id);
        corpo.setAttribute('cx', ponto.x);
        corpo.setAttribute('cy', ponto.y);

        const icone = document.getElementById('icone-' + caminhao.id);
        icone.setAttribute('x', ponto.x - 9);
        icone.setAttribute('y', ponto.y - 9);

        document.getElementById('marcador-' + caminhao.id)
            .setAttribute('aria-label', caminhao.nome + ', ' + textoSituacao(caminhao));
    });
}

// Pisca a localização do morador para ele se achar no mapa
function destacarUsuario() {
    const halo = document.getElementById('halo-usuario');
    if (!halo) {
        return;
    }
    halo.classList.remove('pulso');
    void halo.getBoundingClientRect();   // força o navegador a reiniciar a animação
    halo.classList.add('pulso');
}

function desenharFrota() {
    if (!frotaMontada) {
        montarFrota();
    }
    atualizarFrota();
}

function paraD(pontos) {
    return pontos.map(function (p, i) {
        return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    }).join(' ');
}

let cartaoMontadoPara = null;

function desenharCartaoCaminhao() {
    const alvo = document.getElementById('cartao-caminhao');
    const caminhao = CAMINHOES.find(function (c) {
        return c.id === estado.caminhaoSelecionado;
    });

    if (!caminhao) {
        alvo.innerHTML = '';
        cartaoMontadoPara = null;
        return;
    }

    // A estrutura só é recriada quando muda o caminhão selecionado
    if (cartaoMontadoPara !== caminhao.id) {
        alvo.innerHTML =
            '<div class="cartao-caminhao">' +
                '<span class="cartao-caminhao__ponto" id="cc-ponto"></span>' +
                '<button class="cartao-caminhao__info" id="cc-info">' +
                    '<p class="cartao-caminhao__nome" id="cc-nome"></p>' +
                    '<p class="cartao-caminhao__setor" id="cc-setor"></p>' +
                    '<p class="cartao-caminhao__eta" id="cc-eta"></p>' +
                '</button>' +
                '<button class="botao-seguir" id="botao-seguir"></button>' +
            '</div>';

        document.getElementById('botao-seguir').addEventListener('click', function () {
            estado.seguindo = !estado.seguindo;
            desenharCartaoCaminhao();
        });
        document.getElementById('cc-info').addEventListener('click', abrirItinerario);
        cartaoMontadoPara = caminhao.id;
    }

    document.getElementById('cc-ponto').style.background = caminhao.cor;
    document.getElementById('cc-nome').textContent = caminhao.nome;
    document.getElementById('cc-setor').textContent = caminhao.setor + ' · ' + textoSituacao(caminhao);
    document.getElementById('cc-eta').innerHTML = textoChegada(caminhao) +
        ' <span class="cartao-caminhao__ver">· ver itinerário ›</span>';

    const botao = document.getElementById('botao-seguir');
    botao.textContent = estado.seguindo ? 'Seguindo' : 'Seguir';
    botao.classList.toggle('botao-seguir--ativo', estado.seguindo);
}

function desenharStatus() {
    // Os caminhões atendem bairros diferentes, então o número é do centro inteiro
    const emRota = CAMINHOES.filter(function (c) {
        return c.velocidade > 0;
    }).length;

    document.getElementById('qtd-caminhoes').textContent = emRota + ' de ' + CAMINHOES.length;
    document.getElementById('regiao-status').textContent = 'em rota no centro';

    const proximas = proximasColetas(estado.regiao, 1);
    if (proximas.length > 0) {
        const p = proximas[0];
        document.getElementById('proxima-dia').textContent = p.hoje ? 'Hoje' : DIAS_SEMANA[p.data.getDay()];
        document.getElementById('proxima-hora').textContent = janelaDe(estado.regiao, p.tipo);
    }
}

function desenharListaColetas() {
    const lista = document.getElementById('lista-coletas');
    const proximas = proximasColetas(estado.regiao, 2);

    lista.innerHTML = proximas.map(function (item) {
        const seletiva = item.tipo === 'seletiva';
        const rotulo = item.hoje ? 'HOJE' : DIAS_CURTOS[item.data.getDay()];
        const data = doisDigitos(item.data.getDate()) + '/' + doisDigitos(item.data.getMonth() + 1);
        const corFundo = seletiva ? 'var(--ambar-claro)' : 'var(--verde-claro)';
        const corTexto = seletiva ? 'var(--ambar-escuro)' : 'var(--verde-forte)';

        return '<div class="item-coleta">' +
            '<div class="etiqueta-data" style="background: ' + corFundo + '; color: ' + corTexto + '">' +
                '<p class="etiqueta-data__dia">' + rotulo + '</p>' +
                '<p class="etiqueta-data__data">' + data + '</p>' +
            '</div>' +
            '<div class="item-coleta__meio">' +
                '<div class="item-coleta__linha">' +
                    '<svg class="icone" width="12" height="12"><use href="#ic-relogio" /></svg>' +
                    '<span class="item-coleta__hora">' + janelaDe(estado.regiao, item.tipo) + '</span>' +
                '</div>' +
                '<div class="item-coleta__linha">' +
                    '<svg class="icone" width="12" height="12"><use href="#ic-pino" /></svg>' +
                    '<span class="item-coleta__bairro">' + REGIOES[estado.regiao].nome + ' · seu bairro</span>' +
                '</div>' +
            '</div>' +
            '<span class="marca ' + (seletiva ? 'marca--seletiva' : 'marca--comum') + '">' +
                (seletiva ? 'Seletiva' : 'Comum') +
            '</span>' +
        '</div>';
    }).join('');
}

/* ---------- 6. Tela do calendário ---------- */

function desenharChipsRegiao() {
    const alvo = document.getElementById('chips-regiao');
    alvo.innerHTML = Object.keys(REGIOES).map(function (id) {
        const ativo = id === estado.regiao ? ' chip--ativo' : '';
        return '<button class="chip' + ativo + '" data-regiao="' + id + '">' + REGIOES[id].nome + '</button>';
    }).join('');

    alvo.querySelectorAll('[data-regiao]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            trocarRegiao(botao.dataset.regiao);
        });
    });
}

function desenharCalendario() {
    const ano = estado.anoVisivel;
    const mes = estado.mesVisivel;
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const hoje = new Date();
    const chaveHoje = chaveData(hoje);

    let comuns = 0;
    let seletivas = 0;
    let celulas = '';

    for (let i = 0; i < primeiroDia; i++) {
        celulas += '<div class="dia dia--vazio"></div>';
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const data = new Date(ano, mes, dia);
        const tipo = tipoDeColeta(estado.regiao, data);
        const chave = chaveData(data);

        if (tipo === 'comum') {
            comuns++;
        }
        if (tipo === 'seletiva') {
            seletivas++;
        }

        const classes = ['dia'];
        if (tipo !== 'nenhum') {
            classes.push('dia--coleta');
        }
        if (chave === chaveHoje) {
            classes.push('dia--hoje');
        }
        if (chave === estado.diaSelecionado) {
            classes.push('dia--selecionado');
        }

        let cor = 'transparent';
        if (tipo === 'comum') {
            cor = chave === estado.diaSelecionado ? '#FFFFFF' : 'var(--verde)';
        } else if (tipo === 'seletiva') {
            cor = chave === estado.diaSelecionado ? '#FFE7B8' : 'var(--ambar)';
        }

        celulas += '<button class="' + classes.join(' ') + '" data-dia="' + chave + '">' +
            '<span class="dia__numero">' + dia + '</span>' +
            '<span class="dia__ponto" style="background: ' + cor + '"></span>' +
        '</button>';
    }

    document.getElementById('grade-dias').innerHTML = celulas;
    document.getElementById('mes-nome').textContent = MESES[mes] + ' de ' + ano;
    document.getElementById('mes-resumo').textContent = comuns + ' coletas comuns · ' + seletivas + ' seletivas';

    document.querySelectorAll('[data-dia]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            estado.diaSelecionado = botao.dataset.dia;
            desenharCalendario();
            desenharDetalheDia();
        });
    });
}

function desenharDetalheDia() {
    const partes = estado.diaSelecionado.split('-');
    const data = new Date(Number(partes[0]), Number(partes[1]), Number(partes[2]));
    const tipo = tipoDeColeta(estado.regiao, data);
    const regiao = REGIOES[estado.regiao];
    const temColeta = tipo !== 'nenhum';

    let marca = 'Sem coleta';
    let classeMarca = '';
    let estiloMarca = 'background: #EEF1EF; color: var(--texto-suave)';
    if (tipo === 'comum') {
        marca = 'Coleta comum';
        classeMarca = 'marca--comum';
        estiloMarca = '';
    } else if (tipo === 'seletiva') {
        marca = 'Coleta seletiva';
        classeMarca = 'marca--seletiva';
        estiloMarca = '';
    }

    const passado = historicoDoDia(estado.regiao, data);
    let caixas = '';

    if (passado) {
        // Dia que já aconteceu: mostra o que de fato foi feito
        caixas = '<div class="detalhe__caixas">' +
            '<div class="caixa">' +
                '<p class="caixa__rotulo">HORÁRIO REAL</p>' +
                '<p class="caixa__valor">' + passado.hora + '</p>' +
            '</div>' +
            '<div class="caixa">' +
                '<p class="caixa__rotulo">SITUAÇÃO</p>' +
                '<p class="caixa__valor caixa__valor--' + passado.cor + '">' + passado.situacao + '</p>' +
            '</div>' +
        '</div>';
    } else if (temColeta) {
        caixas = '<div class="detalhe__caixas">' +
            '<div class="caixa">' +
                '<p class="caixa__rotulo">HORÁRIO PREVISTO</p>' +
                '<p class="caixa__valor">' + janelaDe(estado.regiao, tipo) + '</p>' +
            '</div>' +
            '<div class="caixa">' +
                '<p class="caixa__rotulo">CAMINHÃO</p>' +
                '<p class="caixa__valor">' + regiao.caminhao + '</p>' +
            '</div>' +
        '</div>';
    }

    const relato = relatoDoDia(data);
    if (relato) {
        caixas += '<p class="detalhe__relato">Você relatou um problema neste dia · ' +
            relato.protocolo + ' · ' + relato.situacao + '</p>';
    }

    document.getElementById('detalhe-dia').innerHTML =
        '<div class="detalhe">' +
            '<div class="detalhe__topo">' +
                '<div style="flex-grow: 1">' +
                    '<p class="detalhe__titulo">' + DIAS_SEMANA[data.getDay()] + ', ' + data.getDate() +
                        ' de ' + MESES_MIN[data.getMonth()] + '</p>' +
                    '<p class="detalhe__regiao">' + regiao.nome + ' · sua região</p>' +
                '</div>' +
                '<span class="marca ' + classeMarca + '" style="' + estiloMarca + '">' + marca + '</span>' +
            '</div>' +
            caixas +
        '</div>';
}

/* ---------- 5b. Itinerário do caminhão ---------- */

function horaRelativa(segundos) {
    const momento = new Date(Date.now() + segundos * 1000);
    return doisDigitos(momento.getHours()) + ':' + doisDigitos(momento.getMinutes());
}

// Estado de cada rua da rota, comparando o quanto o caminhão já andou
function itinerarioDe(caminhao) {
    const andado = caminhao.progresso * comprimentoRota(caminhao.rota);
    const parado = caminhao.velocidade === 0;
    const itens = [];
    let inicio = 0;

    for (let i = 0; i < caminhao.rota.length - 1; i++) {
        const a = caminhao.rota[i];
        const b = caminhao.rota[i + 1];
        const trecho = Math.hypot(b.x - a.x, b.y - a.y);
        const fim = inicio + trecho;
        const nome = caminhao.ruas[i] || 'Trecho ' + (i + 1);

        let situacao = 'pendente';
        let hora = '—';

        if (parado) {
            situacao = 'pendente';
        } else if (andado >= fim) {
            situacao = 'atendida';
            hora = horaRelativa(-(andado - fim) / caminhao.velocidade);
        } else if (andado > inicio) {
            situacao = 'agora';
            hora = 'agora';
        } else {
            hora = horaRelativa((inicio - andado) / caminhao.velocidade);
        }

        itens.push({ nome: nome, situacao: situacao, hora: hora });
        inicio = fim;
    }
    return itens;
}

function desenharItinerario() {
    const caminhao = CAMINHOES.find(function (c) {
        return c.id === estado.caminhaoSelecionado;
    });
    if (!caminhao) {
        return;
    }

    const percentual = caminhao.velocidade === 0 ? 0 : Math.round(caminhao.progresso * 100);

    document.getElementById('itinerario-titulo').textContent = caminhao.nome;
    document.getElementById('itinerario-situacao').textContent =
        caminhao.setor + ' · ' + textoSituacao(caminhao) + ' · ' + textoChegada(caminhao);
    document.getElementById('itinerario-barra').style.width = percentual + '%';
    document.getElementById('itinerario-percentual').textContent = percentual + '%';

    document.getElementById('itinerario-ruas').innerHTML = itinerarioDe(caminhao).map(function (rua) {
        return '<div class="rua rua--' + rua.situacao + '">' +
            '<span class="rua__marca"></span>' +
            '<span class="rua__nome">' + rua.nome + '</span>' +
            '<span class="rua__hora">' + rua.hora + '</span>' +
        '</div>';
    }).join('');
}

function abrirItinerario() {
    desenharItinerario();
    document.getElementById('folha-fundo').hidden = false;
    document.getElementById('folha-itinerario').hidden = false;
    document.getElementById('fechar-itinerario').focus();
}

function fecharItinerario() {
    document.getElementById('folha-fundo').hidden = true;
    document.getElementById('folha-itinerario').hidden = true;
    const info = document.getElementById('cc-info');
    if (info) {
        info.focus();
    }
}

function folhaAberta() {
    return !document.getElementById('folha-relato').hidden || !document.getElementById('folha-itinerario').hidden;
}

function fecharQualquerFolha() {
    if (!document.getElementById('folha-relato').hidden) {
        fecharFolhaRelato();
    }
    if (!document.getElementById('folha-itinerario').hidden) {
        fecharItinerario();
    }
}

/* ---------- 6b. Histórico: o que já aconteceu ---------- */

// Semente estável a partir do texto: o mesmo dia devolve sempre o mesmo resultado.
// Usa FNV-1a com mistura final, senão datas vizinhas caem quase no mesmo valor.
function semente(texto) {
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

function somarMinutos(hora, minutos) {
    const partes = hora.split(':');
    const total = Number(partes[0]) * 60 + Number(partes[1]) + minutos;
    return doisDigitos(Math.floor(total / 60) % 24) + ':' + doisDigitos(total % 60);
}

// Devolve o que aconteceu num dia passado, ou null se o dia ainda não chegou
function historicoDoDia(regiao, data) {
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
function relatoDoDia(data) {
    return estado.relatos.find(function (relato) {
        return chaveData(new Date(relato.criadoEm)) === chaveData(data);
    });
}

function desenharHistorico() {
    const itens = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(cursor.getDate() - 1);

    for (let i = 0; i < 40 && itens.length < 4; i++) {
        const registro = historicoDoDia(estado.regiao, cursor);
        if (registro) {
            itens.push({ data: new Date(cursor), registro: registro });
        }
        cursor.setDate(cursor.getDate() - 1);
    }

    document.getElementById('historico').innerHTML = itens.map(function (item) {
        const d = item.data;
        const registro = item.registro;
        return '<div class="historico__item">' +
            '<span class="historico__marca historico__marca--' + registro.cor + '"></span>' +
            '<div style="flex-grow: 1">' +
                '<p class="historico__data">' + DIAS_CURTOS[d.getDay()] + ' · ' +
                    doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1) +
                    ' · ' + (registro.tipo === 'seletiva' ? 'seletiva' : 'comum') + '</p>' +
                '<p class="historico__situacao">' + registro.situacao +
                    (registro.hora === '—' ? '' : ' às ' + registro.hora) + '</p>' +
            '</div>' +
        '</div>';
    }).join('');
}

/* ---------- 7. Tela de avisos ---------- */

function naoLidos() {
    return avisos.filter(function (aviso) {
        return estado.lidos.indexOf(aviso.id) < 0;
    }).length;
}

function desenharSelos() {
    const total = naoLidos();
    [document.getElementById('selo-cabecalho'), document.getElementById('selo-aba')].forEach(function (selo) {
        selo.textContent = total;
        selo.hidden = total === 0;
    });
    document.getElementById('resumo-avisos').textContent =
        total > 0 ? total + ' não lidos · toque para marcar' : 'Tudo em dia por aqui';
}

function desenharChipsFiltro() {
    const alvo = document.getElementById('chips-filtro');
    alvo.innerHTML = FILTROS.map(function (filtro) {
        const ativo = filtro.id === estado.filtroAvisos ? ' chip--ativo' : '';
        return '<button class="chip' + ativo + '" data-filtro="' + filtro.id + '">' + filtro.nome + '</button>';
    }).join('');

    alvo.querySelectorAll('[data-filtro]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            estado.filtroAvisos = botao.dataset.filtro;
            desenharChipsFiltro();
            desenharAvisos();
        });
    });
}

function desenharAvisos() {
    const lista = document.getElementById('lista-avisos');
    const visiveis = avisos.filter(function (aviso) {
        return estado.filtroAvisos === 'todos' || aviso.tipo === estado.filtroAvisos;
    });

    if (visiveis.length === 0) {
        lista.innerHTML = '<p class="vazio">Nenhum aviso neste filtro.</p>';
        return;
    }

    lista.innerHTML = visiveis.map(function (aviso) {
        const lido = estado.lidos.indexOf(aviso.id) >= 0;
        let icone = 'ic-caminhao';
        let classeIcone = '';
        if (aviso.tipo === 'horario') {
            icone = 'ic-relogio';
        } else if (aviso.tipo === 'aviso') {
            icone = 'ic-alerta';
            classeIcone = ' aviso__icone--alerta';
        }

        return '<button class="aviso' + (lido ? ' aviso--lido' : '') + '" data-aviso="' + aviso.id + '">' +
            '<span class="aviso__icone' + classeIcone + '">' +
                '<svg class="icone" width="21" height="21"><use href="#' + icone + '" /></svg>' +
            '</span>' +
            '<span class="aviso__meio">' +
                '<span class="aviso__topo">' +
                    '<span class="aviso__titulo">' + aviso.titulo + '</span>' +
                    '<span class="aviso__hora">' + aviso.quando + '</span>' +
                '</span>' +
                '<span class="aviso__corpo">' + aviso.corpo + '</span>' +
            '</span>' +
            '<span class="aviso__ponto"></span>' +
        '</button>';
    }).join('');

    lista.querySelectorAll('[data-aviso]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            alternarLido(botao.dataset.aviso);
        });
    });
}

function alternarLido(id) {
    const posicao = estado.lidos.indexOf(id);
    if (posicao >= 0) {
        estado.lidos.splice(posicao, 1);
    } else {
        estado.lidos.push(id);
    }
    salvarPreferencias();
    desenharAvisos();
    desenharSelos();
}

function novoAviso(aviso) {
    avisosDinamicos.unshift(aviso);
    recomporAvisos();
    desenharAvisos();
    desenharSelos();
    mostrarAlerta(aviso.titulo, aviso.corpo);
}

function mostrarAlerta(titulo, texto, icone) {
    const caixa = document.getElementById('alerta');
    caixa.innerHTML =
        '<svg class="icone" width="24" height="24"><use href="#' + (icone || 'ic-caminhao') + '" /></svg>' +
        '<div>' +
            '<p class="alerta__titulo">' + titulo + '</p>' +
            '<p class="alerta__texto">' + texto + '</p>' +
        '</div>';
    caixa.hidden = false;

    clearTimeout(mostrarAlerta.temporizador);
    mostrarAlerta.temporizador = setTimeout(function () {
        caixa.hidden = true;
    }, 6000);
}

/* ---------- 8. Relatar um problema ---------- */

function rotuloQuando(iso) {
    const data = new Date(iso);
    const hoje = new Date();
    if (chaveData(data) === chaveData(hoje)) {
        return 'hoje';
    }
    return doisDigitos(data.getDate()) + '/' + doisDigitos(data.getMonth() + 1);
}

// A lista de avisos junta: alertas da sessão, relatos do morador e os avisos do serviço
function recomporAvisos() {
    const deRelatos = estado.relatos.map(function (relato) {
        return {
            id: 'relato-' + relato.protocolo,
            tipo: 'aviso',
            titulo: 'Relato registrado · ' + relato.protocolo,
            corpo: relato.rotulo + ' · ' + relato.situacao + '. Você recebe um aviso quando houver resposta.',
            quando: rotuloQuando(relato.criadoEm)
        };
    });
    avisos = avisosDinamicos.concat(deRelatos).concat(AVISOS_BASE);
}

function desenharTiposRelato() {
    const alvo = document.getElementById('tipos-relato');
    alvo.innerHTML = TIPOS_RELATO.map(function (tipo) {
        const ativo = tipo.id === estado.tipoRelato ? ' tipo--ativo' : '';
        return '<button class="tipo' + ativo + '" data-tipo="' + tipo.id + '" ' +
            'aria-pressed="' + (tipo.id === estado.tipoRelato) + '">' + tipo.rotulo + '</button>';
    }).join('');

    alvo.querySelectorAll('[data-tipo]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            estado.tipoRelato = botao.dataset.tipo;
            desenharTiposRelato();
            document.getElementById('enviar-relato').disabled = false;
        });
    });
}

function desenharMeusRelatos() {
    const alvo = document.getElementById('meus-relatos');
    if (estado.relatos.length === 0) {
        alvo.innerHTML = '';
        return;
    }

    alvo.innerHTML = estado.relatos.slice(0, 3).map(function (relato) {
        return '<div class="relato">' +
            '<div style="flex-grow: 1">' +
                '<p class="relato__protocolo">' + relato.protocolo + ' · ' + rotuloQuando(relato.criadoEm) + '</p>' +
                '<p class="relato__tipo">' + relato.rotulo + '</p>' +
            '</div>' +
            '<span class="situacao">' + relato.situacao + '</span>' +
        '</div>';
    }).join('');
}

function abrirFolhaRelato() {
    estado.tipoRelato = null;
    document.getElementById('descricao-relato').value = '';
    document.getElementById('local-relato').textContent =
        enderecoAtual() + ' · ' + REGIOES[estado.regiao].nome;
    document.getElementById('enviar-relato').disabled = true;
    desenharTiposRelato();

    document.getElementById('folha-fundo').hidden = false;
    document.getElementById('folha-relato').hidden = false;
    document.getElementById('fechar-relato').focus();
}

function fecharFolhaRelato() {
    document.getElementById('folha-fundo').hidden = true;
    document.getElementById('folha-relato').hidden = true;
    document.getElementById('abrir-relato').focus();
}

function enviarRelato() {
    if (!estado.tipoRelato) {
        return;
    }

    const tipo = TIPOS_RELATO.find(function (t) {
        return t.id === estado.tipoRelato;
    });

    estado.contadorProtocolo++;
    const numero = String(estado.contadorProtocolo);
    const protocolo = 'PT-' + new Date().getFullYear() + '-' + ('0000' + numero).slice(-4);

    estado.relatos.unshift({
        protocolo: protocolo,
        tipo: tipo.id,
        rotulo: tipo.rotulo,
        descricao: document.getElementById('descricao-relato').value.trim(),
        regiao: estado.regiao,
        situacao: 'Em análise',
        criadoEm: new Date().toISOString()
    });

    salvarPreferencias();
    recomporAvisos();
    fecharFolhaRelato();
    desenharMeusRelatos();
    desenharDetalheDia();
    desenharAvisos();
    desenharSelos();
    mostrarAlerta('Relato ' + protocolo + ' registrado', tipo.rotulo + ' · a prefeitura foi notificada.', 'ic-alerta');
}

/* ---------- 9. Tela de configurações ---------- */

function desenharConfiguracoes() {
    const alvoRegiao = document.getElementById('chips-config-regiao');
    alvoRegiao.innerHTML = Object.keys(REGIOES).map(function (id) {
        const ativo = id === estado.regiao ? ' chip--ativo' : '';
        return '<button class="chip' + ativo + '" data-config-regiao="' + id + '">' +
            REGIOES[id].nome +
            '<span class="chip__detalhe">' + REGIOES[id].endereco + '</span>' +
        '</button>';
    }).join('');

    alvoRegiao.querySelectorAll('[data-config-regiao]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            trocarRegiao(botao.dataset.configRegiao);
        });
    });

    document.getElementById('lista-interruptores').innerHTML = INTERRUPTORES.map(function (item) {
        const ligado = estado.config[item.id];
        return '<div class="linha">' +
            '<div>' +
                '<p class="linha__titulo">' + item.titulo + '</p>' +
                '<p class="linha__texto">' + item.texto + '</p>' +
            '</div>' +
            '<button class="interruptor' + (ligado ? ' interruptor--ligado' : '') + '" data-chave="' + item.id + '" ' +
                'role="switch" aria-checked="' + ligado + '" aria-label="' + item.titulo + '">' +
                '<span class="interruptor__bolinha"></span>' +
            '</button>' +
        '</div>';
    }).join('');

    document.querySelectorAll('[data-chave]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            const chave = botao.dataset.chave;
            estado.config[chave] = !estado.config[chave];
            salvarPreferencias();
            desenharConfiguracoes();
        });
    });

    const bloco = document.getElementById('bloco-distancia');
    if (estado.config.proximidade) {
        bloco.innerHTML = '<div class="bloco-distancia">' +
            '<p class="bloco-distancia__rotulo">Avisar quando o caminhão estiver a</p>' +
            '<div class="chips chips--interno">' +
                DISTANCIAS.map(function (valor) {
                    const ativo = valor === estado.config.distancia ? ' chip--ativo' : '';
                    const texto = valor >= 1000 ? (valor / 1000) + ' km' : valor + ' m';
                    return '<button class="chip' + ativo + '" data-distancia="' + valor + '">' + texto + '</button>';
                }).join('') +
            '</div>' +
        '</div>';

        bloco.querySelectorAll('[data-distancia]').forEach(function (botao) {
            botao.addEventListener('click', function () {
                estado.config.distancia = Number(botao.dataset.distancia);
                salvarPreferencias();
                desenharConfiguracoes();
            });
        });
    } else {
        bloco.innerHTML = '';
    }

    document.getElementById('endereco-atual').textContent = enderecoAtual();
    document.getElementById('hora-atual').textContent = estado.config.hora;
    document.getElementById('chips-hora').innerHTML = HORAS_LEMBRETE.map(function (hora) {
        const ativo = hora === estado.config.hora ? ' chip--ativo' : '';
        return '<button class="chip' + ativo + '" data-hora="' + hora + '">' + hora + '</button>';
    }).join('');

    document.querySelectorAll('[data-hora]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            estado.config.hora = botao.dataset.hora;
            salvarPreferencias();
            desenharConfiguracoes();
        });
    });
}

/* ---------- 9b. Primeira configuração ---------- */

// O endereço digitado pelo morador; sem ele, usa o endereço padrão da região
function enderecoAtual() {
    return estado.endereco || REGIOES[estado.regiao].endereco;
}

let regiaoEscolhida = null;

function desenharBoasVindas() {
    const alvo = document.getElementById('boas-vindas-regioes');
    alvo.innerHTML = Object.keys(REGIOES).map(function (id) {
        const ativo = id === regiaoEscolhida ? ' chip--ativo' : '';
        return '<button class="chip' + ativo + '" data-bv-regiao="' + id + '" ' +
            'aria-pressed="' + (id === regiaoEscolhida) + '">' +
            REGIOES[id].nome +
            '<span class="chip__detalhe">' + REGIOES[id].comum.length + ' coletas comuns por semana</span>' +
        '</button>';
    }).join('');

    alvo.querySelectorAll('[data-bv-regiao]').forEach(function (botao) {
        botao.addEventListener('click', function () {
            regiaoEscolhida = botao.dataset.bvRegiao;
            desenharBoasVindas();
            document.getElementById('boas-vindas-confirmar').disabled = false;
        });
    });
}

function abrirBoasVindas(edicao) {
    regiaoEscolhida = edicao ? estado.regiao : null;
    document.getElementById('boas-vindas-endereco').value = edicao ? estado.endereco : '';
    document.getElementById('boas-vindas-endereco').placeholder = REGIOES[estado.regiao].endereco;
    document.getElementById('boas-vindas-confirmar').textContent = edicao ? 'Salvar' : 'Começar';
    document.getElementById('boas-vindas-confirmar').disabled = !regiaoEscolhida;
    desenharBoasVindas();
    document.getElementById('boas-vindas').hidden = false;
}

function confirmarBoasVindas() {
    if (!regiaoEscolhida) {
        return;
    }
    estado.endereco = document.getElementById('boas-vindas-endereco').value.trim();
    estado.configurado = true;
    document.getElementById('boas-vindas').hidden = true;
    trocarRegiao(regiaoEscolhida);
}

/* ---------- 10. Navegação ---------- */

function irPara(tela) {
    estado.tela = tela;

    document.querySelectorAll('.tela').forEach(function (secao) {
        secao.classList.toggle('tela--ativa', secao.id === 'tela-' + tela);
    });
    document.querySelectorAll('.aba').forEach(function (aba) {
        aba.classList.toggle('aba--ativa', aba.dataset.tela === tela);
    });

    window.scrollTo({ top: 0, behavior: 'instant' });
}

function trocarRegiao(id) {
    estado.regiao = id;
    alertaEnviado = {};

    // O caminhão em destaque passa a ser o que atende o bairro escolhido
    const daRegiao = CAMINHOES.find(function (c) {
        return c.nome.indexOf(REGIOES[id].caminhao) >= 0;
    });
    if (daRegiao) {
        estado.caminhaoSelecionado = daRegiao.id;
    }
    salvarPreferencias();
    desenharChipsRegiao();
    desenharCalendario();
    desenharDetalheDia();
    desenharHistorico();
    desenharConfiguracoes();
    desenharStatus();
    desenharListaColetas();
    if (frotaMontada) {
        atualizarFrota();
        desenharCartaoCaminhao();
    }
}

/* ---------- 11. Simulação do deslocamento ---------- */

let alertaEnviado = {};

function avancarCaminhoes() {
    CAMINHOES.forEach(function (caminhao) {
        if (caminhao.velocidade === 0) {
            return;
        }
        const total = comprimentoRota(caminhao.rota);
        caminhao.progresso += caminhao.velocidade / total;

        if (caminhao.progresso >= 1) {
            caminhao.progresso = 0;
            caminhao.voltas++;
            alertaEnviado[caminhao.id] = false;
        }
    });

    verificarProximidade();
    desenharFrota();
    desenharCartaoCaminhao();

    if (!document.getElementById('folha-itinerario').hidden) {
        desenharItinerario();
    }
}

function verificarProximidade() {
    if (!estado.config.proximidade) {
        return;
    }

    // Só interessa o caminhão que atende a região do morador
    const meuCaminhao = REGIOES[estado.regiao].caminhao;

    CAMINHOES.forEach(function (caminhao) {
        if (caminhao.velocidade === 0 || alertaEnviado[caminhao.id]) {
            return;
        }
        if (caminhao.nome.indexOf(meuCaminhao) < 0) {
            return;
        }
        const metros = metrosDoUsuario(caminhao);
        if (metros <= estado.config.distancia) {
            alertaEnviado[caminhao.id] = true;
            novoAviso({
                id: 'prox-' + caminhao.id + '-' + caminhao.voltas,
                tipo: 'caminhao',
                titulo: 'Caminhão a ' + Math.round(metros) + ' m de você',
                corpo: 'O ' + caminhao.nome.replace('Caminhão ', '') + ' está chegando. Leve o lixo para a calçada.',
                quando: 'agora'
            });
        }
    });
}

/* ---------- 12. Início ---------- */

function iniciar() {
    carregarPreferencias();

    document.querySelectorAll('.aba').forEach(function (aba) {
        aba.addEventListener('click', function () {
            irPara(aba.dataset.tela);
        });
    });
    document.getElementById('atalho-avisos').addEventListener('click', function () {
        irPara('avisos');
    });
    document.getElementById('ir-calendario').addEventListener('click', function () {
        irPara('calendario');
    });
    document.getElementById('botao-centralizar').addEventListener('click', function () {
        // Traz o foco de volta para o caminhão que atende o bairro do morador
        const daRegiao = CAMINHOES.find(function (c) {
            return c.nome.indexOf(REGIOES[estado.regiao].caminhao) >= 0;
        });
        if (daRegiao) {
            estado.caminhaoSelecionado = daRegiao.id;
        }
        atualizarFrota();
        desenharCartaoCaminhao();
        destacarUsuario();
    });
    document.getElementById('mes-anterior').addEventListener('click', function () {
        estado.mesVisivel--;
        if (estado.mesVisivel < 0) {
            estado.mesVisivel = 11;
            estado.anoVisivel--;
        }
        desenharCalendario();
    });
    document.getElementById('mes-proximo').addEventListener('click', function () {
        estado.mesVisivel++;
        if (estado.mesVisivel > 11) {
            estado.mesVisivel = 0;
            estado.anoVisivel++;
        }
        desenharCalendario();
    });
    document.getElementById('marcar-lidas').addEventListener('click', function () {
        estado.lidos = avisos.map(function (aviso) {
            return aviso.id;
        });
        salvarPreferencias();
        desenharAvisos();
        desenharSelos();
    });

    document.getElementById('boas-vindas-confirmar').addEventListener('click', confirmarBoasVindas);
    document.getElementById('alterar-endereco').addEventListener('click', function () {
        abrirBoasVindas(true);
    });
    document.getElementById('abrir-relato').addEventListener('click', abrirFolhaRelato);
    document.getElementById('fechar-relato').addEventListener('click', fecharFolhaRelato);
    document.getElementById('folha-fundo').addEventListener('click', fecharQualquerFolha);
    document.getElementById('fechar-itinerario').addEventListener('click', fecharItinerario);
    document.getElementById('enviar-relato').addEventListener('click', enviarRelato);
    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && folhaAberta()) {
            fecharQualquerFolha();
        }
    });

    recomporAvisos();
    desenharMeusRelatos();
    desenharStatus();
    desenharFrota();
    desenharCartaoCaminhao();
    desenharListaColetas();
    desenharChipsRegiao();
    desenharCalendario();
    desenharDetalheDia();
    desenharHistorico();
    desenharChipsFiltro();
    desenharAvisos();
    desenharSelos();
    desenharConfiguracoes();

    if (!estado.configurado) {
        abrirBoasVindas(false);
    }

    // Os caminhões andam a cada segundo
    setInterval(avancarCaminhoes, 1000);
}

iniciar();

// Service worker: faz o app abrir sem internet e ser instalável.
// Só vale quando servido por HTTP — abrindo o arquivo direto, o navegador bloqueia.
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {
            // Sem service worker o app continua funcionando, só não fica offline
        });
    });
}
