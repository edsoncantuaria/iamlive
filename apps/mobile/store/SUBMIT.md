# Submissão com EAS Submit

## Pré-requisitos

1. Contas **Google Play Console** e **Apple Developer** ativas.
2. `eas build` com perfil `production` concluído para cada plataforma.
3. `eas init` já executado (projeto ligado ao Expo).

## Android

1. Crie uma conta de serviço na Google Cloud ligada à Play Console (API Google Play Android Developer).
2. Descarregue o JSON da chave; guarde **fora** do repositório (ex.: `~/secrets/play-api.json`).
3. Submissão interativa:
   ```bash
   cd apps/mobile
   eas submit -p android --latest
   ```
4. Ou configure `eas.json` → `submit.production.android.serviceAccountKeyPath` com caminho **local** (não commite o ficheiro).

## iOS

1. Certifique-se de que o bundle ID `com.estouvivo.mobile` está registado no Apple Developer e existe uma app no App Store Connect.
2. `eas submit -p ios --latest` — o EAS usa credenciais geridas ou as que configurar (`credentials.json` local).

## CI (GitHub Actions)

- Crie o segredo `EXPO_TOKEN` (expo.dev → Access Tokens).
- Opcional: `EAS_PROJECT_ID` se o `projectId` não estiver no repositório.
- Workflow: `.github/workflows/eas-build.yml` (execução manual `workflow_dispatch`).
