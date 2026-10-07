/* ============================================================================
 * SUPER LULA WORLD — dados do jogo (JOGO EDUCATIVO)
 * Objetivo: ensinar, de forma lúdica, políticas e conquistas do governo Lula.
 *
 * TOM: tributo positivo e didático.
 *  - Os VILÕES são "políticos do atraso": caricaturas GENÉRICAS (terno e
 *    gravata), não representam pessoas reais.
 *  - Os CHEFÕES são os grandes PROBLEMAS que o povo enfrentava
 *    (A Fome, O Desmonte, A Desigualdade, A Ameaça à Democracia).
 *  - Ao vencer o chefão, o jogador DESBLOQUEIA e APRENDE sobre as conquistas.
 * ==========================================================================*/

/* ------------------------------- HISTÓRIA (intro) ----------------------- */
const HISTORIA = [
  {
    titulo: "Um Brasil para reconstruir",
    texto: "Por anos, a fome voltou a crescer, direitos foram desmontados e muita gente ficou para trás. Este jogo conta, fase por fase, como o país começou a ser reconstruído.",
    art: "brasil"
  },
  {
    titulo: "Quem atrapalha o povo",
    texto: "No caminho estão os 'políticos do atraso' e os grandes problemas que eles alimentam: a fome, o desmonte dos serviços públicos, a desigualdade e as ameaças à democracia.",
    art: "forcas"
  },
  {
    titulo: "Cada vitória ensina uma conquista",
    texto: "Ao vencer o chefão de cada fase, você descobre uma política real que mudou vidas: Bolsa Família, Farmácia Popular, Minha Casa Minha Vida, Mais Médicos e muito mais.",
    art: "conquista"
  },
  {
    titulo: "Bora aprender jogando!",
    texto: "Escolha quem vai liderar a caminhada, siga pelo mapa do Brasil e reconstrua o país. Cada fase deixa uma lição. Vamos juntos! 🇧🇷",
    art: "vamos"
  }
];

/* ------------------------------- PERSONAGENS ---------------------------- */
const HEROIS = [
  { id: "lula", nome: "Lula",          desc: "Equilibrado — bom em tudo",  jump: 1.0,  speed: 1.0,  sprite: "lula" },
  { id: "prof", nome: "A Professora",  desc: "Pula mais alto",             jump: 1.12, speed: 0.97, sprite: "prof" },
  { id: "trab", nome: "O Trabalhador", desc: "Corre mais rápido",          jump: 1.0,  speed: 1.12, sprite: "trab" }
];

/* ------------------------------- CONQUISTAS (conteúdo educativo) -------- */
const CONQUISTAS = {
  fome: [
    { nome: "Fome Zero", emoji: "🌾",
      texto: "Conjunto de ações contra a fome lançado em 2003. Ajudou o Brasil a sair, em 2014, do Mapa da Fome da ONU.",
      sabia: "Você sabia? Em 2025 o Brasil voltou a sair do Mapa da Fome da ONU." },
    { nome: "Bolsa Família", emoji: "🧡",
      texto: "Programa de transferência de renda que apoia milhões de famílias e exige que as crianças estejam na escola e com vacinas em dia.",
      sabia: "Além de combater a pobreza, o dinheiro move o comércio das cidades pequenas." }
  ],
  desmonte: [
    { nome: "Farmácia Popular", emoji: "💊",
      texto: "Dá acesso a remédios de graça ou com grande desconto, em farmácias de todo o país. Foi retomado e ampliado.",
      sabia: "Atende tratamentos como pressão alta, diabetes e asma." },
    { nome: "Mais Médicos", emoji: "🩺",
      texto: "Leva médicos a cidades do interior e periferias que tinham dificuldade de atrair profissionais de saúde.",
      sabia: "Milhões de pessoas passaram a ter atendimento perto de casa." }
  ],
  desigualdade: [
    { nome: "Salário mínimo acima da inflação", emoji: "💪",
      texto: "Política de valorização do salário mínimo com ganho real — ou seja, acima da inflação.",
      sabia: "Como aposentadorias seguem o mínimo, milhões de idosos também ganham." },
    { nome: "Minha Casa, Minha Vida", emoji: "🏠",
      texto: "Programa habitacional que financia e constrói moradias para famílias conquistarem a casa própria.",
      sabia: "Reduz o aluguel pesando no orçamento e gera muitos empregos." },
    { nome: "Valorização do trabalho", emoji: "🗓️",
      texto: "Defesa de melhores condições e direitos para quem trabalha, como o debate sobre o fim da escala 6x1.",
      sabia: "Trabalho digno é descanso, saúde e tempo com a família." }
  ],
  democracia: [
    { nome: "ProUni e novas universidades", emoji: "🎓",
      texto: "Bolsas de estudo no ensino superior e a criação de novas universidades e institutos federais pelo país.",
      sabia: "Filhos de trabalhadores passaram a ser os primeiros da família na faculdade." },
    { nome: "Luz para Todos", emoji: "💡",
      texto: "Levou energia elétrica a milhões de pessoas no campo e em regiões isoladas do Brasil.",
      sabia: "Luz em casa significa estudo à noite, geladeira e mais dignidade." },
    { nome: "Proteção às famílias", emoji: "🛡️",
      texto: "Ações por direitos e segurança, como o pacote antifeminicídio e a proteção de crianças e adolescentes.",
      sabia: "Políticas públicas protegem quem mais precisa." },
    { nome: "Soberania e Democracia", emoji: "🇧🇷",
      texto: "Defesa do Brasil, das instituições e do direito do povo de escolher livremente seu futuro.",
      sabia: "Democracia é o povo decidindo — e é preciso defendê-la todo dia." }
  ]
};

