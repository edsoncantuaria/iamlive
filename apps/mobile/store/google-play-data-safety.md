# Google Play — Declaração de segurança dos dados (Data safety)

Use como **rascunho**. Revise com o formulário oficial na Play Console; marque apenas o que o app **efetivamente** coleta/transmite.

**URL da política**  
https://api-ial.cloudive.com.br/legal/privacy

## Dados recolhidos ou partilhados

### Informações pessoais
| Dado | Finalidade | Opcional? | Encriptado em trânsito? |
|------|------------|-----------|-------------------------|
| E-mail | Conta, login, comunicações | Não | Sim (HTTPS) |
| Nome (se fornecido para contatos) | Identificar contato de confiança | Sim | Sim |
| Número de telefone (contatos) | Enviar alertas / WhatsApp | Sim | Sim |

### Mensagens
| Dado | Finalidade |
|------|------------|
| Conteúdo de mensagens de emergência configuradas pelo utilizador | Envio aos contatos via WhatsApp quando o prazo expira |

### Informações da app
| Dado | Finalidade |
|------|------------|
| Registos de falhas (crash) | Só se integrar serviço tipo Sentry; hoje o projeto pode não enviar — declare conforme a implementação real |

### Identificadores
| Dado | Finalidade |
|------|------------|
| ID de utilizador / token de sessão | Autenticação e Socket.IO |

## Dados processados apenas no dispositivo (se aplicável)

- **Biometria**: Face ID / impressão digital são tratados pelo iOS/Android para desbloquear o armazenamento seguro; o servidor **não** recebe templates biométricos.

## Partilha com terceiros

- **WhatsApp (Meta)**: envio de mensagens; dados tratados segundo políticas da Meta.
- **Fornecedor de alojamento / nuvem**: onde o servidor Estou Vivo estiver hospedado.

## Práticas de segurança

- Dados enviados em trânsito encriptados (HTTPS/WSS entre app e API pública).
- Senha armazenada com hash no servidor (não em texto claro).

## Eliminação de dados

- Descreva na Play Console o processo: pedido por e-mail ao `LEGAL_CONTACT_EMAIL` e prazos compatíveis com a LGPD.

## Crianças

- O serviço não se destina a menores de 16 anos sem consentimento aplicável (alinhado à política no servidor).
