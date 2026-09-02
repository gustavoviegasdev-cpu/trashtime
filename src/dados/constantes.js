// Medidas e limites do mapa. Uma unidade do desenho vale 4 metros.

// 1 unidade do mapa equivale a 4 metros
export const ESCALA = 4;

// O trecho logo à frente do caminhão é o que a legenda chama de "rota prevista";
// o que vem depois dele ainda é "ainda não passou". Uma quadra e meia.
export const ALCANCE_PREVISTO = 90;

// O mapa desenha uma área maior do que cabe na tela; o zoom recorta um pedaço
// O desenho vai de (0, -320) ate (900, 780): a peninsula inteira, com cidade
// ao norte e a leste do centro, a baia a oeste e o Guama ao sul.
export const MUNDO = { x: 0, y: -320, w: 900, h: 1100 };
export const VISTA = { w: 390, h: 260 };
export const ZOOM_MAX = 3;
export const ZOOM_PADRAO = 1.6;

// No celular o mapa comeca recolhido e o morador puxa para baixo para amplia-lo.
// Estas sao as duas alturas entre as quais ele se move.
// A alca ocupa uma faixa embaixo do mapa; a altura recolhida cresce o mesmo
// tanto para que a area util do desenho continue a mesma de antes.
export const MAPA_RECOLHIDO = 296;
export const MAPA_MARGEM_ABAIXO = 112;   // espaco que fica para o cartao do caminhao
export const LARGURA_CELULAR = 899;      // acima disso vale o layout de computador

// A partir daqui os nomes dos pontos cabem na tela sem virar sopa de letras
export const ZOOM_MOSTRA_NOMES = 1.15;

export const CHAVE_ARMAZENAMENTO = 'trashtime';
