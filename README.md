# TrashTime

Aplicativo de acompanhamento da coleta de lixo urbana, ambientado no **centro de
Belém do Pará**. Mostra em tempo real onde estão os caminhões, por onde já
passaram e o que ainda falta, informa os dias e horários de coleta de cada
bairro, avisa quando o caminhão se aproxima e permite ao morador registrar um
problema quando o serviço falha.

Os bairros atendidos são **Campina**, **Cidade Velha**, **Nazaré** e **Batista
Campos**, e o mapa reproduz a orla da Baía do Guajará, que é o que define o
desenho do centro da cidade. As ruas dos itinerários são reais: Boulevard
Castilhos França, Avenida Presidente Vargas, Rua Siqueira Mendes, Avenida
Gentil Bittencourt, entre outras.

## Como abrir

**Direto:** abra o arquivo `index.html` no navegador — dois cliques bastam. Não
precisa instalar nada, nem servidor, nem build.

**Como aplicativo instalável:** rode `./servir.sh` e acesse
<http://localhost:8000>. Servido por HTTP, o navegador oferece instalar o
TrashTime na tela inicial, ele abre em tela cheia sem barra de endereço e
**funciona sem internet**. Abrindo o arquivo direto (`file://`) o navegador
bloqueia o service worker, então essa parte só vale servida.

Para instalar no celular, use o IP desta máquina na mesma rede — por exemplo
`http://192.168.0.10:8000`.

## Publicar na web (Vercel)

O projeto é estático, então não há build. Na pasta do projeto:

```bash
npx vercel login     # uma vez, autentica sua conta
npx vercel --prod    # publica e devolve a URL
```

A primeira publicação pergunta o nome do projeto e o diretório — aceite os
padrões (o diretório é `./`). O `vercel.json` já cuida do detalhe que costuma
morder: o `sw.js` é servido sem cache, senão o navegador segura a versão antiga
do service worker e as atualizações não chegam.

Publicado em HTTPS, o TrashTime fica instalável de qualquer celular, sem
precisar estar na mesma rede.

Qualquer hospedagem de arquivos estáticos serve igual — GitHub Pages, Netlify,
Cloudflare Pages — desde que seja HTTPS, que é exigência do service worker.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | Estrutura das telas e os ícones em SVG |
| `style.css` | Aparência: paleta, tipografia e componentes |
| `app.js` | Toda a lógica: rotas, calendário, avisos, relatos |
| `manifest.json` | Identidade do app instalável: nome, cores, ícones |
| `sw.js` | Service worker: guarda o app para funcionar sem internet |
| `servir.sh` | Sobe um servidor local na porta 8000 |
| `vercel.json` | Cabeçalhos de publicação (impede cache do service worker) |
| `icone-*.png` | Ícones do app, gerados a partir do ícone do caminhão |

Os arquivos `.dc.html` e `trashtime-app.html` são o **protótipo visual** que
originou o app, e não fazem parte da aplicação.

## O que o app faz

### Mapa
- Três caminhões percorrem suas rotas pelas ruas, avançando a cada segundo.
- O trajeto de cada caminhão é dividido nos três estados da legenda: **já
  passou** (verde cheio, atrás dele), **rota prevista** (verde tracejado, o
  trecho logo à frente) e **ainda não passou** (cinza pontilhado, o resto).
  Um caminhão que não saiu tem a rota inteira em cinza.
- Tocar num caminhão seleciona; tocar no cartão abre o **itinerário** com as ruas
  da rota, o horário em que cada uma foi atendida e a estimativa das que faltam.
- O tempo de chegada é calculado a partir da distância que falta e da velocidade
  do caminhão — não é um texto fixo.
- Os horários do itinerário saem da **janela de coleta do bairro**, distribuídos
  ao longo da rota. Assim o que o itinerário mostra fecha com o que o calendário
  e os cartões de status prometem, em vez de seguir o relógio de quem abre.

### Bairros e localização
- Cada bairro tem sua própria regra de dias, janela de horário, caminhão e
  ponto no mapa.
- Ao trocar de bairro, o mapa acompanha: sua localização se move, o caminhão em
  destaque passa a ser o que atende aquela região e o alerta de aproximação
  volta a valer para ele.
- O botão de alvo no mapa devolve o foco ao caminhão do seu bairro e pisca a
  sua localização.

