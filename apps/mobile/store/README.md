# Metadados para as lojas (Estou Vivo)

URLs públicas legais (configure `PUBLIC_ORIGIN` + `LEGAL_*` no servidor):

- Privacidade: `https://api-ial.cloudive.com.br/legal/privacy`
- Termos: `https://api-ial.cloudive.com.br/legal/terms`

## Primeiro uso EAS

1. `npm install -g eas-cli` (ou `npx eas-cli`)
2. `cd apps/mobile && eas login`
3. `eas init` — associa o projeto ao Expo e grava `projectId` em `app.config.js` / `app.json` (siga as instruções do CLI).
4. Builds: `eas build --profile preview --platform android` (testes internos) ou `--profile production` (lojas).

## Ficheiros desta pasta

| Ficheiro | Uso |
|----------|-----|
| `listings-pt-BR.md` | Textos para Google Play e App Store (copiar/colar). |
| `google-play-data-safety.md` | Respostas sugeridas para o formulário **Política de privacidade / Segurança dos dados** (Play Console). |
| `apple-privacy-labels.md` | Orientação para **Privacy Nutrition Labels** e permissões no App Store Connect. |
| `SUBMIT.md` | Submissão com `eas submit` (contas de serviço, segredos). |

Credenciais (JSON da Play Console, certificados Apple) **não** devem ser commitadas; use caminhos locais ou segredos de CI.
