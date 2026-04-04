/** Documentos legais em HTML simples (PT-BR). Revise com advogado antes da publicação nas lojas. */

const style = `
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;max-width:42rem;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
  h1{font-size:1.35rem;margin-top:0}
  h2{font-size:1.05rem;margin-top:1.5rem}
  p,li{font-size:0.95rem}
  .muted{color:#555;font-size:0.85rem}
  a{color:#0d5c59}
`;

export function privacyPageHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Política de privacidade — Estou Vivo</title>
  <style>${style}</style>
</head>
<body>
  <h1>Política de privacidade</h1>
  <p class="muted">Última atualização: abril de 2026. Serviço: Estou Vivo (“app”). Operador: conforme dados de contacto publicados na loja de aplicações.</p>

  <h2>1. O que o app faz</h2>
  <p>O Estou Vivo permite registar confirmações periódicas de bem-estar (“check-in”) e, se o prazo definido expirar sem confirmação, enviar uma mensagem aos contactos de confiança indicados por si, através do WhatsApp (via servidor associado à sua conta).</p>

  <h2>2. Dados que tratamos</h2>
  <ul>
    <li><strong>Conta:</strong> e-mail e dados de autenticação (a senha não é guardada em texto legível no servidor).</li>
    <li><strong>Configuração:</strong> intervalo entre check-ins, texto de alerta, datas de confirmação.</li>
    <li><strong>Contactos de emergência:</strong> nome e número de telefone que indicar.</li>
    <li><strong>Técnico:</strong> dados de ligação necessários ao funcionamento (ex.: tokens de sessão, registos de erro no servidor).</li>
    <li><strong>WhatsApp:</strong> o servidor mantém a sessão necessária para enviar mensagens em nome da sua conta WhatsApp, conforme o que configurar no app.</li>
  </ul>

  <h2>3. Base legal e finalidades</h2>
  <p>Tratamos dados para executar o serviço que pediu (check-in e alertas), com base na execução do contrato. Notificações locais no dispositivo servem lembretes antes do prazo. Pode retirar consentimentos onde aplicável nas definições do sistema.</p>

  <h2>4. Conservação</h2>
  <p>Conservamos os dados enquanto a sua conta estiver ativa ou conforme necessário para prevenir abuso e cumprir obrigações legais. Após pedido de eliminação, apagaremos ou anonimizaremos os dados dentro de prazos razoáveis, salvo obrigação legal em contrário.</p>

  <h2>5. Partilha</h2>
  <p>Não vendemos dados. Os alertas são enviados aos números que indicar. O fornecedor de WhatsApp (Meta) processa mensagens segundo as respetivas políticas. O fornecedor de alojamento/cloud onde o servidor estiver hospedado pode ter acesso técnico aos dados da conta.</p>

  <h2>6. Segurança</h2>
  <p>Aplicamos medidas adequadas (ligação segura, autenticação, controlo de acesso ao servidor). Nenhum serviço é totalmente isento de risco.</p>

  <h2>7. Os seus direitos (RGPD / LGPD)</h2>
  <p>Pode solicitar acesso, retificação, oposição, limitação, portabilidade ou eliminação conforme a lei aplicável. Contacte-nos através do canal indicado na loja ou no app.</p>

  <h2>8. Crianças</h2>
  <p>O serviço não se destina a menores de 16 anos sem consentimento parental quando exigido por lei.</p>

  <h2>9. Alterações</h2>
  <p>Podemos atualizar esta política; a versão em vigor estará sempre nesta página: <a href="${origin}/legal/privacy">${origin}/legal/privacy</a></p>

  <p class="muted">Este texto é um modelo informativo e não substitui aconselhamento jurídico.</p>
</body>
</html>`;
}

export function termsPageHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Termos de utilização — Estou Vivo</title>
  <style>${style}</style>
</head>
<body>
  <h1>Termos de utilização</h1>
  <p class="muted">Última atualização: abril de 2026. Serviço: Estou Vivo.</p>

  <h2>1. Aceitação</h2>
  <p>Ao criar conta e usar o app, aceita estes termos. Se não concordar, não utilize o serviço.</p>

  <h2>2. Descrição do serviço</h2>
  <p>O app oferece lembretes e, se não confirmar dentro do prazo, pode enviar mensagens automáticas aos contactos que indicar, dependendo da configuração da sua conta WhatsApp no servidor e da disponibilidade da rede.</p>

  <h2>3. Responsabilidades do utilizador</h2>
  <ul>
    <li>Informações verdadeiras e contactos com consentimento para receber alertas.</li>
    <li>Uso legal e conforme os termos do WhatsApp e das lojas de aplicações.</li>
    <li>Manter credenciais seguras e um meio fiável de ligação ao servidor.</li>
  </ul>

  <h2>4. Limitação do serviço</h2>
  <p>O serviço depende de internet, do servidor, do estado da sessão WhatsApp e de fatores fora do nosso controlo. <strong>Não é um serviço de emergência</strong> nem substitui contactar serviços oficiais (112, SAMS, etc.). Em situação de risco imediato, contacte as autoridades competentes.</p>

  <h2>5. Conta e encerramento</h2>
  <p>Pode deixar de usar o app a qualquer momento. Podemos suspender contas em caso de uso abusivo ou ilegal.</p>

  <h2>6. Alterações</h2>
  <p>Podemos alterar estes termos; publicaremos a versão atualizada em <a href="${origin}/legal/terms">${origin}/legal/terms</a>. O uso continuado após alterações pode constituir aceitação.</p>

  <h2>7. Lei aplicável</h2>
  <p>Para litígios, aplica-se a lei do país do operador indicado na loja, sem prejuízo de direitos imperativos do consumidor.</p>

  <p class="muted">Revise estes termos com assessoria jurídica antes do lançamento público.</p>
</body>
</html>`;
}
