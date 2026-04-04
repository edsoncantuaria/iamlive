
## **Um Kit de Carregamento (Splash + Loading + Transições)**

Para **todos os seus apps** mostrarem **a identidade visual da Cloudive** no começo, sem interferir no fluxo interno de cada um.

Ou seja:

* Cada app mantém seu próprio login, UI e fluxo normal
* Mas **ao abrir**, **carregar** ou **inicializar**, ele mostra uma **tela Cloudive**
* Isso cria coerência visual entre todos os produtos
* E ainda deixa cada app livre para ter sua identidade própria
* Sem parecer que virou um “super app”, mas sim uma família de apps

---

# 🌥️ **Cloudive – Kit de Carregamento Universal (para todos os apps)**

## ✔️ O que o kit inclui

### 1. **Splash screen principal (SVG animado / Lottie)**

* O ícone Cloudive (3 círculos) pulsando
* Versões:

  * light
  * dark
  * gradiente
  * pulso único
  * com texto CLOUDIVE

### 2. **Intro Fade-in / Fade-out**

* Transição suave antes de entrar no app
* Dura de 1.2s a 1.8s

### 3. **Tela de carregamento (loading)**

* Depois do splash, enquanto o app inicia
* Com bolhas animadas ou barra de progresso
* Visual Cloudive

### 4. **Componente universal para Next.js / React Native / Web**

* `<CloudiveSplash />`
* `<CloudiveLoading />`

### 5. **Modo automático**

* Splash aparece **sempre ao abrir o app**
* E **não aparece novamente nas navegações internas**
* 100% KISS

---

# 🎬 **0. Padrão Novo (V2) — Horizontal Side-by-Side**

**Este é o novo padrão recomendado.** Melhor visibilidade do nome da marca.

* Layout: **Logo à esquerda + Nome à direita**
* Animação: **Fade-in suave (sem movimento vertical)**
* Cores: Adaptar para a paleta do app (ex: Aesthetic Flow usa tons de rosa/roxo)

### Componente Recomendado (React/Next.js)

```tsx
"use client";
import { useEffect, useState } from "react";

export function CloudiveSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]">
      <div className="w-full max-w-[280px]">
        {/* SVG Horizontal Aqui (ver logos.md) */}
        <img src="/cloudive-splash-horizontal.svg" className="w-full h-auto" />
      </div>
    </div>
  );
}
```

---

# 🎬 **1. Componente Splash Cloudive (V1 - Centralizado)**

```tsx
// components/CloudiveSplash.tsx
import { useEffect, useState } from "react";

export function CloudiveSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1400); // 1.4s
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <img
        src="/cloudive-splash-once.svg"
        alt="Cloudive"
        className="w-40 h-40 animate-fadeIn"
      />
    </div>
  );
}
```

### Tailwind animation

```css
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}
```

---

# 🎬 **2. Splash para React Native (Expo)**

```tsx
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';

export function CloudiveSplash() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHide(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (hide) return null;

  return (
    <LottieView
      source={require('../assets/cloudive-bubbles.json')}
      autoPlay
      loop={false}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#020617",
      }}
    />
  );
}
```

---

# 🎬 **3. Tela de Carregamento (Loading)**

Para usar enquanto o app busca dados, inicia sessões, conecta WebSocket etc.

```tsx
// components/CloudiveLoading.tsx
export function CloudiveLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <img src="/cloudive-icon.svg" className="w-12 h-12 animate-pulse" />
        <p className="text-slate-300 text-sm font-medium">Carregando…</p>
      </div>
    </div>
  );
}
```

---

# 🌈 **4. Animações prontas para uso (referência dos arquivos)**

Você já tem:

### ✔️ `cloudive-splash-dark.svg`

Para apps com tema escuro.

### ✔️ `cloudive-splash-gradient.svg`

Splash com gradiente animado.

### ✔️ `cloudive-splash-once.svg`

Pulso suave único (mais profissional para apps sérios).

### ✔️ `cloudive-splash-text.svg`

Texto CLOUDIVE aparecendo devagar.

### ✔️ `cloudive-bubbles.json`

Lottie para mobile e apps híbridos.

---

# 🧬 **5. Padrão de carregamento recomendado**

### Ao abrir o app → mostrar:

1. **CloudiveSplash (1.2s – 1.6s)**
2. **CloudiveLoading** enquanto inicializa coisas internas
3. Entrar no app normalmente

### Nas próximas navegações

* **não mostrar nada**
* Splash só no carregamento inicial da aplicação

---

# 📐 **6. List de usos por app**

## Crônicas de Aventuras (RPG)

* Splash: `cloudive-splash-text.svg`
* Loading: ícone Cloudive + texto "Invocando narrador…"

## Jornada Financeira

* Splash: `cloudive-splash-once.svg`
* Loading: “Calculando seu progresso…”

## Bathroom Guide

* Splash: `cloudive-splash-gradient.svg`
* Loading: “Localizando banheiros próximos…”

## App de Resiliência (hábitos)

* Splash: `cloudive-splash-dark.svg`
* Loading: “Respire… carregando”

