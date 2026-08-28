/* =========================================================
   TrashTime — acompanhamento da coleta de lixo
   Dados simulados: não há GPS nem servidor por trás.
   ========================================================= */

/* ---------- 1. Dados ---------- */

// 1 unidade do mapa equivale a 4 metros
const ESCALA = 4;

// O trecho logo à frente do caminhão é o que a legenda chama de "rota prevista";
// o que vem depois dele ainda é "ainda não passou". Uma quadra e meia.
const ALCANCE_PREVISTO = 90;

// O mapa desenha uma área maior do que cabe na tela; o zoom recorta um pedaço
// O desenho vai de (0, -320) ate (900, 780): a peninsula inteira, com cidade
// ao norte e a leste do centro, a baia a oeste e o Guama ao sul.
const MUNDO = { x: 0, y: -320, w: 900, h: 1100 };
const VISTA = { w: 390, h: 260 };
const ZOOM_MAX = 3;
const ZOOM_PADRAO = 1.6;

// No celular o mapa comeca recolhido e o morador puxa para baixo para amplia-lo.
// Estas sao as duas alturas entre as quais ele se move.
// A alca ocupa uma faixa embaixo do mapa; a altura recolhida cresce o mesmo
// tanto para que a area util do desenho continue a mesma de antes.
const MAPA_RECOLHIDO = 296;
const MAPA_MARGEM_ABAIXO = 112;   // espaco que fica para o cartao do caminhao
const LARGURA_CELULAR = 899;      // acima disso vale o layout de computador

// Onde o morador está no mapa: cada bairro tem seu ponto
function pontoUsuario() {
    return REGIOES[estado.regiao].ponto;
}

