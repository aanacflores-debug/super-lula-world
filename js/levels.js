/* ============================================================================
 * SUPER LULA WORLD — dados das fases e dos "bons feitos" (realizações)
 * ----------------------------------------------------------------------------
 * Cada realização (star 'S' no mapa) é uma política pública / programa.
 * As descrições são curtas e factuais. Tom: celebrativo, positivo.
 * ==========================================================================*/

/* Lista de realizações — aparecem na ordem em que são coletadas.
 * Os 'S' de cada fase consomem esta lista em sequência. */
const BONS_FEITOS = [
  {
    nome: "Bolsa Família",
    emoji: "🧡",
    texto: "Programa de transferência de renda que apoia milhões de famílias em situação de vulnerabilidade."
  },
  {
    nome: "Farmácia Popular",
    emoji: "💊",
    texto: "Acesso a remédios a preço reduzido ou de graça — programa retomado e ampliado."
  },
  {
    nome: "Salário mínimo acima da inflação",
    emoji: "💪",
    texto: "Reajuste do mínimo com ganho real, impactando positivamente também as aposentadorias."
  },
  {
    nome: "Mais Médicos",
    emoji: "🩺",
    texto: "Leva atendimento médico a cidades do interior e periferias que tinham dificuldade de atrair profissionais."
  },
  {
    nome: "Minha Casa, Minha Vida",
    emoji: "🏠",
    texto: "Programa habitacional que ajuda famílias a conquistarem a casa própria."
  },
  {
    nome: "Proteção às famílias",
    emoji: "🛡️",
    texto: "Atuação em pautas como o pacote antifeminicídio e a proteção de crianças e adolescentes."
  },
  {
    nome: "Regulação das bets",
    emoji: "🎯",
    texto: "Medidas para conter o avanço das apostas e proteger o bolso das famílias."
  },
  {
    nome: "Brasil fora do Mapa da Fome",
    emoji: "🌾",
    texto: "Políticas de combate à fome que tiraram o Brasil do Mapa da Fome da ONU."
  },
  {
    nome: "ProUni e novas universidades",
    emoji: "🎓",
    texto: "Bolsas no ensino superior e expansão de universidades e institutos federais pelo país."
  },
  {
    nome: "Luz para Todos",
    emoji: "💡",
    texto: "Levou energia elétrica a milhões de pessoas no campo e em regiões isoladas."
  },
  {
    nome: "Apoio ao fim da escala 6x1",
    emoji: "🗓️",
    texto: "Apoio a uma pauta de alto consenso popular por melhores condições de trabalho."
  },
  {
    nome: "Soberania do Brasil",
    emoji: "🇧🇷",
    texto: "Defesa dos interesses nacionais e do que é nosso nas relações internacionais."
  }
];

/* ----------------------------------------------------------------------------
 * LEGENDA DOS MAPAS
 *   ' ' vazio            'G' chão (grama/terra)     'B' bloco de tijolo
 *   '=' plataforma        '?' bloco surpresa (solta voto)
 *   'o' voto (moeda)      'S' bom feito (estrela)   'E' perrengue (inimigo)
 *   '^' espinho (perigo)  'P' início do Lula        'F' bandeira (fim)
 * Todas as linhas de uma fase têm o MESMO comprimento. 11 linhas por fase.
 * ==========================================================================*/

const LEVELS = [
  {
    nome: "Fase 1 — A Caminhada da Esperança",
    corCeu1: "#4aa3ff",
    corCeu2: "#b8e2ff",
    rows: [
      "                                                                                            ",
      "                                                                                            ",
      "                   o o o                        S                                           ",
      "                  =======              ? ? ?                        o o o                   ",
      "          S                                              =====                              ",
      "              ===            o o                                        ? ?                 ",
      "      o o                   =====      E        o o o           E                  o   S     ",
      "     ====          E              ===========                          ===      =======     ",
      "              ^^        BB                            ^^^           E                      F",
      "P          GG   GGGGG  GGGGGGG   GGGGGGGGGGG   GGGGG      GGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGG",
      "GGGGGGGGGGGGG   GGGGG  GGGGGGG   GGGGGGGGGGG   GGGGG      GGGGGGGGGGGGGGGGGGGG   GGGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 2 — Brasil que Cuida da Gente",
    corCeu1: "#2e8b57",
    corCeu2: "#bff0c8",
    rows: [
      "                                                                                                      ",
      "                 S                                        o o o                                       ",
      "            ? ? ? ?            o o o                      ========              S                      ",
      "                             ========         E                         =====                         ",
      "    o o o                                 S           ? ?                           o o o              ",
      "   =======         E              o o            ====        E     o o                      E         ",
      "              ^^          S      ====      BBB            ===========            ====                  ",
      "        E            ===========                  ^^^                    E                    ^^      F",
      "    BB        GGGG              GGGGGGG   GGGGG          GGGGGGG   GGGGGGGGGGGGG   GGGGGG   GGGGGGGGGGGG",
      "P  GGGG   GGGGGGGG   ^^^^   GGGGGGGGGGG   GGGGG   GGGG   GGGGGGG   GGGGGGGGGGGGG   GGGGGG   GGGGGGGGGGGG",
      "GGGGGGGG   GGGGGGG   GGGG   GGGGGGGGGGG   GGGGG   GGGG   GGGGGGG   GGGGGGGGGGGGG   GGGGGG   GGGGGGGGGGGG"
    ]
  },
  {
    nome: "Fase 3 — Rumo à Vitória",
    corCeu1: "#ff7a3d",
    corCeu2: "#ffd9a0",
    rows: [
      "                                                                                                                ",
      "         S                          o o o                       S                      o o o o                  ",
      "    ? ? ? ?        E              =========         ? ? ?                    =====                    S          ",
      "                          o o o                               E                      E          ==========      ",
      "   o o        =====      =======        S         o o o              =======                 o o                ",
      "  =====              E              BBB           =======     E                  ^^^     E          ? ? ?       ",
      "            ^^^              E              o o                         S                      ===========   o  F",
      "      E            ===========     ^^^^           ==========     BBB          ===========                 =====  ",
      "   BBB      GGGGGG            GGGGG       GGGGGG            GGGGGG       GGGGGGG          GGGGGGGGGG   GGGGGGGGGGG",
      "P  GGGG   GGGGGGGG   ^^^^^   GGGGG   ^^   GGGGGG   ^^^^   GGGGGG   ^^^   GGGGGGG   ^^^^   GGGGGGGGGG   GGGGGGGGGGG",
      "GGGGGGGG   GGGGGGG   GGGGG   GGGGG   GG   GGGGGG   GGGG   GGGGGG   GGG   GGGGGGG   GGGG   GGGGGGGGGG   GGGGGGGGGGG"
    ]
  }
];

/* Exporta para o escopo global (o jogo usa <script> simples, sem módulos). */
window.SLW_DATA = { BONS_FEITOS, LEVELS };
