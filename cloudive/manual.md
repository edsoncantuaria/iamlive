
# 🌥️ **Cloudive — Manual de Marca (Brand Guide)**

## 📘 1. Visão Geral

A **Cloudive** é uma empresa multi-produtos, que desenvolve apps variados:

* RPG com IA
* Finanças
* Saúde e Resiliência
* Utilidades (como buscador de banheiros)
* Ferramentas de produtividade
* Apps experimentais

A identidade visual precisa ser:

* **Genérica**, sem amarrar em um setor
* **Moderna e leve**
* **Escalável para qualquer produto**
* **Simples de usar** em Next.js, mobile, dashboards e WebApps

---

# 🎯 2. Princípio da Marca

**"Tecnologia leve, modular e acessível."**

A marca transmite:

* fluidez
* simplicidade
* tecnologia suave
* acolhimento visual
* modularidade (cada app deriva do mesmo DNA)

---

# 🪁 3. Logo Oficial

### ✔️ Símbolo: **Três círculos interligados**

Representam:

* modularidade
* nuvem
* fluidez
* expansão de ideias

### ✔️ Arquivos criados

| Tipo                   | Nome sugerido                  | Descrição                      |
| ---------------------- | ------------------------------ | ------------------------------ |
| Logo principal         | `cloudive-logo.svg`            | Símbolo + texto                |
| Ícone                  | `cloudive-icon.svg`            | Apenas os 3 círculos           |
| Monocromático          | `cloudive-icon-mono.svg`       | Preto 100%                     |
| Dark Mode              | `cloudive-splash-dark.svg`     | Para splashscreen escura       |
| Gradiente animado      | `cloudive-splash-gradient.svg` | Animação suave em loop         |
| Pulso único            | `cloudive-splash-once.svg`     | Anima somente uma vez          |
| Logo com texto animado | `cloudive-splash-text.svg`     | Splash com texto CLOUDIVE      |
| **Horizontal (Novo)**  | `cloudive-splash-horizontal.svg`| **Padrão V2 (Lado a lado)**    |
| Lottie JSON            | `cloudive-bubbles.json`        | Animação para mobile (Expo/RN) |

---

# 🎨 4. Paleta de Cores

## **Primárias**

| Nome              | Hex       | Uso                  |
| ----------------- | --------- | -------------------- |
| **Sky Core**      | `#3B82F6` | Destaques, botões    |
| **Cloud Blue**    | `#A7D5FF` | Fundos suaves        |
| **Soft Lavender** | `#C7C8FF` | Elementos auxiliares |
| **Ink Black**     | `#0F172A` | Texto principal      |

## **Secundárias**

| Nome       | Hex       | Uso               |
| ---------- | --------- | ----------------- |
| Mint Cloud | `#A5F3D2` | Apps de bem-estar |
| Amber Glow | `#FBBF24` | Apps utilitários  |
| Lilac Mist | `#E0E0FF` | UI neutra suave   |

## **Neutras**

| Nome        | Hex       |
| ----------- | --------- |
| Cloud White | `#F8FAFC` |
| Slate Grey  | `#64748B` |
| Graphite    | `#1E293B` |

---

# 🅰️ 5. Tipografia

### Fonte oficial:

* **Inter Tight** (títulos)
* **Inter** (corpo do texto)

### Peso recomendado:

* Títulos: **600–700**
* Texto normal: **400–500**
* Labels: **500**

---

# 🧩 6. Componentes de UI – Tokens Oficiais

## **Spacing**

```
space-xs: 4px
space-sm: 8px
space-md: 16px
space-lg: 24px
space-xl: 32px
```

## **Border Radius**

```
radius-sm: 6px
radius-md: 12px
radius-lg: 16px
radius-xl: 20px
radius-xxl: 24px
```

## **Shadows**

```
shadow-soft: 0 4px 12px rgba(0,0,0,0.08)
shadow-floating: 0 6px 24px rgba(0,0,0,0.12)
```

## **Motion**

```
transition-base: 160ms ease
transition-soft: 300ms ease-in-out
```

---

# 📱 7. Kit de Identidade para os Apps (Sub-Marcas)

Cada app deve carregar **o símbolo base**, mas com **cor dominante específica**.

## 7.1 **Crônicas de Aventuras (RPG com IA)**

