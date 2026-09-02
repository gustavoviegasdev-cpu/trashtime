<template>
    <!-- A parte do mapa que nunca muda: quadras, ruas, avenidas, a baía do
         Guajará, o Rio Guamá, a Ilha do Combu e as praças. É desenho puro,
         sem estado nenhum, então fica fora do que o Vue precisa acompanhar. -->
    <g>
        <defs>
            <!-- Uma quadra: repetida pelo mapa inteiro, alinhada à mesma
                 malha das ruas (mesmo ângulo, mesmo espaçamento). -->
            <pattern id="quadras" width="62" height="46" patternUnits="userSpaceOnUse"
                     patternTransform="rotate(-4) translate(28.53 22.04)">
                <rect class="mapa-quadra" x="3.5" y="3.5" width="55" height="39" rx="5" />
            </pattern>
        </defs>

        <rect class="mapa-base" x="-200" y="-560" width="1500" height="1560" />
        <rect x="-200" y="-560" width="1500" height="1560" fill="url(#quadras)" />


        <!-- Ruas do bairro: a malha inteira, um ângulo só (-4°) -->
        <g class="mapa-rua" fill="none" stroke-linecap="round">
            <path d="M-184 -380 L991 -462" stroke-width="5" />
            <path d="M-181 -334 L994 -416" stroke-width="6" />
            <path d="M-178 -288 L997 -370" stroke-width="7" />
            <path d="M-175 -242 L1000 -325" stroke-width="6" />
            <path d="M-172 -196 L1004 -279" stroke-width="5" />
            <path d="M-168 -151 L1007 -233" stroke-width="6" />
            <path d="M-165 -105 L1010 -187" stroke-width="7" />
            <path d="M-162 -59 L1013 -141" stroke-width="6" />
            <path d="M-159 -13 L1016 -95" stroke-width="5" />
            <path d="M-156 33 L1020 -49" stroke-width="6" />
            <path d="M-149 125 L1026 43" stroke-width="6" />
            <path d="M-146 171 L1029 88" stroke-width="5" />
            <path d="M-143 217 L1032 134" stroke-width="6" />
            <path d="M-136 308 L1039 226" stroke-width="6" />
            <path d="M-133 354 L1042 272" stroke-width="5" />
            <path d="M-130 400 L1045 318" stroke-width="6" />
            <path d="M-127 446 L1048 364" stroke-width="7" />
            <path d="M-120 538 L1055 456" stroke-width="5" />
            <path d="M-117 584 L1058 501" stroke-width="6" />
            <path d="M-114 630 L1061 547" stroke-width="7" />
            <path d="M-111 675 L1065 593" stroke-width="6" />
            <path d="M-107 721 L1068 639" stroke-width="5" />
            <path d="M-104 767 L1071 685" stroke-width="6" />
            <path d="M-101 813 L1074 731" stroke-width="7" />
            <path d="M-98 859 L1077 777" stroke-width="6" />
            <path d="M-95 905 L1081 823" stroke-width="5" />
            <path d="M-126 -430 L-30 946" stroke-width="7" />
            <path d="M-64 -435 L32 942" stroke-width="5" />
            <path d="M-2 -439 L94 938" stroke-width="6" />
            <path d="M60 -443 L156 933" stroke-width="5" />
            <path d="M183 -452 L280 925" stroke-width="5" />
            <path d="M245 -456 L342 920" stroke-width="6" />
            <path d="M307 -461 L403 916" stroke-width="5" />
            <path d="M431 -469 L527 907" stroke-width="5" />
            <path d="M493 -473 L589 903" stroke-width="6" />
            <path d="M555 -478 L651 899" stroke-width="5" />
            <path d="M616 -482 L713 895" stroke-width="7" />
            <path d="M740 -491 L836 886" stroke-width="6" />
            <path d="M802 -495 L898 882" stroke-width="5" />
            <path d="M864 -499 L960 877" stroke-width="7" />
            <path d="M926 -504 L1022 873" stroke-width="5" />
            <path d="M987 -508 L1084 869" stroke-width="6" />
        </g>

        <!-- Avenidas: Pres. Vargas, Almirante Barroso, Nazaré, José Malcher,
             Perimetral e Bernardo Sayão, as vias que cortam o centro -->
        <g class="mapa-avenida" fill="none" stroke-linecap="round">
            <path d="M-152 79 L1023 -3" stroke-width="11" />
            <path d="M-140 262 L1036 180" stroke-width="11" />
            <path d="M-123 492 L1052 410" stroke-width="11" />
            <path d="M122 -448 L218 929" stroke-width="11" />
            <path d="M369 -465 L465 912" stroke-width="11" />
            <path d="M678 -486 L775 890" stroke-width="11" />
        </g>
        <g class="mapa-avenida-canteiro" fill="none" stroke-linecap="round">
            <path d="M-152 79 L1023 -3" stroke-width="1.6" />
            <path d="M-140 262 L1036 180" stroke-width="1.6" />
            <path d="M-123 492 L1052 410" stroke-width="1.6" />
            <path d="M122 -448 L218 929" stroke-width="1.6" />
            <path d="M369 -465 L465 912" stroke-width="1.6" />
            <path d="M678 -486 L775 890" stroke-width="1.6" />
        </g>

        <!-- Baía do Guajará a oeste e o Rio Guamá ao sul: a península de Belém -->
        <path class="mapa-agua" d="M20 -320 C42 -232 78 -112 96 0 C104 70 132 140 138 220 C144 290 122 350 132 400 C142 448 175 470 240 482 C330 498 420 490 520 508 C620 526 700 520 780 534 C828 541 866 549 900 560 L900 780 L0 780 L0 -320 Z" />

        <!-- Trapiches do Ver-o-Peso e os armazéns da Estação das Docas -->
        <g class="mapa-cais">
            <path d="M150 214 L112 211" stroke-width="7" stroke-linecap="round" />
            <path d="M152 240 L118 238" stroke-width="7" stroke-linecap="round" />
            <path d="M144 150 L108 147" stroke-width="6" stroke-linecap="round" />
            <path d="M143 170 L110 168" stroke-width="6" stroke-linecap="round" />
            <path d="M126 330 L96 327" stroke-width="6" stroke-linecap="round" />
        </g>
        <g class="mapa-armazem">
            <rect x="140" y="140" width="15" height="40" rx="3" transform="rotate(-4 147 160)" />
            <rect x="140" y="186" width="15" height="34" rx="3" transform="rotate(-4 147 203)" />
            <rect x="146" y="226" width="15" height="34" rx="3" transform="rotate(-4 153 243)" />
        </g>

        <!-- Ilha do Combu, do outro lado do Guamá -->
        <path class="mapa-ilha" d="M268 566 C310 548 380 546 428 562 C466 574 470 600 432 612
                                   C378 628 300 626 268 610 C246 598 246 576 268 566 Z" />
        <path class="mapa-ilha-borda" d="M268 566 C310 548 380 546 428 562 C466 574 470 600 432 612
                                   C378 628 300 626 268 610 C246 598 246 576 268 566 Z"
              fill="none" stroke-width="2" />

        <path class="mapa-agua-borda" d="M20 -320 C42 -232 78 -112 96 0 C104 70 132 140 138 220 C144 290 122 350 132 400 C142 448 175 470 240 482 C330 498 420 490 520 508 C620 526 700 520 780 534 C828 541 866 549 900 560" fill="none" stroke-width="2" />

        <!-- praças e áreas verdes -->
        <rect class="mapa-verde" x="229" y="60" width="44" height="28" rx="9" transform="rotate(-4 251 74)" />
        <rect class="mapa-verde" x="418" y="93" width="44" height="28" rx="9" transform="rotate(-4 440 107)" />
        <rect class="mapa-verde" x="604" y="80" width="44" height="28" rx="9" transform="rotate(-4 626 94)" />
        <rect class="mapa-verde" x="242" y="243" width="44" height="28" rx="9" transform="rotate(-4 264 257)" />
        <rect class="mapa-verde" x="428" y="230" width="44" height="28" rx="9" transform="rotate(-4 450 244)" />
        <rect class="mapa-verde" x="375" y="372" width="44" height="28" rx="9" transform="rotate(-4 397 386)" />
        <rect class="mapa-verde" x="564" y="405" width="44" height="28" rx="9" transform="rotate(-4 586 419)" />
        <rect class="mapa-verde" x="174" y="156" width="44" height="28" rx="9" transform="rotate(-4 196 170)" />
        <rect class="mapa-verde" x="296" y="-74" width="44" height="28" rx="9" transform="rotate(-4 318 -60)" />
        <rect class="mapa-verde" x="482" y="-104" width="44" height="28" rx="9" transform="rotate(-4 504 -90)" />
        <rect class="mapa-verde" x="668" y="-60" width="44" height="28" rx="9" transform="rotate(-4 690 -46)" />
        <rect class="mapa-verde" x="210" y="-190" width="44" height="28" rx="9" transform="rotate(-4 232 -176)" />
        <rect class="mapa-verde" x="392" y="-228" width="44" height="28" rx="9" transform="rotate(-4 414 -214)" />
        <rect class="mapa-verde" x="578" y="-196" width="44" height="28" rx="9" transform="rotate(-4 600 -182)" />
        <rect class="mapa-verde" x="764" y="-152" width="44" height="28" rx="9" transform="rotate(-4 786 -138)" />
        <rect class="mapa-verde" x="716" y="168" width="44" height="28" rx="9" transform="rotate(-4 738 182)" />
        <rect class="mapa-verde" x="802" y="300" width="44" height="28" rx="9" transform="rotate(-4 824 314)" />
        <rect class="mapa-verde" x="640" y="300" width="44" height="28" rx="9" transform="rotate(-4 662 314)" />
        <rect class="mapa-verde" x="836" y="60" width="44" height="28" rx="9" transform="rotate(-4 858 74)" />
        <rect class="mapa-verde" x="318" y="404" width="44" height="28" rx="9" transform="rotate(-4 340 418)" />
        <rect class="mapa-verde" x="506" y="430" width="44" height="28" rx="9" transform="rotate(-4 528 444)" />
        <rect class="mapa-verde" x="196" y="366" width="44" height="28" rx="9" transform="rotate(-4 218 380)" />

        <!-- pontos conhecidos de Belém e, por cima, a frota -->
    </g>
</template>
