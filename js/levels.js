/* ============================================================================
 * SUPER LULA WORLD — dados do jogo (JOGO EDUCATIVO)
 * Objetivo: ensinar, de forma lúdica, políticas e conquistas do governo Lula.
 *
 * ESTRUTURA NARRATIVA
 *  - INTRO: a história do Lula (do sertão à presidência).
 *  - Cada MAPA tem um tema/era e um CHEFÃO (um grande problema do país).
 *  - Os blocos '?' explicam, durante a fase, as POLÍTICAS daquele mapa
 *    (você vai "conquistando" cada uma).
 *  - Ao fim do mapa: recap do que foi conquistado + o que melhorou no Brasil.
 *
 * TOM: tributo positivo e didático. Vilões = "políticos do atraso"
 * (caricaturas genéricas) e, no fim, a desinformação/fake news e a ameaça
 * à soberania — nunca pessoas reais específicas.
 * ==========================================================================*/

/* ------------------------------- HISTÓRIA (intro) ----------------------- */
const HISTORIA = [
  { titulo: "O Brasil que precisava mudar",
    texto: "Fome, desigualdade e direitos ameaçados. Esta é a história de como o povo começou a virar esse jogo.",
    art: "brasil" },
  { titulo: "Um menino do sertão",
    texto: "Lula nasceu em 1945, em Caetés (PE). Criança ainda, migrou de pau-de-arara para São Paulo, fugindo da seca.",
    art: "crianca" },
  { titulo: "O trabalhador",
    texto: "Foi engraxate e vendedor ambulante. Virou torneiro mecânico — e perdeu um dedo num acidente de trabalho.",
    art: "trabalho" },
  { titulo: "A voz do povo",
    texto: "Líder dos metalúrgicos do ABC, comandou grandes greves e ajudou a fundar a CUT e o Partido dos Trabalhadores.",
    art: "sindicato" },
  { titulo: "O presidente",
    texto: "Depois de concorrer três vezes, foi eleito presidente em 2002 e começou a reconstruir o país.",
    art: "presidente" },
  { titulo: "Sua missão",
    texto: "Atravesse o Brasil, conquiste as políticas que mudaram vidas e melhore as áreas do país. Vamos juntos! 🇧🇷",
    art: "vamos" }
];

/* ------------------------------- SKINS DO LULA -------------------------- */
/* Só o Lula, em três visuais. Mesma jogabilidade (cosmético). */
const HEROIS = [
  { id: "militante",  nome: "Lula Militante",  desc: "Camiseta e boné vermelhos", jump: 1.0, speed: 1.0, skin: "red" },
  { id: "presidente", nome: "Lula Presidente", desc: "Terno cinza",               jump: 1.0, speed: 1.0, skin: "suit" },
  { id: "povo",       nome: "Lula do Povo",    desc: "Camisa branca e chapéu",    jump: 1.0, speed: 1.0, skin: "hat" }
];

/* ------------------------------- CONQUISTAS (conteúdo educativo) -------- */
const CONQUISTAS = {
  fome: [
    { nome: "Fome Zero", emoji: "🌾",
      texto: "Conjunto de ações contra a fome lançado em 2003. Ajudou o Brasil a sair, em 2014, do Mapa da Fome da ONU.",
      sabia: "Você sabia? Em 2025 o Brasil voltou a sair do Mapa da Fome da ONU." },
    { nome: "Bolsa Família", emoji: "🧡",
      texto: "Transferência de renda que apoia milhões de famílias e exige crianças na escola e vacinas em dia.",
      sabia: "O dinheiro também move o comércio das cidades pequenas." }
  ],
  desmonte: [
    { nome: "Farmácia Popular", emoji: "💊",
      texto: "Acesso a remédios de graça ou com grande desconto, em farmácias de todo o país.",
      sabia: "Atende tratamentos como pressão alta, diabetes e asma." },
    { nome: "Mais Médicos", emoji: "🩺",
      texto: "Leva médicos a cidades do interior e periferias que não conseguiam atrair profissionais.",
      sabia: "Milhões passaram a ter atendimento perto de casa." }
  ],
  desigualdade: [
    { nome: "Salário mínimo acima da inflação", emoji: "💪",
      texto: "Valorização do mínimo com ganho real — acima da inflação.",
      sabia: "Como a aposentadoria segue o mínimo, os idosos também ganham." },
    { nome: "Minha Casa, Minha Vida", emoji: "🏠",
      texto: "Financia e constrói moradias para famílias conquistarem a casa própria.",
      sabia: "Reduz o aluguel pesando no orçamento e gera muitos empregos." },
    { nome: "Valorização do trabalho", emoji: "🗓️",
      texto: "Defesa de direitos e melhores condições, como o debate sobre o fim da escala 6x1.",
      sabia: "Trabalho digno é descanso, saúde e tempo com a família." }
  ],
  democracia: [
    { nome: "ProUni e novas universidades", emoji: "🎓",
      texto: "Bolsas no ensino superior e a criação de universidades e institutos federais pelo país.",
      sabia: "Filhos de trabalhadores viraram os primeiros da família na faculdade." },
    { nome: "Luz para Todos", emoji: "💡",
      texto: "Levou energia elétrica a milhões de pessoas no campo e em regiões isoladas.",
      sabia: "Luz em casa é estudo à noite, geladeira e dignidade." },
    { nome: "Soberania e Democracia", emoji: "🇧🇷",
      texto: "Defesa do Brasil, das instituições e do direito do povo de escolher seu futuro — contra a desinformação e a ingerência estrangeira.",
      sabia: "Democracia é o povo decidindo — e é preciso defendê-la todo dia." }
  ]
};