### Calendário
- Gerado a partir do calendário real: navega por qualquer mês e ano.
- Cada região tem sua própria regra de dias, diferenciando **coleta comum** de
  **coleta seletiva**.
- Dia futuro mostra o previsto. Dia passado mostra o que aconteceu: horário real
  e situação (realizada, com atraso, não realizada).
- A lista **Últimas coletas** resume as quatro passagens mais recentes.

### Avisos
- Filtros por tipo e marcação de lido, com contador na barra inferior.
- O **alerta de aproximação dispara sozinho** quando o caminhão da sua região
  entra na distância configurada.

### Relatos
- Registra coleta não realizada, lixo acumulado, passagem fora do horário ou
  outro problema.
- Cada relato ganha um número de protocolo sequencial e fica acompanhável.
- O dia correspondente no calendário passa a exibir o protocolo.

### Configurações
- Escolha de região e endereço, tipos de alerta, distância de aviso (200 m,
  500 m ou 1 km) e horário do lembrete da véspera.
- Tudo fica salvo no navegador: fechar e reabrir mantém o estado.

## Como a simulação funciona

Cada caminhão tem uma rota (uma lista de pontos) e uma velocidade. A cada
segundo o progresso avança, e a posição é interpolada ao longo da linha. A
divisão entre trecho percorrido e trecho previsto sai desse mesmo cálculo.

O histórico de dias passados usa uma **semente estável** derivada da data e da
região (FNV-1a). Assim o mesmo dia devolve sempre o mesmo resultado — o passado
não se reescreve a cada vez que o app abre.

A escala do mapa é de 1 unidade para 4 metros, e é ela que dá sentido à
configuração de distância do alerta.

A malha viária não é desenhada à mão: todas as vias saem de um único ângulo
(-4°), de uma origem e de um espaçamento fixo, e os pontos das rotas são
exatamente os cruzamentos dessa malha. Cada trecho varia só uma das duas
coordenadas da grade, então o caminhão anda sempre sobre uma rua, nunca cortando
quadra na diagonal. As praças ocupam quadras inteiras e giram no mesmo ângulo.

## Limites honestos

Este é um app **com dados simulados**:

- Não há GPS, servidor ou integração com sistema de prefeitura. Rotas, horários
  e regiões estão no `app.js`.
- Os avisos aparecem dentro do app, não como notificação do sistema operacional.
- A simulação é acelerada para ser demonstrável. Uma rota real de coleta leva
  horas, não minutos.

O comportamento é real; a origem dos dados é simulada.

## Funcionamento sem internet

O `sw.js` guarda o HTML, o CSS, o JS e os ícones na primeira visita. Depois
disso o app abre mesmo com a rede fora do ar — verificado derrubando o servidor
e recarregando. A fonte vem do Google Fonts e é o único recurso externo; sem
rede, o app usa a fonte do sistema e continua legível.

A estratégia é **rede primeiro** para HTML, CSS e JS: o worker tenta buscar a
versão do servidor e só cai no cache se não houver conexão. É isso que faz uma
publicação nova chegar sozinha a quem já visitou o site, sem depender de trocar
o número da versão a cada mudança. Imagens e fontes seguem o caminho oposto —
cache primeiro, porque quase nunca mudam e assim carregam na hora.

A versão do cache (`trashtime-v2`) só precisa mudar quando a lista de arquivos
guardados mudar, para o worker descartar o cache antigo.

## Celular e desktop

O layout tem duas formas, com a mesma qualidade nas duas:

- **Celular:** coluna única, barra de abas embaixo, folhas deslizando de baixo
  para cima.
- **Desktop (a partir de 900px):** navegação lateral fixa com a marca, conteúdo
  em duas colunas (mapa grande à esquerda, informações à direita), folhas viram
  janelas centralizadas e o aviso flutuante vai para o canto.

A troca é feita só por CSS. Os elementos `.faixa` são invisíveis ao layout no
celular (`display: contents`) e viram as colunas no desktop — assim a mesma
marcação serve às duas formas, sem duplicação.

## Acessibilidade

- Alvos de toque de no mínimo 44 px.
- Navegação completa por teclado, incluindo os caminhões no mapa (`Tab` para
  alcançar, `Enter` ou espaço para selecionar).
- `Esc` fecha as folhas, devolvendo o foco ao elemento de origem.
- Contorno de foco visível e mensagens anunciadas a leitores de tela.
