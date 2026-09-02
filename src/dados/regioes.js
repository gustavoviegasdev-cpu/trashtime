// Os nove bairros do centro de Belém que o app acompanha.

export const REGIOES = {
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
