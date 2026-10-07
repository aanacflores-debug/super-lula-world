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

- **Introdução com história** (a missão de reconstruir o país)
- **Seleção de personagem**: Lula, A Professora (pula mais alto) e O Trabalhador (corre mais)
- **Mapa do Brasil** com as fases em sequência
- **4 fases** temáticas, cada uma com cenário brasileiro próprio
  (sertão, cidade, campo, capital com Cristo e Pão de Açúcar)
- **Chefões** = forças do atraso: **A Fome, O Desmonte, A Desigualdade e a Ameaça à Democracia**
- **Conquistas** desbloqueadas ao derrotar cada chefão (Bolsa Família, Farmácia Popular,
  Minha Casa Minha Vida, salário mínimo acima da inflação, ProUni, Luz para Todos e mais)
- **Música** de fundo original (botão 🔊 liga/desliga) e efeitos sonoros
- **Perigos criativos**: poças de desinformação 💬 no lugar dos espinhos
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

Tributo **positivo e didático**. Os vilões são as **forças do atraso** personificadas
(A Fome, A Desigualdade, etc.) — **não representam pessoas reais** e o jogo não contém
ataques pessoais nem acusações contra indivíduos. A ideia é celebrar conquistas e
direitos, de forma leve e divertida.

---

*Um tributo em forma de joguinho. Feito com carinho 🧡*
