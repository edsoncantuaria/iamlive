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

Contas ficam em **MariaDB** (ou MySQL compatível): `DATABASE_URL` (`mysql://…`) ou `MYSQL_HOST` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE`. A tabela `users` é criada na primeira subida. Cada usuário autenticado tem pasta própria em `data/auth/<userId>/` (ou `AUTH_DIR`) para a sessão **Baileys**.

**Documentos legais (LGPD + termos em PT-BR):** `GET /legal/privacy` e `GET /legal/terms`. Configure no `.env` as variáveis `LEGAL_OPERATOR_NAME`, `LEGAL_CONTACT_EMAIL` e, quando aplicável, `LEGAL_OPERATOR_CNPJ`, `LEGAL_ADDRESS`, `LEGAL_DPO_EMAIL` para identificação completa do controlador. `PUBLIC_ORIGIN` deve ser a URL pública (ex.: `https://api-ial.cloudive.com.br`). Revisão por advogado recomendada antes do lançamento comercial.

## App móvel

```bash
cd apps/mobile
cp .env.example .env
# Opcional: EXPO_PUBLIC_SERVER_URL para API local. Sem isso, o app usa https://api-ial.cloudive.com.br.
# Só para HTTP em Android (LAN): EXPO_PUBLIC_ANDROID_CLEARTEXT=1 — builds EAS preview/development já sugerem isso; produção fica só HTTPS.
npm install
npx expo start
```

### EAS (builds para lojas)

1. `cd apps/mobile && npm install` (o **`eas-cli`** está em `devDependencies`; não precisa de `-g`).
2. `npx eas login` (uma vez por máquina/conta Expo).
3. `npx eas init` (associa o projeto e grava o `projectId`).
4. `npm run eas:preview` — APK interno (Android) com tráfego HTTP permitido se precisar de API local.
5. `npm run eas:production` — AAB (Android) / IPA para submissão; **sem** cleartext por defeito.

Metadados sugeridos (Play / Apple / Data Safety): pasta **`apps/mobile/store/`**. Submissão: **`store/SUBMIT.md`**.

### CI

Workflow manual **EAS Build**: `.github/workflows/eas-build.yml` — requer o segredo **`EXPO_TOKEN`** no GitHub (criar em [expo.dev](https://expo.dev) → Access Tokens).

O fluxo inicial é **início de sessão** com e-mail e senha (biometria no aparelho opcional). O **JWT** vai para `expo-secure-store` e é enviado no handshake do Socket.IO.

### Notificações e widgets (APK / IPA / EAS)

- **Lembretes do app** são **notificações locais** agendadas no aparelho (`expo-notifications`). Não dependem de servidor nem de FCM/APNs para disparar. Com um **development build** ou binário EAS (não use Expo Go no Android para isso), ative as permissões nas configurações do sistema.
- O plugin **`expo-notifications`** e a permissão Android **`SCHEDULE_EXACT_ALARM`** estão no `app.config.js` para ícone/canal no Android e horários mais fiáveis. No iOS, o texto do pedido de permissão está em `NSUserNotificationsUsageDescription`.
- **Push remoto** (Expo Push / FCM / APNs para o servidor mandar notificações) **ainda não está ligado ao código**; quando quiser, siga [Push notifications: setup](https://docs.expo.dev/push-notifications/push-notifications-setup/), rode `eas credentials` e associe FCM (Android) e chave APNs (iOS) ao projeto Expo.
- **Widget Android** (`react-native-android-widget`): após instalar o APK/AAB, adicione o widget **Estou Vivo!** pela gaveta de widgets do launcher; o app atualiza os dados ao abrir e após check-in. **Widget iOS** (`targets/EstouVivoWidget`): o plugin **`@bacons/apple-targets`** entra no prebuild; o IPA precisa do mesmo *bundle id* / *App Group* já definidos (`group.com.estouvivo.mobile`). Defina **`EXPO_APPLE_TEAM_ID`** (Team ID Apple) no `.env` ou nas variáveis do projeto EAS para *signing* do *widget extension*.

### Testes antes das lojas

- Login, registo, biometria, Socket e WhatsApp em **dispositivo real**
- **TestFlight** (iOS) e **faixa interna** (Google Play) com o binário `production`
- Lembretes: marcar um check-in, confirmar permissão de notificações e, no Android, se o fabricante atrasar alarmes, revisar **alarmes e lembretes** / **bateria** para o app

## Requisitos

- Node 20+ recomendado.
- O **celular** ou emulador precisa alcançar o IP/porta do servidor (firewall, mesma rede).
