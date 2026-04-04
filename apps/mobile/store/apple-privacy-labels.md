# App Store — Etiquetas de privacidade (Privacy Nutrition Labels)

Preencha no App Store Connect com base no comportamento **real** do build que submete. Sugestão para o Estou Vivo:

## Dados ligados ao utilizador

| Categoria | Tipo | Uso |
|-----------|------|-----|
| Informações de contacto | Endereço de e-mail | Autenticação da conta, gestão da conta |
| Informações de contacto | Nome (opcional, contatos) | Funcionalidade dos alertas aos contatos |
| Informações de contacto | Número de telefone (contatos) | Envio de mensagens / integração WhatsApp |
| Identificadores | ID de utilizador | Conta e sessão |

## Dados não ligados ao utilizador

- Normalmente **não aplicável**, salvo se usar análise agregada sem identificação (hoje o projeto foca-se em conta + servidor próprio).

## Rastreamento

- Se **não** usar IDFA nem rastrear entre apps/sites de terceiros para publicidade, indique **“Não, não rastreamos…”**.

## Permissões no projeto (Expo)

- **Face ID / biometria**: descrito no `Info.plist` (`NSFaceIDUsageDescription`) — desbloqueio local do token.
- **Notificações**: pedido em tempo de execução para lembretes de check-in.
- **Rede**: acesso à API `https://api-ial.cloudive.com.br` e WebSocket.

## URLs

- Política de privacidade: https://api-ial.cloudive.com.br/legal/privacy