---

# 🎯 Conclusão — Kit de Identidade no Carregamento

Você agora tem:

* ✔️ Splash universal Cloudive
* ✔️ Loading screen oficial
* ✔️ Animação SVG + Lottie
* ✔️ Componente universal React / Next.js / RN
* ✔️ Transição suave na inicialização
* ✔️ Regras por app
* ✔️ Identidade consistente em toda a família Cloudive

Totalmente KISS, modular e reutilizável.

---

### 🎨 **Ada Lovelace — Templates completos, prontos para uso, simples e elegantes**

Aqui estão **templates completos** para integrar o **Splash + Loading Cloudive** em:

1. **Next.js (App Router)**
2. **Next.js (Pages Router)**
3. **React Native (Expo)**
4. **React Web (CRA/Vite)**
5. **PWA (manifest + splash minimalista)**

Todos seguem **KISS**, usam o **Cloudive Splash** como abertura universal, e são modulares para qualquer app seu.

---

# 🌥 1) **Next.js 14+ — App Router (`app/`)**

## 📂 Estrutura

```
app/
 ├─ layout.tsx
 ├─ page.tsx
 ├─ loading.tsx
 ├─ splash/
 │    └─ CloudiveSplash.tsx
 └─ globals.css
public/
 ├─ cloudive-splash-once.svg
 ├─ cloudive-bubbles.json
 └─ cloudive-icon.svg
```

---

## 📄 `app/layout.tsx`

```tsx
import "./globals.css";
import { CloudiveSplash } from "./splash/CloudiveSplash";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <CloudiveSplash />
        {children}
      </body>
    </html>
  );
}
```

---

## 📄 `app/splash/CloudiveSplash.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

export function CloudiveSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
      <img src="/cloudive-splash-once.svg" alt="Cloudive" className="w-40 h-40" />
    </div>
  );
}
```

---

## 📄 `app/loading.tsx` (loading universal do App Router)

```tsx
export default function Loading() {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
      <img src="/cloudive-icon.svg" className="w-10 h-10 animate-pulse" />
    </div>
  );
}
```

---

## 📄 `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fade Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}
```

---

# 🌥 2) **Next.js (Pages Router — `/pages`)**

## 📂 Estrutura

```
pages/
 ├─ _app.tsx
 ├─ index.tsx
 ├─ _document.tsx
components/
 └─ CloudiveSplash.tsx
public/
 ├─ cloudive-splash-once.svg
 ├─ cloudive-icon.svg
```

---

## 📄 `pages/_app.tsx`

```tsx
import "../styles/globals.css";
import { CloudiveSplash } from "@/components/CloudiveSplash";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <CloudiveSplash />
      <Component {...pageProps} />
    </>
  );
}
```

---

## 📄 `components/CloudiveSplash.tsx`

```tsx
import { useState, useEffect } from "react";

export function CloudiveSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
      <img src="/cloudive-splash-once.svg" className="w-40 h-40" />
    </div>
  );
}
```

---

# 📱 3) **React Native (Expo)**

## 📂 Estrutura

```
app/
 ├─ _layout.tsx
 ├─ index.tsx
components/
 └─ CloudiveSplash.tsx
assets/
 └─ cloudive-bubbles.json
```

---

## 📄 `components/CloudiveSplash.tsx`

```tsx
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";

export function CloudiveSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <View style={{
      position: "absolute",
      top: 0, bottom: 0, left: 0, right: 0,
      backgroundColor: "#020617",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}>
      <LottieView
        source={require("../assets/cloudive-bubbles.json")}
        autoPlay
        loop={false}
        style={{ width: 220, height: 220 }}
      />
    </View>
  );
}
```

---

## 📄 `app/_layout.tsx`

```tsx
import { CloudiveSplash } from "../components/CloudiveSplash";

export default function RootLayout() {
  return (
    <>
      <CloudiveSplash />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

---

# 🌐 4) **React (Vite ou CRA)**

## 📂 Estrutura

```
src/
 ├─ main.tsx
 ├─ App.tsx
 ├─ CloudiveSplash.tsx
public/
 ├─ cloudive-splash-once.svg
```

---

## 📄 `src/CloudiveSplash.tsx`

```tsx
import { useEffect, useState } from "react";

export function CloudiveSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#020617",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999
    }}>
      <img src="/cloudive-splash-once.svg" width="150" />
    </div>
  );
}
```

---

## 📄 `src/App.tsx`

```tsx
import { CloudiveSplash } from "./CloudiveSplash";

export default function App() {
  return (
    <>
      <CloudiveSplash />
      <YourAppComponents />
    </>
  );
}
```

---

# 📱 5) **PWA (Splash e Ícones)**

## 📄 `public/manifest.json`

```json
{
  "name": "Cloudive App",
  "short_name": "Cloudive",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#020617",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/cloudive-icon.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

---

# 🎨 6) **Componente de Loading universal (todos os templates)**

```tsx
export function CloudiveLoading() {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
      <img src="/cloudive-icon.svg" className="w-10 h-10 animate-pulse" />
    </div>
  );
}
```

---