const REGIOES = {
    umarizal: {
        nome: 'Umarizal', endereco: 'Av. Visc. de Souza Franco, 620',
        ponto: { x: 238.5, y: 24.8 },
        comum: [1, 3, 5], seletiva: [6],
        janela: '06:00 – 09:00', janelaSeletiva: '13:00 – 16:00', caminhao: 'CT-052'
    },
    reduto: {
        nome: 'Reduto', endereco: 'Trav. Quintino Bocaiúva, 145',
        ponto: { x: 245.0, y: 116.6 },
        comum: [2, 4, 6], seletiva: [3],
        janela: '05:30 – 08:30', janelaSeletiva: '14:00 – 17:00', caminhao: 'CT-063'
    },
    campina: {
        nome: 'Campina', endereco: 'Trav. Campos Sales, 210',
        ponto: { x: 251.4, y: 208.3 },
        comum: [1, 3, 5], seletiva: [6],
        janela: '06:00 – 09:00', janelaSeletiva: '13:00 – 16:00', caminhao: 'CT-104'
    },
    cidadevelha: {
        nome: 'Cidade Velha', endereco: 'Rua Siqueira Mendes, 84',
        ponto: { x: 261.0, y: 346.0 },
        comum: [2, 4, 6], seletiva: [3],
        janela: '05:30 – 08:30', janelaSeletiva: '14:00 – 17:00', caminhao: 'CT-118'
    },
    nazare: {
        nome: 'Nazaré', endereco: 'Av. Gentil Bittencourt, 1450',
        ponto: { x: 427.3, y: 57.7 },
        comum: [2, 4, 6], seletiva: [5],
        janela: '07:00 – 10:00', janelaSeletiva: '15:00 – 18:00', caminhao: 'CT-090'
    },
    saobras: {
        nome: 'São Brás', endereco: 'Av. José Bonifácio, 330',
        ponto: { x: 612.8, y: 44.7 },
        comum: [1, 3, 5], seletiva: [4],
        janela: '06:30 – 09:30', janelaSeletiva: '14:30 – 17:30', caminhao: 'CT-071'
    },
    batistacampos: {
        nome: 'Batista Campos', endereco: 'Trav. Padre Eutíquio, 780',
        ponto: { x: 436.9, y: 195.4 },
        comum: [1, 3, 5], seletiva: [4],
        janela: '06:30 – 09:30', janelaSeletiva: '14:30 – 17:30', caminhao: 'CT-076'
    },
    jurunas: {
        nome: 'Jurunas', endereco: 'Trav. Roberto Camelier, 512',
        ponto: { x: 387.9, y: 383.2 },
        comum: [2, 4, 6], seletiva: [3],
        janela: '05:00 – 08:00', janelaSeletiva: '13:30 – 16:30', caminhao: 'CT-085'
    },
    guama: {
        nome: 'Guamá', endereco: 'Trav. Barão do Triunfo, 2100',
        ponto: { x: 576.7, y: 416.2 },
        comum: [1, 3, 5], seletiva: [2],
        janela: '07:30 – 10:30', janelaSeletiva: '15:30 – 18:30', caminhao: 'CT-099'
    }
};

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DIAS_CURTOS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_MIN = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// Cada rota acompanha as ruas desenhadas no mapa
const CAMINHOES = [
    {
        id: 'ct052', nome: 'Caminhão CT-052', setor: 'Setor Umarizal',
        cor: '#2FA85A', velocidade: 1.4, progresso: 0.3, voltas: 0,
        rota: [{ x: 156.9, y: 57.2 }, { x: 280.6, y: 48.6 }, { x: 277.4, y: 2.7 }, { x: 215.5, y: 7.0 }],
        ruas: ['Av. Sen. Lemos', 'Trav. Rui Barbosa', 'Av. Visc. de Souza Franco']
    },
    {
        id: 'ct063', nome: 'Caminhão CT-063', setor: 'Setor Reduto',
        cor: '#2FA85A', velocidade: 1.2, progresso: 0.55, voltas: 0,
        rota: [{ x: 163.3, y: 149.0 }, { x: 287.0, y: 140.4 }, { x: 283.8, y: 94.5 }, { x: 222.0, y: 98.8 }],
        ruas: ['Av. Assis de Vasconcelos', 'Trav. Quintino Bocaiúva', 'Blvd. Castilhos França']
    },
    {
        id: 'ct104', nome: 'Caminhão CT-104', setor: 'Setor Campina',
        cor: '#2FA85A', velocidade: 1.6, progresso: 0.46, voltas: 0,
        rota: [{ x: 169.7, y: 240.8 }, { x: 293.4, y: 232.1 }, { x: 290.2, y: 186.3 }, { x: 228.4, y: 190.6 }],
        ruas: ['Blvd. Castilhos França', 'Rua Santo Antônio', 'Trav. Campos Sales']
    },
    {
        id: 'ct118', nome: 'Caminhão CT-118', setor: 'Setor Cidade Velha',
        cor: '#2FA85A', velocidade: 1.1, progresso: 0.3, voltas: 0,
        rota: [{ x: 173.0, y: 286.7 }, { x: 176.2, y: 332.6 }, { x: 238.0, y: 328.2 }],
        ruas: ['Rua Padre Champagnat', 'Rua Siqueira Mendes']
    },
    {
        id: 'ct090', nome: 'Caminhão CT-090', setor: 'Setor Nazaré',
        cor: '#2FA85A', velocidade: 1.3, progresso: 0.22, voltas: 0,
        rota: [{ x: 345.7, y: 90.2 }, { x: 469.4, y: 81.5 }, { x: 466.2, y: 35.6 }, { x: 404.3, y: 39.9 }],
        ruas: ['Av. Nazaré', 'Trav. 14 de Março', 'Av. Gentil Bittencourt']
    },
    {
        id: 'ct071', nome: 'Caminhão CT-071', setor: 'Setor São Brás',
        cor: '#8A968D', velocidade: 0, progresso: 0, voltas: 0,
        rota: [{ x: 534.4, y: 123.1 }, { x: 658.1, y: 114.4 }, { x: 651.7, y: 22.6 }, { x: 589.8, y: 27.0 }],
        ruas: ['Av. Almirante Barroso', 'Trav. Mauriti', 'Av. José Bonifácio']
    },
    {
        id: 'ct076', nome: 'Caminhão CT-076', setor: 'Setor Batista Campos',
        cor: '#2FA85A', velocidade: 1.5, progresso: 0.38, voltas: 0,
        rota: [{ x: 355.3, y: 227.8 }, { x: 479.0, y: 219.2 }, { x: 475.8, y: 173.3 }, { x: 413.9, y: 177.6 }],
        ruas: ['Rua dos Mundurucus', 'Trav. Padre Eutíquio', 'Av. Gov. José Malcher']
    },
    {
        id: 'ct085', nome: 'Caminhão CT-085', setor: 'Setor Jurunas',
        cor: '#2FA85A', velocidade: 1.25, progresso: 0.62, voltas: 0,
        rota: [{ x: 306.3, y: 415.7 }, { x: 430.0, y: 407.0 }, { x: 426.8, y: 361.2 }, { x: 364.9, y: 365.5 }],
        ruas: ['Rua Nova', 'Trav. Roberto Camelier', 'Av. Bernardo Sayão']
    },
    {
        id: 'ct099', nome: 'Caminhão CT-099', setor: 'Setor Guamá',
        cor: '#8A968D', velocidade: 0, progresso: 0, voltas: 0,
        rota: [{ x: 495.0, y: 448.6 }, { x: 618.7, y: 440.0 }, { x: 615.5, y: 394.1 }, { x: 553.7, y: 398.4 }],
        ruas: ['Av. Perimetral', 'Trav. Barão do Triunfo', 'Rua Augusto Corrêa']
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

    // Cada rota tem três pedaços, um por estado da legenda
    CAMINHOES.forEach(function (caminhao) {
        svg += '<path id="rota-passou-' + caminhao.id + '" d="" stroke="#2FA85A" stroke-width="5" ' +
            'fill="none" stroke-linecap="round" stroke-linejoin="round" />';
        svg += '<path id="rota-prevista-' + caminhao.id + '" d="" stroke="#4CC97A" stroke-width="5" ' +
            'fill="none" stroke-dasharray="9 9" stroke-linecap="round" stroke-linejoin="round" />';
        svg += '<path id="rota-pendente-' + caminhao.id + '" d="" stroke="#B9C4BC" stroke-width="4.5" ' +
            'fill="none" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round" />';
    });

    // Localização do morador (acompanha o bairro escolhido)
    svg += '<g id="grupo-usuario">' +
        '<circle r="16" fill="#1F7AEC" opacity="0.16" />' +
        '<circle r="7" fill="#1F7AEC" stroke="#FFFFFF" stroke-width="3" />' +
    '</g>';

    CAMINHOES.forEach(function (caminhao) {
        svg += '<g class="caminhao-marcador" id="marcador-' + caminhao.id + '" tabindex="0" role="button">' +
            '<circle id="halo-' + caminhao.id + '" r="24" fill="' + caminhao.cor + '" opacity="0.14" />' +
            '<circle r="17" fill="' + caminhao.cor + '" stroke="#FFFFFF" stroke-width="3" />' +
            '<use href="#ic-caminhao" x="-9" y="-9" width="18" height="18" fill="none" ' +
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
    // Marcadores e traços encolhem na mesma medida em que o mapa cresce, para
    // manterem o tamanho aparente em qualquer nível de aproximação
    const escala = 1 / estado.mapa.zoom;

    const grupoUsuario = document.getElementById('grupo-usuario');
    if (grupoUsuario) {
        grupoUsuario.setAttribute('transform',
            'translate(' + eu.x + ',' + eu.y + ') scale(' + escala + ')');
    }

    CAMINHOES.forEach(function (caminhao) {
        const total = comprimentoRota(caminhao.rota);
        const andado = caminhao.progresso * total;
        const selecionado = caminhao.id === estado.caminhaoSelecionado;
        const opacidade = selecionado ? 1 : 0.45;

        const passou = document.getElementById('rota-passou-' + caminhao.id);
        const prevista = document.getElementById('rota-prevista-' + caminhao.id);
        const pendente = document.getElementById('rota-pendente-' + caminhao.id);

        // Quem não saiu tem a rota inteira como "ainda não passou"
        const ateOndePrevisto = caminhao.velocidade === 0
            ? 0
            : Math.min(andado + ALCANCE_PREVISTO, total);
        const desenhar = function (alvo, de, ate, largura, tracejado) {
            const pedaco = trechoRota(caminhao.rota, de, ate);
            alvo.setAttribute('d', pedaco.length > 1 ? paraD(pedaco) : '');
            alvo.setAttribute('opacity', opacidade);
            alvo.setAttribute('stroke-width', (largura * escala).toFixed(2));
            if (tracejado) {
                alvo.setAttribute('stroke-dasharray',
                    (tracejado[0] * escala).toFixed(2) + ' ' + (tracejado[1] * escala).toFixed(2));
            }
        };

        desenhar(passou, 0, caminhao.velocidade === 0 ? 0 : andado, 5, null);
        desenhar(prevista, caminhao.velocidade === 0 ? 0 : andado, ateOndePrevisto, 5, [9, 9]);
        desenhar(pendente, ateOndePrevisto, total, 4.5, [2, 9]);

        const ponto = pontoEm(caminhao.rota, andado);
        const marcador = document.getElementById('marcador-' + caminhao.id);
        marcador.setAttribute('transform',
            'translate(' + ponto.x.toFixed(1) + ',' + ponto.y.toFixed(1) + ') scale(' + escala.toFixed(3) + ')');
        marcador.setAttribute('aria-label', caminhao.nome + ', ' + textoSituacao(caminhao));

        const halo = document.getElementById('halo-' + caminhao.id);
        halo.setAttribute('r', selecionado ? 27 : 24);
        halo.setAttribute('opacity', selecionado ? 0.32 : 0.14);
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

/* ---------- Aproximar, afastar e arrastar o mapa ---------- */

// Quanto o mapa mostra depende do formato da caixa onde ele esta desenhado.
// Quando o morador amplia o mapa no celular a caixa fica mais alta, e a janela
// precisa acompanhar - senao a altura extra so cortaria as laterais.
function formatoDaVista(svg) {
    const caixa = svg.getBoundingClientRect();
    if (caixa.width < 1 || caixa.height < 1) {
        return VISTA.h / VISTA.w;
    }
    return caixa.height / caixa.width;
}

// O quanto da pode afastar depende do formato da caixa: a janela nunca pode
// ficar maior que o desenho, senao sobraria vazio nas bordas.
function zoomMinimo() {
    const svg = document.querySelector('.mapa__svg');
    if (!svg) {
        return VISTA.w / MUNDO.w;
    }
    const formato = formatoDaVista(svg);
    return Math.max(VISTA.w / MUNDO.w, (VISTA.w * formato) / MUNDO.h);
}

function aplicarVista() {
    const svg = document.querySelector('.mapa__svg');
    if (!svg) {
        return;
    }

    const minimo = zoomMinimo();
    if (estado.mapa.zoom < minimo) {
        estado.mapa.zoom = minimo;
    }

    const zoom = estado.mapa.zoom;
    const largura = VISTA.w / zoom;
    const altura = largura * formatoDaVista(svg);

    // A vista não escapa dos limites do mundo desenhado
    estado.mapa.cx = largura >= MUNDO.w
        ? MUNDO.x + MUNDO.w / 2
        : Math.max(MUNDO.x + largura / 2,
                   Math.min(MUNDO.x + MUNDO.w - largura / 2, estado.mapa.cx));
    estado.mapa.cy = altura >= MUNDO.h
        ? MUNDO.y + MUNDO.h / 2
        : Math.max(MUNDO.y + altura / 2,
                   Math.min(MUNDO.y + MUNDO.h - altura / 2, estado.mapa.cy));

    svg.setAttribute('viewBox',
        (estado.mapa.cx - largura / 2).toFixed(1) + ' ' +
        (estado.mapa.cy - altura / 2).toFixed(1) + ' ' +
        largura.toFixed(1) + ' ' + altura.toFixed(1));

    if (frotaMontada) {
        atualizarFrota();
    }
    atualizarBotoesZoom();
}

function zoomPara(novo, focoX, focoY) {
    const limitado = Math.max(zoomMinimo(), Math.min(ZOOM_MAX, novo));
    if (focoX !== undefined) {
        // mantém o ponto sob o cursor parado enquanto aproxima
        const razao = 1 - estado.mapa.zoom / limitado;
        estado.mapa.cx += (focoX - estado.mapa.cx) * razao;
        estado.mapa.cy += (focoY - estado.mapa.cy) * razao;
    }
    estado.mapa.zoom = limitado;
    aplicarVista();
}

function centralizarNoMorador() {
    const eu = pontoUsuario();
    estado.mapa.cx = eu.x;
    estado.mapa.cy = eu.y;
    estado.mapa.zoom = ZOOM_PADRAO;
    aplicarVista();
}

// Converte um ponto da tela para as coordenadas do mapa
function pontoNoMapa(svg, clientX, clientY) {
    const caixa = svg.getBoundingClientRect();
    const largura = VISTA.w / estado.mapa.zoom;
    const altura = largura * formatoDaVista(svg);
    return {
        x: estado.mapa.cx - largura / 2 + ((clientX - caixa.left) / caixa.width) * largura,
        y: estado.mapa.cy - altura / 2 + ((clientY - caixa.top) / caixa.height) * altura
    };
}

// ===== Toque, arrasto e zoom no mapa =====
// O mapa responde a: um dedo arrasta, dois dedos aproximam, dois toques rapidos
// aproximam de uma vez, e - so no celular - puxar para baixo amplia o mapa.

function noCelular() {
    return window.innerWidth <= LARGURA_CELULAR;
}

// Altura maxima que o mapa pode ocupar sem engolir a tela inteira: sobra
// espaco para a barra de abas e para o cartao do caminhao logo abaixo.
function alturaMaximaDoMapa() {
    const abas = document.querySelector('.abas');
    const alturaAbas = abas ? abas.getBoundingClientRect().height : 84;
    const livre = window.innerHeight - alturaAbas - MAPA_MARGEM_ABAIXO;
    return Math.max(MAPA_RECOLHIDO + 60, Math.round(livre));
}

function definirAlturaDoMapa(px) {
    const mapa = document.querySelector('.mapa');
    if (mapa) {
        mapa.style.setProperty('--altura-mapa', Math.round(px) + 'px');
    }
}

// Leva o mapa para um dos dois tamanhos, com animacao
function ajustarMapa(expandido, animar) {
    const mapa = document.querySelector('.mapa');
    const puxador = document.getElementById('puxador-mapa');
    if (!mapa) {
        return;
    }

    estado.mapa.expandido = expandido;
    mapa.classList.toggle('mapa--animando', animar !== false);
    mapa.classList.toggle('mapa--expandido', expandido);
    definirAlturaDoMapa(expandido ? alturaMaximaDoMapa() : MAPA_RECOLHIDO);

    if (puxador) {
        puxador.setAttribute('aria-expanded', expandido ? 'true' : 'false');
        puxador.setAttribute('aria-label', expandido ? 'Recolher o mapa' : 'Ampliar o mapa');
        const texto = puxador.querySelector('.mapa__puxador-texto');
        if (texto) {
            texto.textContent = expandido ? 'Arraste para recolher' : 'Arraste para ampliar';
        }
    }

    // A caixa muda de formato, entao a janela do mapa tem que ser refeita.
    // Uma durante a animacao e outra no fim, para nao ficar esticado no caminho.
    aplicarVista();
    window.setTimeout(aplicarVista, 60);
    window.setTimeout(aplicarVista, 200);
    window.setTimeout(function () {
        mapa.classList.remove('mapa--animando');
        aplicarVista();
    }, 300);

    // Ampliado, o mapa sobe para o alto da tela. A rolagem so acontece depois
    // que ele ja cresceu - antes disso a pagina ainda e curta demais para subir.
    if (expandido && animar !== false && noCelular()) {
        window.setTimeout(function () {
            const topo = mapa.getBoundingClientRect().top + window.scrollY - 8;
            window.scrollTo({ top: Math.max(0, topo), behavior: 'smooth' });
        }, 30);
    }
}

function alternarMapa() {
    ajustarMapa(!estado.mapa.expandido, true);
    vibrar(12);
}

// Um toquinho de vibracao confirma o gesto no celular
function vibrar(ms) {
    if (navigator.vibrate) {
        try {
            navigator.vibrate(ms);
        } catch (erro) {
            // alguns navegadores recusam sem interacao; nao faz mal
        }
    }
}

// Apaga os botoes de mais e menos quando o zoom chega no limite
function atualizarBotoesZoom() {
    const mais = document.getElementById('botao-aproximar');
    const menos = document.getElementById('botao-afastar');
    if (mais) {
        mais.disabled = estado.mapa.zoom >= ZOOM_MAX - 0.001;
    }
    if (menos) {
        menos.disabled = estado.mapa.zoom <= zoomMinimo() + 0.001;
    }
}

// Mostra por um instante de quanto e a aproximacao
let relogioSelo = null;
function mostrarSeloZoom() {
    const selo = document.getElementById('selo-zoom');
    if (!selo) {
        return;
    }
    selo.textContent = estado.mapa.zoom.toFixed(1).replace('.', ',') + '×';
    selo.classList.add('selo-zoom--visivel');
    window.clearTimeout(relogioSelo);
    relogioSelo = window.setTimeout(function () {
        selo.classList.remove('selo-zoom--visivel');
    }, 900);
}

function distanciaEntre(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function ligarGestosDoMapa() {
    const svg = document.querySelector('.mapa__svg');
    const mapa = document.querySelector('.mapa');
    const puxador = document.getElementById('puxador-mapa');

    const dedos = new Map();   // cada dedo encostado na tela
    let arrasto = null;        // arrastar o mapa com um dedo
    let pinca = null;          // aproximar com dois dedos
    let puxada = null;         // puxar para baixo para ampliar
    let ultimoToque = 0;
    let ultimoPonto = null;

    function porPixel() {
        const caixa = svg.getBoundingClientRect();
        return caixa.width < 1 ? 0 : (VISTA.w / estado.mapa.zoom) / caixa.width;
    }

    function encerrarPuxada(cancelado) {
        if (!puxada) {
            return;
        }
        const alcance = alturaMaximaDoMapa() - MAPA_RECOLHIDO;
        const andado = puxada.altura - MAPA_RECOLHIDO;
        const rapido = Math.abs(puxada.ultimoAvanco) > 6;
        let expandir;

        if (cancelado) {
            expandir = puxada.comecouExpandido;
        } else if (rapido) {
            expandir = puxada.ultimoAvanco > 0;
        } else {
            expandir = andado > alcance * 0.35;
        }

        ajustarMapa(expandir, true);
        if (expandir !== puxada.comecouExpandido) {
            vibrar(12);
        }
        puxada = null;
    }

    // ---- um ou dois dedos sobre o mapa ----

    svg.addEventListener('pointerdown', function (evento) {
        dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
        try {
            svg.setPointerCapture(evento.pointerId);
        } catch (erro) {
            // navegadores antigos apenas ignoram
        }

        if (dedos.size === 2) {
            // o segundo dedo cancela o arrasto e comeca a pinca
            arrasto = null;
            if (puxada) {
                ajustarMapa(puxada.comecouExpandido, true);
                puxada = null;
            }
            const par = Array.from(dedos.values());
            pinca = {
                dist: Math.max(1, distanciaEntre(par[0], par[1])),
                meio: { x: (par[0].x + par[1].x) / 2, y: (par[0].y + par[1].y) / 2 }
            };
            return;
        }

        if (dedos.size === 1) {
            arrasto = {
                x: evento.clientX,
                y: evento.clientY,
                x0: evento.clientX,
                y0: evento.clientY,
                decidido: false,
                mexeu: false
            };
        }
    });

    svg.addEventListener('pointermove', function (evento) {
        if (!dedos.has(evento.pointerId)) {
            return;
        }
        dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });

        // ---- dois dedos: aproximar e afastar ----
        if (pinca && dedos.size >= 2) {
            const par = Array.from(dedos.values());
            const dist = Math.max(1, distanciaEntre(par[0], par[1]));
            const meio = { x: (par[0].x + par[1].x) / 2, y: (par[0].y + par[1].y) / 2 };
            const passo = porPixel();

            // primeiro o mapa acompanha o ponto entre os dois dedos
            estado.mapa.cx -= (meio.x - pinca.meio.x) * passo;
            estado.mapa.cy -= (meio.y - pinca.meio.y) * passo;

            // depois aproxima mantendo esse ponto parado
            const alvo = pontoNoMapa(svg, meio.x, meio.y);
            pinca.meio = meio;
            const razao = dist / pinca.dist;
            pinca.dist = dist;
            zoomPara(estado.mapa.zoom * razao, alvo.x, alvo.y);
            mostrarSeloZoom();
            return;
        }

        // ---- puxando para baixo para ampliar o mapa ----
        if (puxada) {
            const alto = Math.max(MAPA_RECOLHIDO,
                Math.min(alturaMaximaDoMapa(), puxada.base + (evento.clientY - puxada.y0)));
            puxada.ultimoAvanco = alto - puxada.altura;
            puxada.altura = alto;
            definirAlturaDoMapa(alto);
            aplicarVista();
            return;
        }

        // ---- um dedo ----
        if (!arrasto) {
            return;
        }

        const dx = evento.clientX - arrasto.x0;
        const dy = evento.clientY - arrasto.y0;

        // O primeiro movimento decide o gesto: puxar o mapa para baixo ou
        // arrastar o desenho. Depois de decidido ele nao muda mais no meio.
        if (!arrasto.decidido) {
            if (Math.hypot(dx, dy) < 8) {
                return;
            }
            arrasto.decidido = true;
            arrasto.mexeu = true;

            const verticalParaBaixo = dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.5;
            if (noCelular() && !estado.mapa.expandido && verticalParaBaixo) {
                puxada = {
                    y0: evento.clientY,
                    base: mapa.getBoundingClientRect().height,
                    altura: mapa.getBoundingClientRect().height,
                    ultimoAvanco: 0,
                    comecouExpandido: false
                };
                mapa.classList.remove('mapa--animando');
                arrasto = null;
                return;
            }
        }

        const passo = porPixel();
        estado.mapa.cx -= (evento.clientX - arrasto.x) * passo;
        estado.mapa.cy -= (evento.clientY - arrasto.y) * passo;
        arrasto.x = evento.clientX;
        arrasto.y = evento.clientY;
        aplicarVista();
    });

    function soltar(evento) {
        dedos.delete(evento.pointerId);
        try {
            svg.releasePointerCapture(evento.pointerId);
        } catch (erro) {
            // ja pode ter sido solto
        }

        if (dedos.size < 2) {
            pinca = null;
        }
        if (dedos.size === 0) {
            encerrarPuxada(evento.type === 'pointercancel');

            // Dois toques rapidos no mesmo lugar aproximam o mapa
            if (arrasto && !arrasto.mexeu) {
                const agora = Date.now();
                const ponto = { x: evento.clientX, y: evento.clientY };
                if (agora - ultimoToque < 320 && ultimoPonto &&
                    distanciaEntre(ponto, ultimoPonto) < 34) {
                    const alvo = pontoNoMapa(svg, ponto.x, ponto.y);
                    zoomPara(estado.mapa.zoom * 1.8, alvo.x, alvo.y);
                    mostrarSeloZoom();
                    vibrar(10);
                    ultimoToque = 0;
                } else {
                    ultimoToque = agora;
                    ultimoPonto = ponto;
                }
            }
            arrasto = null;
        }
    }

    ['pointerup', 'pointercancel'].forEach(function (nome) {
        svg.addEventListener(nome, soltar);
    });

    // ---- rodinha do mouse, no computador ----
    svg.addEventListener('wheel', function (evento) {
        evento.preventDefault();
        const alvo = pontoNoMapa(svg, evento.clientX, evento.clientY);
        zoomPara(estado.mapa.zoom * (evento.deltaY < 0 ? 1.14 : 0.88), alvo.x, alvo.y);
        mostrarSeloZoom();
    }, { passive: false });

    // ---- botoes ----
    document.getElementById('botao-aproximar').addEventListener('click', function () {
        zoomPara(estado.mapa.zoom * 1.4);
        mostrarSeloZoom();
    });
    document.getElementById('botao-afastar').addEventListener('click', function () {
        zoomPara(estado.mapa.zoom / 1.4);
        mostrarSeloZoom();
    });

    // ---- teclado, com o mapa em foco ----
    svg.setAttribute('tabindex', '0');
    svg.addEventListener('keydown', function (evento) {
        const passo = 40 / estado.mapa.zoom;
        const teclas = {
            ArrowUp: [0, -passo], ArrowDown: [0, passo],
            ArrowLeft: [-passo, 0], ArrowRight: [passo, 0]
        };
        if (teclas[evento.key]) {
            evento.preventDefault();
            estado.mapa.cx += teclas[evento.key][0];
            estado.mapa.cy += teclas[evento.key][1];
            aplicarVista();
        } else if (evento.key === '+' || evento.key === '=') {
            evento.preventDefault();
            zoomPara(estado.mapa.zoom * 1.4);
            mostrarSeloZoom();
        } else if (evento.key === '-' || evento.key === '_') {
            evento.preventDefault();
            zoomPara(estado.mapa.zoom / 1.4);
            mostrarSeloZoom();
        }
    });

    // ---- a alca que amplia o mapa ----
    if (puxador) {
        let alcaAtiva = null;

        puxador.addEventListener('pointerdown', function (evento) {
            evento.preventDefault();
            try {
                puxador.setPointerCapture(evento.pointerId);
            } catch (erro) {
                // sem captura o gesto ainda funciona dentro da alca
            }
            const altura = mapa.getBoundingClientRect().height;
            alcaAtiva = { id: evento.pointerId, y0: evento.clientY, mexeu: false };
            puxada = {
                y0: evento.clientY,
                base: altura,
                altura: altura,
                ultimoAvanco: 0,
                comecouExpandido: estado.mapa.expandido
            };
            mapa.classList.remove('mapa--animando');
        });

        puxador.addEventListener('pointermove', function (evento) {
            if (!alcaAtiva || alcaAtiva.id !== evento.pointerId || !puxada) {
                return;
            }
            if (Math.abs(evento.clientY - alcaAtiva.y0) > 5) {
                alcaAtiva.mexeu = true;
            }
            const alto = Math.max(MAPA_RECOLHIDO,
                Math.min(alturaMaximaDoMapa(), puxada.base + (evento.clientY - puxada.y0)));
            puxada.ultimoAvanco = alto - puxada.altura;
            puxada.altura = alto;
            definirAlturaDoMapa(alto);
            aplicarVista();
        });

        ['pointerup', 'pointercancel'].forEach(function (nome) {
            puxador.addEventListener(nome, function (evento) {
                if (!alcaAtiva || alcaAtiva.id !== evento.pointerId) {
                    return;
                }
                // Um toque simples na alca tambem alterna, sem precisar arrastar
                if (!alcaAtiva.mexeu) {
                    puxada = null;
                    alternarMapa();
                } else {
                    encerrarPuxada(nome === 'pointercancel');
                }
                alcaAtiva = null;
            });
        });

        puxador.addEventListener('keydown', function (evento) {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                alternarMapa();
            }
        });
    }

    // Girar o aparelho ou mudar a janela muda o formato da caixa do mapa
    window.addEventListener('resize', function () {
        if (estado.mapa.expandido && noCelular()) {
            definirAlturaDoMapa(alturaMaximaDoMapa());
        } else if (!noCelular()) {
            const alvo = document.querySelector('.mapa');
            if (alvo) {
                alvo.style.removeProperty('--altura-mapa');
            }
        }
        aplicarVista();
    });

    ajustarMapa(false, false);
}

function desenharFrota() {
    if (!frotaMontada) {
        montarFrota();
    }
    atualizarFrota();
}

// Recorta o pedaço da rota entre duas distâncias percorridas
function trechoRota(rota, de, ate) {
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

// Qual bairro este caminhão atende
function regiaoDoCaminhao(caminhao) {
    const chave = Object.keys(REGIOES).find(function (id) {
        return caminhao.nome.indexOf(REGIOES[id].caminhao) >= 0;
    });
    return chave ? REGIOES[chave] : null;
}

function minutosDe(hora) {
    const partes = hora.split(':');
    return Number(partes[0]) * 60 + Number(partes[1]);
}

function horaDeMinutos(minutos) {
    const m = Math.round(minutos);
    return doisDigitos(Math.floor(m / 60) % 24) + ':' + doisDigitos(m % 60);
}

// Estado de cada rua da rota, comparando o quanto o caminhão já andou
function itinerarioDe(caminhao) {
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

    // Fora da tela do mapa a caixa do desenho fica com tamanho zero; ao voltar,
    // a janela precisa ser refeita com as medidas de verdade.
    if (tela === 'mapa') {
        aplicarVista();
    }
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
        centralizarNoMorador();
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
    document.getElementById('botao-centralizar').addEventListener('click', centralizarNoMorador);
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
    ligarGestosDoMapa();
    desenharMeusRelatos();
    desenharStatus();
    desenharFrota();
    centralizarNoMorador();
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
