# iamlive

App para quem mora sozinho: confirmação periódica (**check-in**) e, se o prazo expirar, **envio automático** de mensagem aos **contatos** de confiança via **WhatsApp** (sessão no servidor).

## Estrutura

- **`apps/mobile`** — app [Expo](https://expo.dev) (React Native): check-in, contatos, configurações, pareamento com o servidor.
- **`server`** — Node.js: [Baileys](https://github.com/WhiskeySockets/Baileys) + [Socket.io](https://socket.io) (QR e estado em tempo real, envio `send-emergency`).
- **`legacy/flutter-estou-vivo`** — implementação anterior em Flutter (referência).

Não há fallback `wa.me`: o envio é **só pelo servidor**; se o servidor ou a sessão WhatsApp falhar, o app avisa você.

## Servidor

```bash
cd server
cp .env.example .env
# Obrigatório: JWT_SECRET (ver .env.example)
# Produção: NODE_ENV=production, TRUST_PROXY=1 atrás de Cloudflare/nginx, JWT_SECRET forte
# Opcional: CLIENT_TOKEN só em dev; em prod use ALLOW_CLIENT_TOKEN_IN_PRODUCTION=1 se precisar do legado
# Opcional: CORS_ORIGIN (lista ou *), PUBLIC_ORIGIN nas páginas /legal/*
# `npm start` limita heap do Node (~384 MiB) para caber melhor em VM ~1 GiB; `npm run start:no-heap-cap` remove o limite
npm install
npm run dev
```

Contas ficam em **MariaDB** (ou MySQL compatível): `DATABASE_URL` (`mysql://…`) ou `MYSQL_HOST` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`. A tabela `users` é criada na primeira subida. Cada usuário autenticado tem pasta própria em `data/auth/<userId>/` (ou `AUTH_DIR`) para a sessão **Baileys**. HTML de **privacidade** e **termos** em `GET /legal/privacy` e `GET /legal/terms` (revisar texto juridicamente antes das lojas).

## App móvel

```bash
cd apps/mobile
cp .env.example .env
# EXPO_PUBLIC_SERVER_URL — ex.: https://api.seudominio.com (emulador Android: http://10.0.2.2:PORTA)
npm install
npx expo start
```

O fluxo inicial é **início de sessão** com e-mail e senha (biometria no aparelho opcional para proteger o token). O **JWT** vai para `expo-secure-store` e é enviado no handshake do Socket.IO.

## Requisitos

- Node 20+ recomendado.
- O **celular** ou emulador precisa alcançar o IP/porta do servidor (firewall, mesma rede).
