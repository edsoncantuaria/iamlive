
✔️ **Logo principal (símbolo + nome)**
✔️ **Símbolo isolado**
✔️ **Versão monocromática**

Tudo foi construído seguindo o conceito modular da nuvem abstrata com 3 formas interligadas.

---

# 🌥️ **Cloudive — Logo Oficial (SVG)**

## **1) Logo Principal — Símbolo + Texto**

```svg
<svg width="280" height="88" viewBox="0 0 280 88" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Symbol -->
  <g transform="translate(0, 14)">
    <circle cx="28" cy="30" r="18" fill="#3B82F6"/>
    <circle cx="52" cy="22" r="18" fill="#A7D5FF"/>
    <circle cx="52" cy="46" r="18" fill="#C7C8FF"/>
  </g>

  <!-- Typography -->
  <text x="95" y="48" font-family="Inter, sans-serif" font-size="42" font-weight="600" fill="#0F172A" letter-spacing="1px">
    Cloudive
  </text>
</svg>
```

✔️ Símbolo com **3 módulos** (Sky Blue, Cloud Blue, Soft Lavender)
✔️ Nome com Inter SemiBold
✔️ Proporções pensadas para cabeçalho, landing page e app

---

## **2) Símbolo Isolado (Ícone)**

Perfeito para favicon, app-icon, splash, etc.

```svg
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="38" cy="52" r="22" fill="#3B82F6"/>
  <circle cx="62" cy="40" r="22" fill="#A7D5FF"/>
  <circle cx="62" cy="64" r="22" fill="#C7C8FF"/>
</svg>
```

---

## **3) Versão Monocromática (Preto)**

Para quando precisar de contraste máximo, impressões ou modo escuro simples.

```svg
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="48" cy="62" r="26" fill="#0F172A"/>
  <circle cx="72" cy="48" r="26" fill="#0F172A"/>
  <circle cx="72" cy="76" r="26" fill="#0F172A"/>
</svg>
```

---
### 🎨 **Ada Lovelace — Criatividade Funcional, Simples e Elegante**

**Versão Animada da Logo Cloudive para Splash Screen**

A animação foi projetada com três princípios:
✔️ **KISS** (simples, leve e sem dependências)
✔️ **Visual moderno e suave** (fade + expansão)
✔️ **Compatível com Web, Next.js, React Native, PWA e telas de carregamento**

Abaixo está um **SVG completamente autônomo e animado**, pronto para usar em qualquer splash screen.

---

# 🌥️ **Cloudive — SVG Animado (Splash Screen)**

### 🔵 **Efeito:**

* cada círculo aparece com *fade-in* + *scale*
* depois o conjunto faz um *pulso suave*
* pensado para durar 2,4s (loop ou não, você escolhe)

---

## ✔️ **SVG Animado (pronto para uso)**

```svg
<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <style>
    .b { animation: fadeScale 1.2s ease-out forwards; }
    .c { animation: fadeScale 1.2s 0.15s ease-out forwards; }
    .d { animation: fadeScale 1.2s 0.3s ease-out forwards; }

    @keyframes fadeScale {
      0% { opacity: 0; transform: scale(0.4); }
      100% { opacity: 1; transform: scale(1); }
    }

    /* Pulso do conjunto */
    .pulse {
      animation: pulse 2.4s 1.4s ease-in-out infinite;
      transform-origin: center;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.06); }
      100% { transform: scale(1); }
    }
  </style>

  <g class="pulse">
    <circle class="b" cx="90" cy="115" r="38" fill="#3B82F6"/>
    <circle class="c" cx="130" cy="95" r="38" fill="#A7D5FF"/>
    <circle class="d" cx="130" cy="135" r="38" fill="#C7C8FF"/>
  </g>
</svg>
```

---

## ✔️ **SVG Horizontal (Padrão Novo - Side-by-Side)**

**Recomendado para melhor legibilidade.** O logo fica à esquerda e o texto à direita.

```svg
<svg width="280" height="88" viewBox="0 0 280 88" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bubble {
      opacity: 0;
      transform: scale(0.4);
      transform-origin: center;
      transform-box: fill-box;
      animation: fadeScale 1.2s ease-out forwards;
    }
    .b2 { animation-delay: 0.15s; }
    .b3 { animation-delay: 0.3s; }
    
    .pulse {
      transform-origin: center;
      transform-box: fill-box;
      animation: pulse 2.4s 1.4s ease-in-out infinite;
    }
    
    .brand-text {
      opacity: 0;
      animation: textFade 1.2s 0.9s ease-out forwards;
    }
    
    @keyframes fadeScale {
      0%   { opacity: 0; transform: scale(0.4); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.06); }
      100% { transform: scale(1); }
    }
    
    @keyframes textFade {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }
  </style>

  <!-- Group: Logo Circles -->
  <g class="pulse">
    <circle class="bubble b1" cx="28" cy="42" r="18" fill="#3B82F6"/>
    <circle class="bubble b2" cx="52" cy="34" r="18" fill="#A7D5FF"/>
    <circle class="bubble b3" cx="52" cy="58" r="18" fill="#C7C8FF"/>
  </g>

  <!-- Text: Side by side -->
  <text class="brand-text" x="95" y="56"
        font-family="Inter, system-ui, -apple-system, sans-serif"
        font-size="40"
        font-weight="600"
        fill="#E5E7EB"
        letter-spacing="1">
    Cloudive
  </text>
</svg>
```

