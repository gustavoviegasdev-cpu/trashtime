# TrashTime

Aplicativo de acompanhamento da coleta de lixo urbana, ambientado no **centro de
Belém do Pará**. Mostra em tempo real onde estão os caminhões, por onde já
passaram e o que ainda falta, informa os dias e horários de coleta de cada
bairro, avisa quando o caminhão se aproxima e permite ao morador registrar um
problema quando o serviço falha.

São nove bairros: **Umarizal**, **Reduto**, **Campina**, **Cidade Velha**,
**Nazaré**, **São Brás**, **Batista Campos**, **Jurunas** e **Guamá**. O mapa
reproduz a península de Belém — a Baía do Guajará a oeste, o Rio Guamá ao sul e
a Ilha do Combu do outro lado — e traz onze pontos que qualquer belenense
reconhece: Ver-o-Peso, Estação das Docas, Teatro da Paz, Forte do Presépio,
Mangal das Garças, Basílica de Nazaré, Praça Batista Campos, Mercado de São
Brás, Bosque Rodrigues Alves e a UFPA. As ruas dos itinerários são reais.

## Tecnologia

**Vue 3** com **Vite**. Estilo próprio, sem framework de CSS.

O mapa não usa biblioteca de mapas: é SVG desenhado por cálculo. A malha de ruas
sai de uma única fórmula — `P(i,j) = origem + i×62×u + j×46×v`, com as vias a
−4° — e as rotas dos caminhões correm sobre os cruzamentos dela. O caminhão é um
volume de 24 faces, montado por uma projeção que leva cada ponto do espaço às
duas coordenadas do desenho.

## Como rodar

```bash
npm install     # uma vez
npm run dev     # abre em http://localhost:5173
```

Para gerar a versão publicável:

```bash
npm run build   # sai em dist/
npm run preview # confere o resultado do build
```

## Como está organizado

```
index.html            entrada: o Vite injeta o app aqui
public/               copiado sem alteração para dist/
  manifest.json         para o app ser instalável
  sw.js                 service worker: abre sem internet
  icone-*.png
src/
  main.js             monta o app e liga tema e persistência
  App.vue             troca de tela, folhas e o relógio da simulação
  dados/              bairros, frota, pontos e listas fixas
  nucleo/             funções puras: geometria, datas e o desenho 3D
  estado/             estado reativo, tema e as contas que dependem dele
  mapa/               o SVG do mapa, o zoom e os gestos de toque
  telas/              as quatro telas
  componentes/        abas, folhas, boas-vindas, alerta
  estilo/base.css     toda a aparência, incluindo o modo escuro
```

A divisão segue uma regra: **`nucleo/` não sabe que existe tela nem estado**. São
funções que recebem números e devolvem números — dá para testá-las no Node, sem
navegador. `estado/` conhece o estado do app. `mapa/`, `telas/` e `componentes/`
conhecem a tela.

## O que o Vue trouxe

Na versão anterior, feita sem framework, havia vinte funções `desenharX()` que
montavam HTML em texto. Depois de mexer no estado era preciso lembrar de chamar
as certas — e esquecer uma deixava a tela desatualizada.

Agora o estado é reativo: mudar o bairro atualiza sozinho o cartão, a lista de
coletas, o calendário e o caminhão em destaque. As funções de desenho sumiram.

Isso também eliminou um defeito real: a camada da frota era refeita a cada
segundo com `innerHTML`, o que destruía o elemento em foco — quem navegava pelo
teclado perdia o foco a cada segundo. O Vue mexe só no atributo que mudou, então
o foco permanece.

**O que continuou imperativo:** os gestos de toque. Pinça e arrasto são conta de
pixel, e framework nenhum ajuda nisso. O resultado da conta cai em `estado.mapa`,
que é reativo, e daí a tela se atualiza sozinha.

## O que dá para fazer no app

- **Mapa** — nove caminhões percorrendo circuitos fechados, cada rota dividida em
  já passou, rota prevista e ainda não passou. Pinça, arrasto, dois toques para
  aproximar, e no celular o mapa cresce quando puxado para baixo.
- **Calendário** — dias de coleta comum e seletiva por bairro, com o histórico do
  que já aconteceu.
- **Avisos** — proximidade do caminhão, mudança de horário e comunicados, com
  filtro e marcação de lido.
- **Configurações** — bairro, endereço, modo escuro, quais alertas receber, a que
  distância avisar e o horário do lembrete.

Tudo o que o morador escolhe fica guardado no aparelho.

## Publicar na Vercel

O projeto é detectado como Vite automaticamente: a Vercel roda `npm install` e
`npm run build`, e publica `dist/`. Basta ligar o repositório do GitHub — a cada
Push, o site é republicado.

O `vercel.json` cuida de duas coisas: o `sw.js` nunca é guardado em cache (senão
o service worker antigo continuaria valendo) e os arquivos de `recursos/`, que
têm um código no nome, são guardados por um ano.

## Dados

Não há GPS nem servidor. As posições dos caminhões são uma simulação: cada um
percorre sua rota a uma velocidade fixa. O histórico é gerado a partir da data,
sempre igual para o mesmo dia. Os relatos ficam só neste aparelho.
