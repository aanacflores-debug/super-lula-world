# 🇧🇷 Super Lula World

Um jogo de plataforma estilo *Super Mario*, **didático e tributo**, sobre reconstruir
o Brasil. Enfrente as **forças do atraso**, derrote os chefões e, a cada vitória,
devolva uma **conquista** ao povo!

Feito em **HTML5 + Canvas** puro, sem dependências. Abra no navegador e jogue.

## ▶️ Como rodar

Abra o `index.html` em qualquer navegador moderno. Só isso.

Para servir localmente:
```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## ✨ O que tem no jogo

É um **jogo educativo**: a cada fase, o jogador aprende sobre uma política real.

- **Introdução com história** (a missão de reconstruir o país)
- **Seleção de personagem**: Lula, A Professora (pula mais alto) e O Trabalhador (corre mais)
- **Mapa do Brasil** no formato do país, com as fases por região
- **4 fases** com cenário brasileiro próprio (sertão/caatinga com mandacaru e carnaúba,
  cidade, campo, capital com Cristo e Pão de Açúcar)
- **Vilões = "políticos do atraso"** (caricaturas genéricas de terno e gravata)
- **Chefões** = os grandes problemas: **A Fome, O Desmonte, A Desigualdade e a Ameaça à Democracia**
- **Conquistas** desbloqueadas ao derrotar cada chefão, com um resumo e um **"Você sabia?"**
  (Fome Zero, Bolsa Família, Farmácia Popular, Mais Médicos, Minha Casa Minha Vida,
  salário mínimo acima da inflação, ProUni, Luz para Todos e mais)
- **Buracos** para pular, respawn gentil no último ponto seguro
- **Música** de fundo original (botão 🔊 liga/desliga) e efeitos sonoros
- **Tutorial** na primeira fase, **pausa**, controles de **teclado e touch**

## 🎮 Controles

| Ação | Teclado | Touch |
|------|---------|-------|
| Andar | `←` `→` / `A` `D` | botões ◀ ▶ |
| Pular (segure p/ mais alto) | `Espaço` / `W` / `↑` | botão ⬆ |
| Pausar | `Esc` / `P` / ⏸ | botão ⏸ |
| Confirmar | `Enter` / clique | toque |

Pule na **cabeça** dos vilões para derrotá-los. No fim de cada fase, enfrente o
**CHEFÃO**: pule na cabeça dele várias vezes até zerar a barra de vida. 🏆

## 🗂️ Estrutura

```
index.html      # telas (menu, intro, personagem, mapa, missão, pausa, etc.) e o <canvas>
css/style.css   # visual de todas as telas, HUD, barra do chefão e controles
js/levels.js    # história, personagens, conquistas, chefões e mapas das fases
js/game.js      # motor: cenas, física, colisão, chefões, música, render e áudio
```

As fases são mapas de texto em `js/levels.js` (fácil de editar/criar).
Legenda: `G` chão · `B` bloco · `=` plataforma · `?` bloco surpresa · `o` voto ·
`w` poça de desinformação · `E` vilão · `X` chefão · `P` início.

## 📝 Nota sobre o conteúdo

Jogo **educativo, positivo e didático**. Os vilões ("políticos do atraso") são
caricaturas **genéricas** e os chefões são **problemas** (A Fome, A Desigualdade, etc.):
**não representam pessoas reais** e o jogo não contém ataques pessoais nem acusações
contra indivíduos. A ideia é ensinar, de forma leve, políticas que mudaram vidas.

---

*Um tributo em forma de joguinho. Feito com carinho 🧡*
