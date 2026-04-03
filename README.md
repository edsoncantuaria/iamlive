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
# Editar CLIENT_TOKEN e opcionalmente PORT / AUTH_DIR
npm install
npm run dev
```

## App móvel

```bash
cd apps/mobile
cp .env.example .env
# EXPO_PUBLIC_SERVER_URL — ex.: http://IP_DA_MAQUINA:3000 (emulador Android: http://10.0.2.2:3000)
# EXPO_PUBLIC_CLIENT_TOKEN — igual ao CLIENT_TOKEN do servidor
npm install
npx expo start
```

## Requisitos

- Node 20+ recomendado.
- O **celular** ou emulador precisa alcançar o IP/porta do servidor (firewall, mesma rede).