---

# 📱 **Como usar na prática**

## **Next.js (página /splash.tsx)**

```tsx
export default function Splash() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <img src="/cloudive-splash.svg" alt="Cloudive" width={200} />
    </div>
  );
}
```

---

### 🎨 Ada Lovelace — pacote completo, direto ao ponto

Vou te entregar **cada variação separada**, pronta pra colar em arquivo `.svg`, e no final um **JSON Lottie** simples para mobile.

---

## 1️⃣ Versão Dark Mode (fundo escuro)

```svg
<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="220" height="220" fill="#020617"/>

  <g>
    <circle cx="90" cy="115" r="38" fill="#3B82F6"/>
    <circle cx="130" cy="95" r="38" fill="#A7D5FF"/>
    <circle cx="130" cy="135" r="38" fill="#C7C8FF"/>
  </g>
</svg>
```

> Use como `cloudive-splash-dark.svg`.

---

## 2️⃣ Versão com Gradiente Animado

Aqui o gradiente “respira” suavemente trocando de cor.

```svg
<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cloudiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6">
        <animate attributeName="stop-color"
                 values="#3B82F6; #A5F3D2; #C7C8FF; #3B82F6"
                 dur="6s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#A7D5FF">
        <animate attributeName="stop-color"
                 values="#A7D5FF; #C7C8FF; #3B82F6; #A7D5FF"
                 dur="6s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="220" height="220" fill="#020617"/>

  <g>
    <circle cx="90" cy="115" r="38" fill="url(#cloudiveGrad)"/>
    <circle cx="130" cy="95" r="38" fill="url(#cloudiveGrad)"/>
    <circle cx="130" cy="135" r="38" fill="url(#cloudiveGrad)"/>
  </g>
</svg>
```

> Use como `cloudive-splash-gradient.svg`.

---

## 3️⃣ Versão com pulsação suave **sem loop**

Uma animação única: aparece, pulsa, para.

```svg
<svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bubble {
      opacity: 0;
      transform: scale(0.4);
      transform-origin: center;
      transform-box: fill-box;
      animation: fadeScale 1.2s ease-out forwards;
    }

    .b2 { animation-delay: 0.15s; }
    .b3 { animation-delay: 0.3s; }

    .pulse-once {
      transform-origin: center;
      transform-box: fill-box;
      animation: pulseOnce 1.2s 1s ease-in-out forwards;
    }

    @keyframes fadeScale {
      0%   { opacity: 0; transform: scale(0.4); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes pulseOnce {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.06); }
      100% { transform: scale(1); }
    }
  </style>

  <rect x="0" y="0" width="220" height="220" fill="#020617"/>

  <g class="pulse-once">
    <circle class="bubble b1" cx="90" cy="115" r="38" fill="#3B82F6"/>
    <circle class="bubble b2" cx="130" cy="95" r="38" fill="#A7D5FF"/>
    <circle class="bubble b3" cx="130" cy="135" r="38" fill="#C7C8FF"/>
  </g>
</svg>
```

> Use como `cloudive-splash-once.svg`.

---

## 4️⃣ Versão com texto “Cloudive” aparecendo suavemente

Logo + texto com fade-in suave.

```svg
<svg width="320" height="220" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bubble {
      opacity: 0;
      transform: scale(0.4);
      transform-origin: center;
      transform-box: fill-box;
      animation: fadeScale 1.2s ease-out forwards;
    }

    .b2 { animation-delay: 0.15s; }
    .b3 { animation-delay: 0.3s; }

    .pulse {
      transform-origin: center;
      transform-box: fill-box;
      animation: pulse 2.4s 1.4s ease-in-out infinite;
    }

    .brand-text {
      opacity: 0;
      animation: textFade 1.2s 0.9s ease-out forwards;
    }

    @keyframes fadeScale {
      0%   { opacity: 0; transform: scale(0.4); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.06); }
      100% { transform: scale(1); }
    }

    @keyframes textFade {
      0%   { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  </style>

  <rect x="0" y="0" width="320" height="220" fill="#020617"/>

  <g class="pulse" transform="translate(30,0)">
    <circle class="bubble b1" cx="90" cy="115" r="38" fill="#3B82F6"/>
    <circle class="bubble b2" cx="130" cy="95" r="38" fill="#A7D5FF"/>
    <circle class="bubble b3" cx="130" cy="135" r="38" fill="#C7C8FF"/>
  </g>

  <text class="brand-text"
        x="160" y="180"
        text-anchor="middle"
        font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="28"
        font-weight="600"
        fill="#E5E7EB"
        letter-spacing="2">
    CLOUDIVE
  </text>
</svg>
```