/* ------------------------------- CHEFÕES -------------------------------- */
const CHEFES = {
  fome:         { nome: "A FOME",                emoji: "🍽️", cor: "#6b4a2a", hp: 3 },
  desmonte:     { nome: "O DESMONTE",            emoji: "🏚️", cor: "#5a6472", hp: 3 },
  desigualdade: { nome: "A DESIGUALDADE",        emoji: "⚖️", cor: "#7a5a86", hp: 4 },
  democracia:   { nome: "A AMEAÇA À DEMOCRACIA", emoji: "⚡", cor: "#8a2b2b", hp: 4 }
};

/* ------------------------------- LEGENDA DOS MAPAS ----------------------
 *  ' ' vazio   'G' chão   'B' bloco   '=' plataforma
 *  '?' bloco surpresa (solta voto, bater de baixo)   'o' voto (moeda)
 *  'E' político do atraso (inimigo)   'X' chefão   'P' início
 *  Espaços vazios na linha do chão (última linha) = BURACO (pule!).
 *  Regras de alcance: '?' ficam a <= 2 tiles de uma superfície; plataformas
 *  '=' ficam na linha 8 (alcançáveis do chão). Tudo é alcançável.
 * ----------------------------------------------------------------------- */
const LEVELS = [
  {
    nome: "Fase 1 — A Luta Contra a Fome",
    missao: "No sertão, muita gente passava fome. Pule os buracos, desvie dos políticos do atraso e derrote A FOME para garantir comida na mesa do povo.",
    chefe: "fome", cenario: "sertao",
    corCeu1: "#ff9a3d", corCeu2: "#ffe0a8", tutorial: true,
    fatos: [
      "O Lula nasceu em 1945, em Caetés, no sertão de Pernambuco.",
      "Criança ainda, migrou de pau-de-arara com a família para São Paulo, fugindo da seca.",
      "Pobre, foi engraxate e vendedor ambulante antes de virar torneiro mecânico.",
      "A fome que ele viu de perto virou prioridade: em 2003 nasceu o Fome Zero.",
      "Comer todo dia é um direito — o Bolsa Família ajuda milhões de famílias a garantir isso.",
      "Em 2014 o Brasil saiu do Mapa da Fome da ONU pela primeira vez."
    ],
    rows: [
      "                                                    ",
      "                                                    ",
      "                                                    ",
      "                                                    ",
      "                                                    ",
      "                                                    ",
      "        ?         ?            ?      ?             ",
      "          oo   oo     oo   oo       oo              ",
      "              ====        ====     =====            ",
      " P                  E         E          E     X    ",
      "GGGGGGGGGG  GGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 2 — Saúde é Direito",
    missao: "Sem remédio e sem médico, o povo adoecia. Vença O DESMONTE e reconstrua a saúde pública para todos.",
    chefe: "desmonte", cenario: "cidade",
    corCeu1: "#3d9bff", corCeu2: "#cfeaff", tutorial: false,
    fatos: [
      "Num acidente de trabalho, o jovem Lula perdeu um dedo da mão esquerda.",
      "Ele virou líder dos metalúrgicos do ABC e comandou grandes greves nos anos 1970.",
      "Ajudou a fundar a CUT e o Partido dos Trabalhadores (PT).",
      "Saúde é direito: o SUS atende todo mundo de graça.",
      "O Mais Médicos levou atendimento a cidades que não tinham nenhum médico.",
      "A Farmácia Popular dá remédios de graça ou com desconto em todo o país."
    ],
    rows: [
      "                                                          ",
      "                                                          ",
      "                                                          ",
      "                                                          ",
      "                                                          ",
      "                                                          ",
      "      ?         ?             ?             ?             ",
      "         oo   oo     oo    oo     oo     oo     oo        ",
      "        ====        ====         ====          ====       ",
      " P          E           E             E      E         X  ",
      "GGGGGGGGGGGGGG  GGGGGGGGGGG  GGGGGGGGGGGG  GGGGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 3 — Trabalho e Dignidade",
    missao: "Salário curto, aluguel caro e jornada sem fim. Derrote A DESIGUALDADE e devolva dignidade a quem trabalha.",
    chefe: "desigualdade", cenario: "campo",
    corCeu1: "#2fb15a", corCeu2: "#d6f6dd", tutorial: false,
    fatos: [
      "Lula concorreu à presidência em 1989, 1994 e 1998 antes de vencer.",
      "Em 2002 foi eleito presidente pela primeira vez, com mais de 52 milhões de votos.",
      "Valorizar o salário mínimo acima da inflação dá mais poder de compra ao povo.",
      "Como a aposentadoria segue o salário mínimo, milhões de idosos também ganham.",
      "O Minha Casa Minha Vida ajudou milhões de famílias a sair do aluguel.",
      "Trabalho digno também é ter tempo para descansar e viver com a família."
    ],
    rows: [
      "                                                            ",
      "                                                            ",
      "                                                            ",
      "                                                            ",
      "                                                            ",
      "                                                            ",
      "    ?            ?      ?         ?         ?         ?     ",
      "       oo       oo oo        oo       oo       oo  oo       ",
      "      ====        ====      ====     ====     ====          ",
      " P         E          E          E        E        E     X  ",
      "GGGGGGGGGGGGG  GGGGGGGGGGG  GGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 4 — Democracia e Futuro",
    missao: "A última batalha. Enfrente A AMEAÇA À DEMOCRACIA e garanta educação, energia e liberdade para o povo brasileiro.",
    chefe: "democracia", cenario: "capital",
    corCeu1: "#8e4bd1", corCeu2: "#ead6ff", tutorial: false,
    fatos: [
      "Educação muda o país: o ProUni deu bolsas para filhos de trabalhadores na faculdade.",
      "Foram criadas dezenas de novas universidades e institutos federais pelo Brasil.",
      "O Luz para Todos levou energia elétrica a quem nunca tinha tido.",
      "Energia em casa é estudo à noite, geladeira funcionando e mais dignidade.",
      "Defender a soberania é cuidar do que é do Brasil e do seu povo.",
      "Democracia é o povo decidindo seu futuro — e isso se defende todo dia."
    ],
    rows: [
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "    ?           ?             ?      ?          ?         ?   ",
      "        oo oo     oo    oo     oo     oo oo      oo   oo      ",
      "      ====      ====        ====    ====      ====      ====  ",
      " P        E         E            E          E       E       X ",
      "GGGGGGGGGGG  GGGGGGGGGGG  GGGGGGGGGGGGGGG  GGGGGGGGGGG  GGGGGG"
    ]
  }
];

/* -------- Mapa do Brasil: posição de cada fase por região (0..1) -------- */
/* Fase 1 Nordeste (sertão) · Fase 2 Sudeste · Fase 3 Sul · Fase 4 Centro(Brasília) */
const MAPA_NOS = [
  { x: 0.68, y: 0.27 },   // Fase 1 — Nordeste (sertão)
  { x: 0.60, y: 0.56 },   // Fase 2 — Sudeste
  { x: 0.49, y: 0.70 },   // Fase 3 — Sul
  { x: 0.52, y: 0.47 }    // Fase 4 — Centro (Brasília)
];

window.SLW_DATA = { HISTORIA, HEROIS, CONQUISTAS, CHEFES, LEVELS, MAPA_NOS };
