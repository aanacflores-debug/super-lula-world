/* ============================================================================
 * SUPER LULA WORLD — dados do jogo (JOGO EDUCATIVO)
 *
 * ESTRUTURA NARRATIVA
 *  - INTRO: a história do Lula (do sertão à presidência).
 *  - No COMEÇO de cada mapa, um card no topo traz um trecho da história (era).
 *  - Os blocos '?' explicam as POLÍTICAS daquele mapa (você as conquista).
 *  - Ao fim do mapa: recap do que foi conquistado + o que melhorou no Brasil.
 *  - Chefão de cada fase = um grande PROBLEMA; no final, a ameaça estrangeira.
 *
 * Vilões = "políticos do atraso" (caricaturas genéricas). O chefão final é uma
 * caricatura satírica (estilo charge) da ameaça estrangeira à soberania.
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
    texto: "Atravesse o Brasil, conquiste as políticas que mudaram vidas e melhore as áreas do país. Vamos juntos!",
    art: "vamos" }
];

/* ------------------------------- SKINS DO LULA -------------------------- */
const HEROIS = [
  { id: "militante",  nome: "Lula Militante",  skin: "red",   trait: "aggro",
    desc: "Ímã de confusão: chama a atenção e os políticos correm atrás de você — tem que enfrentar! 🔥" },
  { id: "presidente", nome: "Lula Presidente", skin: "suit",  trait: "ileso",
    desc: "De terninho pra confundir os políticos: passa ileso, não toma dano no esbarrão. 🕴️" },
  { id: "povo",       nome: "Lula do Povo",    skin: "hat",   trait: "moeda",
    desc: "Raiz, de chapéu e camisa branca: ganha votos extras ao derrotar os políticos. 🎩" },
  { id: "fortao",     nome: "Lula Fortão",     skin: "forte", trait: "forte",
    desc: "Marombeiro de barba branca, bombadão: derruba político no soco, só de encostar! 💪" }
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
    { nome: "Soberania e Democracia", emoji: "🗳️",
      texto: "Defesa do Brasil, das instituições e do direito do povo de escolher seu futuro — contra a desinformação e a ingerência estrangeira.",
      sabia: "Democracia é o povo decidindo — e é preciso defendê-la todo dia." }
  ]
};

/* ------------------------------- CHEFÕES --------------------------------
 * 'kind' muda o desenho do chefão: 'blob' = criatura (problema),
 * 'tycoon' = caricatura satírica da ameaça estrangeira (estilo charge).  */
const CHEFES = {
  fome:         { nome: "A FOME",               emoji: "🍽️", cor: "#6b4a2a", hp: 3, kind: "blob" },
  desmonte:     { nome: "O DESMONTE",           emoji: "🏚️", cor: "#5a6472", hp: 3, kind: "blob" },
  desigualdade: { nome: "A DESIGUALDADE",       emoji: "⚖️", cor: "#7a5a86", hp: 4, kind: "blob" },
  democracia:   { nome: "O MAGNATA ESTRANGEIRO", emoji: "💵", cor: "#1b2a4a", hp: 4, kind: "tycoon" }
};

/* ------------------------------- LEGENDA DOS MAPAS ----------------------
 *  ' ' vazio   'G' chão   'B' bloco   '=' plataforma
 *  '?' bloco surpresa (conta uma política)   'o' voto
 *  'E' político do atraso   'X' chefão   'P' início
 *  As últimas colunas de cada fase são uma ARENA limpa para o chefão.
 * ----------------------------------------------------------------------- */
const LEVELS = [
  {
    nome: "Fase 1 — A Luta Contra a Fome",
    historiaInicio: "2003: Lula assume a presidência. O país ainda convive com a fome — e combatê-la vira a prioridade número um.",
    missao: "Atravesse o sertão, derrote A FOME e leve comida à mesa do povo.",
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
      " P                  E         E                X    ",
      "GGGGGGGGGG  GGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 2 — Saúde é Direito",
    historiaInicio: "Com o povo comendo melhor, o governo mira a saúde: SUS mais forte, remédio barato e médico onde nunca teve.",
    missao: "Enfrente O DESMONTE e reconstrua o atendimento de saúde para todos.",
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
      "         oo   oo     oo    oo     oo     oo     o         ",
      "        ====        ====         ====          ==         ",
      " P          E           E             E      E         X  ",
      "GGGGGGGGGGGGGG  GGGGGGGGGGG  GGGGGGGGGGGG  GGGGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 3 — Trabalho e Dignidade",
    historiaInicio: "A economia cresce e gera empregos. É hora de valorizar o salário mínimo e levar a casa própria às famílias.",
    missao: "Derrote A DESIGUALDADE e devolva o que é de direito a quem trabalha.",
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
      "    ?            ?      ?         ?         ?               ",
      "       oo       oo oo        oo       oo       oo           ",
      "      ====        ====      ====     ====     ====          ",
      " P         E          E          E        E              X  ",
      "GGGGGGGGGGGGG  GGGGGGGGGGG  GGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 4 — Democracia e Soberania",
    historiaInicio: "O Brasil ganha protagonismo no mundo — e precisa proteger sua democracia e soberania das ameaças que vêm de fora.",
    missao: "Entre a fake news e a cobiça estrangeira pelas nossas riquezas, derrote O MAGNATA ESTRANGEIRO e defenda a educação, a energia e a democracia do Brasil.",
    chefe: "democracia", cenario: "capital",
    corCeu1: "#8e4bd1", corCeu2: "#ead6ff", tutorial: false,
    fatos: [
      "Você está conquistando o PROUNI: bolsas de faculdade para quem não podia pagar.",
      "E novas universidades e institutos federais por todo o país.",
      "Você está conquistando o LUZ PARA TODOS: energia elétrica para quem não tinha.",
      "Luz em casa é estudo à noite e geladeira funcionando.",
      "Você defende a DEMOCRACIA e a SOBERANIA contra a fake news.",
      "O Brasil não está à venda: as nossas riquezas são do povo brasileiro."
    ],
    skills: ["🎓 Educação ↑", "💡 Energia ↑", "🛡️ Democracia e soberania ↑"],
    flyers: [[16,4],[30,3],[44,5],[52,4]],
    rows: [
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "                                                              ",
      "    ?           ?             ?      ?          ?             ",
      "        oo oo     oo    oo     oo     oo oo      oo           ",
      "      ====      ====        ====    ====      ====            ",
      " P        E         E            E          E       E       X ",
      "GGGGGGGGGGG  GGGGGGGGGGG  GGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGG"
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
