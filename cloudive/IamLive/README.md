# IamLive — splash Cloudive (paleta Estou Vivo)

- **`estou-vivo-splash.svg`** — SVG animado: bolhas + texto **Cloudive** (nome da empresa). Cores do app **Estou Vivo** (`#052a2c`, `#4ECDC4`, …).
- **`EstouVivoSplash.tsx`** — overlay React (Next.js / web) com o mesmo conteúdo.

O nome do produto nas lojas continua **Estou Vivo**; na abertura mostra-se a marca **Cloudive**.

## App Expo (nativo)

O PNG `apps/mobile/assets/splash-icon.png` gera-se a partir de `apps/mobile/assets/splash-estou-vivo-static.svg`:

```bash
cd apps/mobile
convert -background none assets/splash-estou-vivo-static.svg -resize 1024x1024 assets/splash-icon.png
```
