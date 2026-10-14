# Desenho Assinado

Página que recebe um número inteiro entre 1 e 100 e devolve uma figura em SVG, assinada com um e-mail.

A figura é a tabuada modular no círculo: 240 pontos igualmente espaçados numa circunferência, com cada ponto `i` ligado ao ponto `(k * i) mod 240`, em que `k = número + 1`. O número 1 produz uma cardioide, o 2 uma nefroide, e cada valor gera uma figura diferente.

## Estado inicial

Nesta versão a lógica de geração do SVG fica em `lib/desenho.js` e a interface em `public/index.html` + `public/script.js`.

## Publicação no Cloudflare Pages

Framework preset: `None`. Build command: vazio. Build output directory: `public`.

## Identificação (preencha após o fork)

Nome: Bruno Kenyu Ochiai
RA: 2026005370
URL: https://2bim-avalia1-ptl.pages.dev
