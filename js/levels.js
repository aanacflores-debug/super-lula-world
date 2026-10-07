/* ============================================================================
 * SUPER LULA WORLD — dados do jogo
 * História, personagens, fases, chefões e conquistas ("bons feitos").
 *
 * TOM: tributo positivo e DIDÁTICO. Os vilões são FORÇAS DO ATRASO
 * personificadas (A Fome, O Desmonte, A Desigualdade, A Ameaça à Democracia) —
 * não representam pessoas reais. As conquistas são desbloqueadas ao derrotar
 * o chefão de cada fase.
 * ==========================================================================*/

/* ------------------------------- HISTÓRIA (intro) ----------------------- */
const HISTORIA = [
  {
    titulo: "O Brasil precisa voltar a sorrir",
    texto: "Durante anos, o país viu a fome crescer, direitos sumirem e a esperança balançar. Mas o povo não desistiu.",
    art: "brasil"
  },
  {
    titulo: "A missão",
    texto: "Atravesse o Brasil enfrentando as forças do atraso — A Fome, O Desmonte, A Desigualdade e a Ameaça à Democracia.",
    art: "forcas"
  },
  {
    titulo: "Cada vitória, um direito de volta",
    texto: "Ao derrotar o chefão de cada fase, você devolve ao povo uma grande conquista: Bolsa Família, Farmácia Popular, Minha Casa Minha Vida e muito mais.",
    art: "conquista"
  },
  {
    titulo: "Agora é com você!",
    texto: "Escolha quem vai liderar essa caminhada, suba no mapa do Brasil e reconstrua o país, fase por fase. Vamos juntos! 🇧🇷",
    art: "vamos"
  }
];

/* ------------------------------- PERSONAGENS ---------------------------- */
/* jump/speed são multiplicadores; 'sprite' escolhe o desenho. */
const HEROIS = [
  { id: "lula", nome: "Lula",            desc: "Equilibrado — bom em tudo",       jump: 1.0,  speed: 1.0,  sprite: "lula" },
  { id: "prof", nome: "A Professora",    desc: "Pula mais alto",                  jump: 1.1,  speed: 0.95, sprite: "prof" },
  { id: "trab", nome: "O Trabalhador",   desc: "Corre mais rápido",               jump: 0.97, speed: 1.12, sprite: "trab" }
];

/* ------------------------------- CONQUISTAS ----------------------------- */
/* Agrupadas por fase: são o prêmio por derrotar o chefão. */
const CONQUISTAS = {
  fome: [
    { nome: "Fome Zero", emoji: "🌾", texto: "Programa de combate à fome que tirou o Brasil do Mapa da Fome da ONU." },
    { nome: "Bolsa Família", emoji: "🧡", texto: "Transferência de renda que ampara milhões de famílias e move a economia local." }
  ],
  desmonte: [
    { nome: "Farmácia Popular", emoji: "💊", texto: "Remédios de graça ou a preço baixo — programa retomado e ampliado." },
    { nome: "Mais Médicos", emoji: "🩺", texto: "Atendimento médico no interior e nas periferias que não tinham médicos." }
  ],
  desigualdade: [
    { nome: "Salário mínimo acima da inflação", emoji: "💪", texto: "Reajuste com ganho real, que também aumenta as aposentadorias." },
    { nome: "Minha Casa, Minha Vida", emoji: "🏠", texto: "Programa habitacional que ajuda famílias a conquistar a casa própria." },
    { nome: "Apoio ao fim da escala 6x1", emoji: "🗓️", texto: "Apoio a uma pauta de alto consenso por melhores condições de trabalho." }
  ],
  democracia: [
    { nome: "ProUni e novas universidades", emoji: "🎓", texto: "Bolsas no ensino superior e expansão de universidades e institutos federais." },
    { nome: "Luz para Todos", emoji: "💡", texto: "Levou energia elétrica a milhões de pessoas no campo e em regiões isoladas." },
    { nome: "Proteção às famílias", emoji: "🛡️", texto: "Atuação por pautas como o pacote antifeminicídio e a proteção da infância." },
    { nome: "Soberania e Democracia", emoji: "🇧🇷", texto: "Defesa do Brasil, das instituições e do direito do povo de escolher seu futuro." }
  ]
};

