/* ============================================================================
 * SUPER LULA WORLD — dados do jogo (JOGO EDUCATIVO)
 *
 * NARRATIVA
 *  - INTRO: a história do Lula (do sertão à presidência).
 *  - Card de história no topo ao iniciar cada mapa (linha do tempo).
 *  - Blocos '?' explicam as POLÍTICAS daquele mapa (você as conquista).
 *  - Mapas 1–3: conquistas históricas que mudaram o país.
 *  - Mapa 4: o 2º TURNO das eleições — propostas atuais (fim da escala 6x1),
 *    proteção do dinheiro do povo (ação contra a fraude do Banco Master) e a
 *    defesa da soberania e da democracia contra a ameaça estrangeira.
 *  - Painel do Brasil (no mapa): indicadores reais que melhoram a cada fase.
 *
 * Vilões = "políticos do atraso" (caricaturas genéricas). Chefão final = sátira
 * política (estilo charge) da ameaça estrangeira à soberania. Conteúdo factual;
 * sem repetir acusações não provadas contra pessoas específicas.
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
    texto: "Eleito em 2002, tirou o Brasil do Mapa da Fome e, de volta em 2023, voltou a reconstruir o país.",
    art: "presidente" },
  { titulo: "Sua missão",
    texto: "Atravesse o Brasil, conquiste as políticas que mudaram vidas e, no 2º turno, defenda a democracia. Vamos juntos!",
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
      sabia: "Milhões passaram a ter atendimento perto de casa." },
    { nome: "Luz para Todos", emoji: "💡",
      texto: "Levou energia elétrica a milhões de pessoas no campo e em regiões isoladas do Brasil.",
      sabia: "Luz em casa é estudo à noite, geladeira e dignidade." }
  ],
  desigualdade: [
    { nome: "Salário mínimo acima da inflação", emoji: "💪",
      texto: "Valorização do mínimo com ganho real — acima da inflação.",
      sabia: "Como a aposentadoria segue o mínimo, os idosos também ganham." },
    { nome: "Minha Casa, Minha Vida", emoji: "🏠",
      texto: "Financia e constrói moradias para famílias conquistarem a casa própria.",
      sabia: "Reduz o aluguel pesando no orçamento e gera muitos empregos." },
    { nome: "ProUni e novas universidades", emoji: "🎓",
      texto: "Bolsas no ensino superior e a criação de universidades e institutos federais pelo país.",
      sabia: "Filhos de trabalhadores viraram os primeiros da família na faculdade." }
  ],
  democracia: [
    { nome: "Fim da escala 6x1", emoji: "🗓️",
      texto: "Proposta para acabar com a escala 6x1: mais descanso e menos adoecimento. Aprovada na Câmara, segue no Senado.",
      sabia: "O texto reduz a jornada para 40h semanais e muda para 5x2." },
    { nome: "O Brasil não se vende", emoji: "🛡️",
      texto: "Nossas riquezas — minérios, terras raras, o Pix — são do povo brasileiro, não de interesses estrangeiros.",
      sabia: "Defender a soberania é não entregar o que é nosso." },
    { nome: "Dinheiro do povo protegido", emoji: "🏦",
      texto: "O Banco Central liquidou a fraude bilionária do Banco Master (2025), protegendo poupadores e o sistema financeiro.",
      sabia: "Fiscalização forte evita que golpes financeiros atinjam as famílias." },
    { nome: "Democracia defendida", emoji: "🗳️",
      texto: "Defesa das instituições e do direito do povo de escolher seu futuro — contra a fake news e a ingerência estrangeira.",
      sabia: "Democracia é o povo decidindo — e é preciso defendê-la todo dia." }
  ]
};

/* ------------------------------- CHEFÕES -------------------------------- */
const CHEFES = {
  fome:         { nome: "A FOME",               emoji: "🍽️", cor: "#6b4a2a", hp: 3, kind: "blob" },
  desmonte:     { nome: "O DESMONTE",           emoji: "🏚️", cor: "#5a6472", hp: 3, kind: "blob" },
  desigualdade: { nome: "A DESIGUALDADE",       emoji: "⚖️", cor: "#7a5a86", hp: 4, kind: "blob" },
  democracia:   { nome: "O MAGNATA ESTRANGEIRO", emoji: "💵", cor: "#1b2a4a", hp: 5, kind: "tycoon" }
};

/* ------------------------------- PAINEL DO BRASIL ----------------------
 * Indicadores reais (antes → agora). Cada um "melhora" quando o mapa com
 * índice 'mapa' é concluído.  Fontes citadas no próprio painel.           */