/* ------------------------------- CHEFÕES -------------------------------- */
const CHEFES = {
  fome:         { nome: "A FOME",                emoji: "🍽️", cor: "#6b4a2a", hp: 3 },
  desmonte:     { nome: "O DESMONTE",            emoji: "🏚️", cor: "#5a6472", hp: 3 },
  desigualdade: { nome: "A DESIGUALDADE",        emoji: "⚖️", cor: "#7a5a86", hp: 4 },
  democracia:   { nome: "A AMEAÇA À DEMOCRACIA", emoji: "📢", cor: "#8a2b2b", hp: 4 }
};

/* ------------------------------- LEGENDA DOS MAPAS ----------------------
 *  ' ' vazio   'G' chão   'B' bloco   '=' plataforma
 *  '?' bloco surpresa (conta uma política)   'o' voto
 *  'E' político do atraso   'X' chefão   'P' início
 *  Espaços na linha do chão = BURACO.   flyers = inimigos "fake news" (voam).
 * ----------------------------------------------------------------------- */
const LEVELS = [
  {
    nome: "Fase 1 — A Luta Contra a Fome",
    missao: "2003. O país recomeça pelo mais urgente: ninguém pode passar fome. Atravesse o sertão, derrote A FOME e leve comida à mesa do povo.",
    chefe: "fome", cenario: "sertao",
    corCeu1: "#ff9a3d", corCeu2: "#ffe0a8", tutorial: true,
    fatos: [
      "Você está conquistando o FOME ZERO: um conjunto de ações para acabar com a fome no Brasil.",
      "Com ele, o Brasil saiu do Mapa da Fome da ONU em 2014.",
      "Você está conquistando o BOLSA FAMÍLIA: renda para milhões de famílias.",
      "Para receber, as crianças precisam estar na escola e com as vacinas em dia."
    ],
    skills: ["🍽️ Combate à fome ↑↑", "🧡 Renda das famílias ↑"],
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
    missao: "Com o povo alimentado, é hora de cuidar da saúde. Enfrente O DESMONTE e reconstrua o atendimento para todos.",
    chefe: "desmonte", cenario: "cidade",
    corCeu1: "#3d9bff", corCeu2: "#cfeaff", tutorial: false,
    fatos: [
      "Você está conquistando a FARMÁCIA POPULAR: remédios de graça ou baratos.",
      "Ela atende tratamentos como pressão alta, diabetes e asma.",
      "Você está conquistando o MAIS MÉDICOS: atendimento onde faltava médico.",
      "Milhões de pessoas passaram a ter um médico perto de casa."
    ],
    skills: ["🩺 Saúde pública ↑↑", "💊 Acesso a remédios ↑"],
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
    missao: "Agora, trabalho e moradia para viver com dignidade. Derrote A DESIGUALDADE e devolva o que é de direito a quem trabalha.",
    chefe: "desigualdade", cenario: "campo",
    corCeu1: "#2fb15a", corCeu2: "#d6f6dd", tutorial: false,
    fatos: [
      "Você está conquistando o SALÁRIO MÍNIMO acima da inflação: mais poder de compra.",
      "Como a aposentadoria segue o mínimo, os idosos também ganham.",
      "Você está conquistando o MINHA CASA MINHA VIDA: a casa própria.",
      "Menos aluguel pesando no bolso e muitos empregos gerados.",
      "Você está conquistando a VALORIZAÇÃO DO TRABALHO: direitos e descanso.",
      "Trabalho digno é ter tempo para a família."
    ],
    skills: ["💪 Renda e salário ↑", "🏠 Moradia ↑", "🗓️ Direitos do trabalho ↑"],
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
    missao: "A última batalha. Entre a FAKE NEWS, os canais que desinformam e a ingerência estrangeira, defenda a educação, a energia e a DEMOCRACIA do Brasil.",
    chefe: "democracia", cenario: "capital",
    corCeu1: "#8e4bd1", corCeu2: "#ead6ff", tutorial: false,
    fatos: [
      "Você está conquistando o PROUNI: bolsas de faculdade para quem não podia pagar.",
      "E novas universidades e institutos federais por todo o país.",
      "Você está conquistando o LUZ PARA TODOS: energia elétrica para quem não tinha.",
      "Luz em casa é estudo à noite e geladeira funcionando.",
      "Você defende a DEMOCRACIA e a SOBERANIA contra a fake news.",
      "Informação de verdade e independência: o Brasil decide o seu futuro."
    ],
    skills: ["🎓 Educação ↑", "💡 Energia ↑", "🛡️ Democracia e soberania ↑"],
    flyers: [[16,4],[30,3],[44,5],[53,4]],   // inimigos "fake news" (voam)
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

/* -------- Mapa do Brasil: fases por longitude/latitude reais ------------ */
const MAPA_NOS = [
  { lon: -40.3, lat:  -8.5 },   // Fase 1 — Nordeste (sertão, PE/BA)
  { lon: -46.6, lat: -22.5 },   // Fase 2 — Sudeste (São Paulo)
  { lon: -51.2, lat: -29.8 },   // Fase 3 — Sul (RS)
  { lon: -47.9, lat: -15.8 }    // Fase 4 — Centro (Brasília)
];

window.SLW_DATA = { HISTORIA, HEROIS, CONQUISTAS, CHEFES, LEVELS, MAPA_NOS };