/* ------------------------------- CHEFÕES -------------------------------- */
const CHEFES = {
  fome:         { nome: "A FOME",                 emoji: "🍽️", cor: "#6b4a2a", hp: 3 },
  desmonte:     { nome: "O DESMONTE",             emoji: "🏚️", cor: "#5a6472", hp: 3 },
  desigualdade: { nome: "A DESIGUALDADE",         emoji: "⚖️", cor: "#7a5a86", hp: 4 },
  democracia:   { nome: "A AMEAÇA À DEMOCRACIA",  emoji: "⚡", cor: "#8a2b2b", hp: 4 }
};

/* ------------------------------- LEGENDA DOS MAPAS ----------------------
 *  ' ' vazio      'G' chão       'B' bloco      '=' plataforma
 *  '?' bloco surpresa (solta voto)             'o' voto (moeda)
 *  'w' poça de desinformação (perigo)          'E' vilão (força do atraso)
 *  'X' chefão      'P' início
 *  11 linhas por fase; larguras são normalizadas pelo motor.
 * ----------------------------------------------------------------------- */
const LEVELS = [
  {
    nome: "Fase 1 — A Luta Contra a Fome",
    missao: "O povo tem fome. Atravesse o sertão e derrote A FOME para devolver comida à mesa.",
    chefe: "fome",
    cenario: "sertao",
    corCeu1: "#ff9a3d", corCeu2: "#ffe0a8",
    tutorial: true,
    rows: [
      "                                                            ",
      "                                                            ",
      "                     o                                      ",
      "            o o     ===         o o                         ",
      "     o     =====          ?           o o                   ",
      "    ===           o o           ===          o              ",
      "            E            E              E   ===             ",
      "       ===       ===           ===                          ",
      "  o o                                              X        ",
      " ===      w       w         w          w                    ",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 2 — Saúde é Direito",
    missao: "Sem remédio e sem médico, o povo adoece. Vença O DESMONTE e reconstrua a saúde pública.",
    chefe: "desmonte",
    cenario: "cidade",
    corCeu1: "#3d9bff", corCeu2: "#cfeaff",
    tutorial: false,
    rows: [
      "                                                            ",
      "              o o                      o o                  ",
      "        ?    =====        o o         =====        ?        ",
      "                         ===                                ",
      "   o o            E              o o           E            ",
      "  =====     ===          ===    ===       ===               ",
      "         w          E                  w             E      ",
      "              ===          o o                ===           ",
      "  o                 B B           w                  X      ",
      " ===     w      GGGGGGG     w        GGGG      w             ",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 3 — Trabalho e Dignidade",
    missao: "Salário curto, aluguel caro, jornada sem fim. Derrote A DESIGUALDADE e traga dignidade de volta.",
    chefe: "desigualdade",
    cenario: "campo",
    corCeu1: "#2fb15a", corCeu2: "#d6f6dd",
    tutorial: false,
    rows: [
      "                                                                  ",
      "         o o                   o                 o o              ",
      "   ?    =====     o o         ===        ?      =====             ",
      "                 =====                                            ",
      "  o o       E            E           o o              E           ",
      " =====  ===       ===          ===  =====     ===                 ",
      "     w         E         w                 E          w           ",
      "         ===        B B        ===               ===             ",
      " o o                      w            o o                 X      ",
      "===   w     GGGGG    w        GGGGGG       w     GGGG              ",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 4 — Democracia e Futuro",
    missao: "A última batalha. Enfrente A AMEAÇA À DEMOCRACIA e garanta educação, energia e liberdade para o povo.",
    chefe: "democracia",
    cenario: "capital",
    corCeu1: "#8e4bd1", corCeu2: "#ead6ff",
    tutorial: false,
    rows: [
      "                                                                  ",
      "      o o        o o                  o o          o o            ",
      "  ?  =====   ?  =====      o o       =====    ?   =====           ",
      "                         =====                                    ",
      " o o      E        E             o o        E         E           ",
      "=====  ===     ===       ===    =====   ===     ===               ",
      "    w       E       w                E        w         E         ",
      "       ===       B B B       ===            ===               w   ",
      " o o                   w          o o                  B B    X   ",
      "===  w    GGGGG   w        GGGGG      w    GGGGG    w      GGGGGG   ",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ]
  }
];

/* -------- Mapa do Brasil: posição relativa de cada nó de fase (0..1) ---- */
const MAPA_NOS = [
  { x: 0.20, y: 0.68 },
  { x: 0.42, y: 0.52 },
  { x: 0.60, y: 0.70 },
  { x: 0.80, y: 0.40 }
];

window.SLW_DATA = { HISTORIA, HEROIS, CONQUISTAS, CHEFES, LEVELS, MAPA_NOS };