const PAINEL = [
  { icon: "🍽️", nome: "Fome grave", antes: "33,1 mi", depois: "8,7 mi",
    fonte: "pessoas · IBGE/Penssan 2022→2023", mapa: 0 },
  { icon: "🗺️", nome: "Mapa da Fome (ONU)", antes: "Dentro", depois: "Fora",
    fonte: "ONU/FAO · 2025", mapa: 0 },
  { icon: "🩺", nome: "Saúde pública", antes: "Desmontada", depois: "Reconstruída",
    fonte: "Mais Médicos + Farmácia Popular", mapa: 1 },
  { icon: "💼", nome: "Desemprego", antes: "6,6%", depois: "5,1%",
    fonte: "IBGE/PNAD 2024→2025 · recorde", mapa: 2 },
  { icon: "🗳️", nome: "Democracia e soberania", antes: "Sob ameaça", depois: "Defendidas",
    fonte: "2º turno · o povo decide", mapa: 3 }
];

/* ------------------------------- FASES ---------------------------------- */
const LEVELS = [
  {
    nome: "Fase 1 — A Luta Contra a Fome",
    historiaInicio: "2003: Lula assume a presidência. O país ainda convive com a fome — e combatê-la vira a prioridade número um.",
    missao: "Atravesse o sertão, derrote A FOME e leve comida à mesa do povo.",
    chefe: "fome", cenario: "sertao",
    corCeu1: "#ff9a3d", corCeu2: "#ffe0a8", tutorial: true,
    fatos: [
      "Você está conquistando o FOME ZERO: um conjunto de ações para acabar com a fome no Brasil.",
      "Com ele, o Brasil saiu do Mapa da Fome da ONU em 2014 — e de novo em 2025.",
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
    nome: "Fase 2 — Saúde e Serviços para o Povo",
    historiaInicio: "Com o povo comendo melhor, o governo mira a saúde e os serviços: médico, remédio e energia onde nunca teve.",
    missao: "Enfrente O DESMONTE e reconstrua a saúde e os serviços públicos para todos.",
    chefe: "desmonte", cenario: "cidade",
    corCeu1: "#3d9bff", corCeu2: "#cfeaff", tutorial: false,
    fatos: [
      "Você está conquistando a FARMÁCIA POPULAR: remédios de graça ou baratos.",
      "Você está conquistando o MAIS MÉDICOS: atendimento onde faltava médico.",
      "Milhões de pessoas passaram a ter um médico perto de casa.",
      "Você está conquistando o LUZ PARA TODOS: energia elétrica para quem não tinha."
    ],
    skills: ["🩺 Saúde pública ↑↑", "💊 Acesso a remédios ↑", "💡 Energia no campo ↑"],
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
    nome: "Fase 3 — Trabalho, Moradia e Futuro",
    historiaInicio: "A economia cresce e o desemprego cai. É hora de valorizar o salário, dar a casa própria e abrir as portas da universidade.",
    missao: "Derrote A DESIGUALDADE e devolva renda, moradia e estudo a quem trabalha.",
    chefe: "desigualdade", cenario: "campo",
    corCeu1: "#2fb15a", corCeu2: "#d6f6dd", tutorial: false,
    fatos: [
      "Você está conquistando o SALÁRIO MÍNIMO acima da inflação: mais poder de compra.",
      "Como a aposentadoria segue o mínimo, os idosos também ganham.",
      "Você está conquistando o MINHA CASA MINHA VIDA: a casa própria.",
      "Você está conquistando o PROUNI: bolsas de faculdade para quem não podia pagar.",
      "E novas universidades e institutos federais por todo o país.",
      "O desemprego caiu ao menor nível da série histórica em 2025."
    ],
    skills: ["💪 Renda e salário ↑", "🏠 Moradia ↑", "🎓 Educação ↑"],
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
    nome: "Fase 4 — O 2º Turno: Democracia e Soberania",
    historiaInicio: "2º turno das eleições: a decisão. O Brasil escolhe entre avançar com direitos ou entregar nossas riquezas. Cada voto conta!",
    missao: "No 2º turno, enfrente O MAGNATA ESTRANGEIRO e as fake news. Garanta o fim da escala 6x1, proteja o dinheiro do povo e defenda a democracia.",
    chefe: "democracia", cenario: "capital",
    corCeu1: "#8e4bd1", corCeu2: "#ead6ff", tutorial: false,
    fatos: [
      "Você está conquistando o FIM DA ESCALA 6x1: mais descanso e menos adoecimento.",
      "A PEC foi aprovada na Câmara e luta por votação no Senado.",
      "Você protege o DINHEIRO DO POVO: o Banco Central liquidou a fraude do Banco Master.",
      "O BRASIL NÃO SE VENDE: minérios, terras raras e o Pix são do povo.",
      "Contra a fake news e a ingerência estrangeira: informação de verdade.",
      "No 2º turno, quem decide o futuro do Brasil é você."
    ],
    skills: ["🗓️ Fim da escala 6x1 ↑", "🏦 Dinheiro do povo protegido ↑", "🛡️ Democracia e soberania ↑"],
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

window.SLW_DATA = { HISTORIA, HEROIS, CONQUISTAS, CHEFES, LEVELS, MAPA_NOS, PAINEL };
