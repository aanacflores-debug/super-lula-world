# 🇧🇷 Super Lula World

Um jogo de plataforma estilo *Super Mario / Super Flavio World*, feito como **tributo**
às realizações de políticas públicas — os **"bons feitos"**. Corra pelo Brasil, pule na
cabeça dos *perrengues*, colete **votos** e desbloqueie as realizações ao longo de 3 fases!

Feito em **HTML5 + Canvas** puro, sem dependências. É só abrir no navegador.

## ▶️ Como rodar

Abra o `index.html` em qualquer navegador moderno. Só isso.

Se o seu navegador bloquear algo em `file://`, suba um servidor local:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```

## 🎮 Controles

| Ação | Teclado | Touch |
|------|---------|-------|
| Andar | `←` `→` ou `A` `D` | botões ◀ ▶ |
| Pular (segure p/ pular mais alto) | `Espaço`, `W`, `↑` ou `Z` | botão ⬆ |
| Confirmar nas telas | `Enter` / clique | toque |

- 🗳️ Colete **votos** para pontos.
- ⭐ Pegue as **estrelas** para desbloquear um **bom feito** (com um resumo).
- Pule na cabeça dos **perrengues** para derrotá-los.
- Desvie dos **espinhos** e não caia nos buracos.
- Chegue na **bandeira** 🚩 para vencer a fase.

## 🌟 Os "bons feitos" do jogo

As estrelas desbloqueiam realizações de políticas públicas, com descrições curtas:
Bolsa Família, Farmácia Popular, salário mínimo acima da inflação, Mais Médicos,
Minha Casa Minha Vida, proteção às famílias, regulação das bets, Brasil fora do
Mapa da Fome, ProUni e novas universidades, Luz para Todos, apoio ao fim da escala
6x1 e soberania do Brasil.

## 🗂️ Estrutura

```
index.html      # estrutura, telas (menu, HUD, pop-ups) e o <canvas>
css/style.css   # visual, telas e controles touch
js/levels.js    # mapas das fases + textos dos bons feitos
js/game.js      # motor: física, colisão, inimigos, câmera, render e áudio
```

As fases são mapas de texto em `js/levels.js` — dá pra criar novas facilmente.
Legenda: `G` chão · `B` tijolo · `=` plataforma · `?` bloco surpresa · `o` voto ·
`S` bom feito · `E` perrengue · `^` espinho · `P` início · `F` bandeira.

## 📝 Nota sobre o conteúdo

O jogo é um **tributo positivo**: celebra realizações e políticas públicas. Ele foi
pensado para ser leve e divertido — não inclui ataques pessoais nem acusações contra
pessoas reais. Os "perrengues" são obstáculos genéricos do jogo, não caricaturas de
ninguém.

---

*Um tributo em forma de joguinho. Feito com carinho 🧡*