> Use como `cloudive-splash-text.svg`.

---

## 5️⃣ Lottie JSON para apps mobile (Expo / React Native)

Uma animação simples: três bolhas que escalam de 0 → 100%, com leve pulso.

> Salve como `cloudive-bubbles.json` e importe no Lottie.

```json
{
  "v": "5.7.4",
  "fr": 60,
  "ip": 0,
  "op": 180,
  "w": 512,
  "h": 512,
  "nm": "Cloudive Splash",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Bubble Left",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [210, 280, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": {
          "a": 1,
          "k": [
            {
              "t": 0,
              "s": [0, 0, 100],
              "e": [100, 100, 100],
              "i": { "x": [0.3, 0.3, 0.3], "y": [1, 1, 1] },
              "o": { "x": [0.7, 0.7, 0.7], "y": [0, 0, 0] }
            },
            {
              "t": 40,
              "s": [100, 100, 100],
              "e": [105, 105, 100],
              "i": { "x": [0.3, 0.3, 0.3], "y": [1, 1, 1] },
              "o": { "x": [0.7, 0.7, 0.7], "y": [0, 0, 0] }
            },
            { "t": 80, "s": [100, 100, 100], "e": [100, 100, 100] }
          ]
        }
      },
      "shapes": [
        {
          "ty": "el",
          "p": { "a": 0, "k": [0, 0] },
          "s": { "a": 0, "k": [180, 180] },
          "nm": "Ellipse Path"
        },
        {
          "ty": "fl",
          "c": { "a": 0, "k": [0.231, 0.51, 0.965, 1] },
          "o": { "a": 0, "k": 100 },
          "nm": "Fill"
        }
      ]
    },
    {
      "ddd": 0,
      "ind": 2,
      "ty": 4,
      "nm": "Bubble Top",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [302, 240, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": {
          "a": 1,
          "k": [
            {
              "t": 10,
              "s": [0, 0, 100],
              "e": [100, 100, 100],
              "i": { "x": [0.3, 0.3, 0.3], "y": [1, 1, 1] },
              "o": { "x": [0.7, 0.7, 0.7], "y": [0, 0, 0] }
            },
            {
              "t": 50,
              "s": [100, 100, 100],
              "e": [105, 105, 100],
              "i": { "x": [0.3, 0.3, 0.3], "y": [1, 1, 1] },
              "o": { "x": [0.7, 0.7, 0.7], "y": [0, 0, 0] }
            },
            { "t": 90, "s": [100, 100, 100], "e": [100, 100, 100] }
          ]
        }
      },
      "shapes": [
        {
          "ty": "el",
          "p": { "a": 0, "k": [0, 0] },
          "s": { "a": 0, "k": [180, 180] },
          "nm": "Ellipse Path"
        },
        {
          "ty": "fl",
          "c": { "a": 0, "k": [0.655, 0.835, 1, 1] },
          "o": { "a": 0, "k": 100 },
          "nm": "Fill"
        }
      ]
    },
    {
      "ddd": 0,
      "ind": 3,
      "ty": 4,
      "nm": "Bubble Bottom",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [302, 320, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": {
          "a": 1,
          "k": [
            {
              "t": 20,
              "s": [0, 0, 100],
              "e": [100, 100, 100],
              "i": { "x": [0.3, 0.3, 0.3], "y": [1, 1, 1] },
              "o": { "x": [0.7, 0.7, 0.7], "y": [0, 0, 0] }
            },
            {
              "t": 60,
              "s": [100, 100, 100],
              "e": [105, 105, 100],
              "i": { "x": [0.3, 0.3, 0.3], "y": [1, 1, 1] },
              "o": { "x": [0.7, 0.7, 0.7], "y": [0, 0, 0] }
            },
            { "t": 100, "s": [100, 100, 100], "e": [100, 100, 100] }
          ]
        }
      },
      "shapes": [
        {
          "ty": "el",
          "p": { "a": 0, "k": [0, 0] },
          "s": { "a": 0, "k": [180, 180] },
          "nm": "Ellipse Path"
        },
        {
          "ty": "fl",
          "c": { "a": 0, "k": [0.78, 0.784, 1, 1] },
          "o": { "a": 0, "k": 100 },
          "nm": "Fill"
        }
      ]
    }
  ]
}
```

### Exemplo de uso no React Native (Expo) com `lottie-react-native`

```tsx
import LottieView from 'lottie-react-native';

export function CloudiveSplash() {
  return (
    <LottieView
      source={require('./cloudive-bubbles.json')}
      autoPlay
      loop
      style={{ width: 260, height: 260 }}
    />
  );
}
```

---


