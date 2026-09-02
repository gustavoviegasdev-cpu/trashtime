// A frota. Cada rota é um circuito fechado que corre sobre os cruzamentos
// da malha desenhada no mapa.

// Cada rota acompanha as ruas desenhadas no mapa
export const CAMINHOES = [
    {
        id: 'ct052', nome: 'Caminhão CT-052', setor: 'Setor Umarizal',
        cor: '#2FA85A', velocidade: 1.4, progresso: 0.3, voltas: 0,
        rota: [
            { x: 156.9, y: 57.2 }, { x: 342.5, y: 44.3 }, { x: 339.2, y: -1.6 },
            { x: 277.4, y: 2.7 }, { x: 274.2, y: -43.2 }, { x: 150.5, y: -34.5 },
            { x: 156.9, y: 57.2 }
        ],
        ruas: ['Av. Sen. Lemos',
               'Trav. Rui Barbosa',
               'Av. Visc. de Souza Franco',
               'Trav. Dom Romualdo de Seixas',
               'Av. Brás de Aguiar',
               'Trav. Antônio Barreto']
    },
    {
        id: 'ct063', nome: 'Caminhão CT-063', setor: 'Setor Reduto',
        cor: '#2FA85A', velocidade: 1.2, progresso: 0.55, voltas: 0,
        rota: [
            { x: 163.3, y: 149.0 }, { x: 348.9, y: 136.0 }, { x: 345.7, y: 90.2 },
            { x: 160.1, y: 103.1 }, { x: 163.3, y: 149.0 }
        ],
        ruas: ['Av. Assis de Vasconcelos',
               'Trav. Quintino Bocaiúva',
               'Blvd. Castilhos França',
               'Trav. Campos Sales']
    },
    {
        id: 'ct104', nome: 'Caminhão CT-104', setor: 'Setor Campina',
        cor: '#2FA85A', velocidade: 1.6, progresso: 0.46, voltas: 0,
        rota: [
            { x: 169.7, y: 240.8 }, { x: 355.3, y: 227.8 }, { x: 352.1, y: 181.9 },
            { x: 166.5, y: 194.9 }, { x: 169.7, y: 240.8 }
        ],
        ruas: ['Blvd. Castilhos França',
               'Av. Pres. Vargas',
               'Rua Santo Antônio',
               'Trav. Campos Sales']
    },
    {
        id: 'ct118', nome: 'Caminhão CT-118', setor: 'Setor Cidade Velha',
        cor: '#2FA85A', velocidade: 1.1, progresso: 0.3, voltas: 0,
        rota: [
            { x: 173.0, y: 286.7 }, { x: 296.6, y: 278.0 }, { x: 299.9, y: 323.9 },
            { x: 238.0, y: 328.2 }, { x: 241.2, y: 374.1 }, { x: 179.4, y: 378.5 },
            { x: 173.0, y: 286.7 }
        ],
        ruas: ['Rua Padre Champagnat',
               'Rua Dr. Malcher',
               'Rua Siqueira Mendes',
               'Trav. Joaquim Távora',
               'Rua Gaspar Viana',
               'Blvd. Castilhos França']
    },
    {
        id: 'ct090', nome: 'Caminhão CT-090', setor: 'Setor Nazaré',
        cor: '#2FA85A', velocidade: 1.3, progresso: 0.22, voltas: 0,
        rota: [
            { x: 345.7, y: 90.2 }, { x: 531.2, y: 77.2 }, { x: 528.0, y: 31.3 },
            { x: 342.5, y: 44.3 }, { x: 345.7, y: 90.2 }
        ],
        ruas: ['Av. Nazaré',
               'Trav. 14 de Março',
               'Av. Gentil Bittencourt',
               'Av. Gov. José Malcher']
    },
    {
        id: 'ct071', nome: 'Caminhão CT-071', setor: 'Setor São Brás',
        cor: '#8A968D', velocidade: 0, progresso: 0, voltas: 0,
        rota: [
            { x: 534.4, y: 123.1 }, { x: 720.0, y: 110.1 }, { x: 716.8, y: 64.2 },
            { x: 654.9, y: 68.5 }, { x: 651.7, y: 22.6 }, { x: 528.0, y: 31.3 },
            { x: 534.4, y: 123.1 }
        ],
        ruas: ['Av. Almirante Barroso',
               'Trav. Mauriti',
               'Av. José Bonifácio',
               'Trav. Vileta',
               'Rua Curuçá',
               'Av. Dr. Freitas']
    },
    {
        id: 'ct076', nome: 'Caminhão CT-076', setor: 'Setor Batista Campos',
        cor: '#2FA85A', velocidade: 1.5, progresso: 0.38, voltas: 0,
        rota: [
            { x: 355.3, y: 227.8 }, { x: 540.8, y: 214.8 }, { x: 537.6, y: 169.0 },
            { x: 352.1, y: 181.9 }, { x: 355.3, y: 227.8 }
        ],
        ruas: ['Rua dos Mundurucus',
               'Trav. Padre Eutíquio',
               'Av. Gov. José Malcher',
               'Rua dos Tamoios']
    },
    {
        id: 'ct085', nome: 'Caminhão CT-085', setor: 'Setor Jurunas',
        cor: '#2FA85A', velocidade: 1.25, progresso: 0.62, voltas: 0,
        rota: [
            { x: 306.3, y: 415.7 }, { x: 491.8, y: 402.7 }, { x: 488.6, y: 356.8 },
            { x: 303.1, y: 369.8 }, { x: 306.3, y: 415.7 }
        ],
        ruas: ['Rua Nova',
               'Trav. Roberto Camelier',
               'Av. Bernardo Sayão',
               'Rua Veiga Cabral']
    },
    {
        id: 'ct099', nome: 'Caminhão CT-099', setor: 'Setor Guamá',
        cor: '#8A968D', velocidade: 0, progresso: 0, voltas: 0,
        rota: [
            { x: 495.0, y: 448.6 }, { x: 680.6, y: 435.6 }, { x: 677.4, y: 389.7 },
            { x: 615.5, y: 394.1 }, { x: 612.3, y: 348.2 }, { x: 488.6, y: 356.8 },
            { x: 495.0, y: 448.6 }
        ],
        ruas: ['Av. Perimetral',
               'Trav. Barão do Triunfo',
               'Rua Augusto Corrêa',
               'Trav. Vileta',
               'Rua Silva Castro',
               'Av. Bernardo Sayão']
    }
];