* Cor dominante: **Indigo / Violet**
* Estilo: místico, suave
* Ícone derivado: símbolo Cloudive como "runa"

## 7.2 **Jornada Financeira**

* Cor dominante: **Mint Cloud (#A5F3D2)**
* Estética: estável, organizada
* Ícone derivado: símbolo com traço sugerindo gráfico

## 7.3 **Bathroom Guide (Buscador de Banheiros)**

* Cor dominante: **Amber Glow (#FBBF24)**
* Ícone derivado: símbolo Cloudive estilizado como pin/map-marker

## 7.4 **Resiliência / Anti-hábitos**

* Cor dominante: **Soft Lavender (#C7C8FF)**
* Ícone derivado: símbolo com sensação de ciclo / pétalas

## 7.5 **Apps utilitários futuros**

* Geração automática de cor secundária
* Derivação sempre baseada nos 3 círculos
* Regras:

  * manter proporções
  * manter bordas suaves
  * manter coerência entre família Cloudive

---

# 🔤 8. Usos do Logotipo

## ✔️ Cor correta (preferencial)

* Fundo escuro → versão colorida
* Fundo claro → versão colorida
* Documentos → versão com texto
* Splash screen → animated SVG ou Lottie

## ✔️ Margem mínima

Deixar espaço igual à **metade do diâmetro do círculo**.

## ✔️ Tamanhos mínimos

* Mobile / Navbar: **32px**
* Dashboard: **48px**
* Splashscreen: **200px**

## ❌ Proibido

* distorcer
* girar
* alterar cor primária
* adicionar sombras externas no logo
* colocar borda no símbolo

---

# 🎬 9. Splash Screens Disponíveis

### ✔️ Dark Mode

`cloudive-splash-dark.svg`

### ✔️ Gradiente Animado

`cloudive-splash-gradient.svg`

### ✔️ Pulso suave (uma vez)

`cloudive-splash-once.svg`

### ✔️ Texto CLOUDIVE com fade-in

`cloudive-splash-text.svg`

### ✔️ Animação Lottie oficial (mobile)

`cloudive-bubbles.json`

---

# 🎛️ 10. Tailwind — tokens oficiais (copiar e colar)

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      cloudive: {
        sky: "#3B82F6",
        blue: "#A7D5FF",
        lavender: "#C7C8FF",
        ink: "#0F172A",
        mint: "#A5F3D2",
        amber: "#FBBF24",
      }
    },
    borderRadius: {
      'xl': '20px',
      '2xl': '24px'
    },
    boxShadow: {
      soft: "0 4px 12px rgba(0,0,0,0.08)",
      floating: "0 6px 24px rgba(0,0,0,0.12)"
    }
  }
}
```

---

# 🧱 11. Branding para telas internas (apps)

## Header

* Logotipo <30–40px>
* Plano de fundo: `#0F172A` ou `#F8FAFC`

## Components base

* Card com radius 16px
* Shadow “soft”
* Divisores de 1px cinza claro

## Botões

```
largura: auto
height: 48px
radius: 12–16px
font-weight: 600
```

* Primário: `bg-cloudive-sky`
* Secundário: `bg-cloudive-blue`
* Tertiário: `bg-slate-700 text-white`

---

# 📦 12. Arquivos criados neste pacote

### **Logo & Ícones**

* `cloudive-logo.svg`
* `cloudive-icon.svg`
* `cloudive-icon-mono.svg`

### **Splash Screens**

* `cloudive-splash-dark.svg`
* `cloudive-splash-gradient.svg`
* `cloudive-splash-once.svg`
* `cloudive-splash-text.svg`

### **Animação Mobile**

* `cloudive-bubbles.json` (Lottie)

### **Outros**

* Paleta oficial
* Tipografia
* Tokens de design
* Config Tailwind
* Kit de sub-marcas para apps
* Diretrizes de uso

---

# 🔚 13. Próximos passos (opcional)

Posso criar, se quiser:

✔️ **Landing page oficial Cloudive** (Next.js + Tailwind)
✔️ **Kit de onboarding unificado** para login de todos os seus apps
✔️ **Design system completo (Cloudive UI)**
✔️ **Sistema de ícones da Cloudive**
✔️ **Arquivos em .png, .webp e .ico**

Só pedir.
