/**
 * Política de privacidade e termos de uso (PT-BR, Brasil / LGPD).
 * Configure LEGAL_* no .env do servidor para identificação completa do controlador.
 * Revisão por advogado antes do lançamento comercial é fortemente recomendada.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function legalIdentityBlock(): string {
  const name = process.env.LEGAL_OPERATOR_NAME?.trim();
  const cnpj = process.env.LEGAL_OPERATOR_CNPJ?.trim();
  const email = process.env.LEGAL_CONTACT_EMAIL?.trim();
  const address = process.env.LEGAL_ADDRESS?.trim();
  const dpo = process.env.LEGAL_DPO_EMAIL?.trim();

  if (!name || !email) {
    return `<div class="warn"><strong>Atenção (operador):</strong> Para exibição completa aos usuários, defina no servidor as variáveis <code>LEGAL_OPERATOR_NAME</code>, <code>LEGAL_CONTACT_EMAIL</code> e, quando aplicável, <code>LEGAL_OPERATOR_CNPJ</code>, <code>LEGAL_ADDRESS</code> e <code>LEGAL_DPO_EMAIL</code> (encarregado de dados — DPO).</div>`;
  }

  let html = `<p><strong>Razão social / nome do controlador:</strong> ${esc(name)}</p>`;
  if (cnpj) html += `<p><strong>CNPJ:</strong> ${esc(cnpj)}</p>`;
  html += `<p><strong>E-mail de contato:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`;
  if (address) {
    html += `<p><strong>Endereço:</strong> ${esc(address.replace(/\n/g, ', '))}</p>`;
  }
  if (dpo) {
    html += `<p><strong>Encarregado de dados (DPO):</strong> <a href="mailto:${esc(dpo)}">${esc(dpo)}</a></p>`;
  }
  return html;
}

const style = `
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
  h1{font-size:1.4rem;margin-top:0}
  h2{font-size:1.1rem;margin-top:1.75rem;border-bottom:1px solid #e5e7eb;padding-bottom:0.25rem}
  p,li{font-size:0.95rem}
  .muted{color:#555;font-size:0.88rem}
  a{color:#0d5c59}
  code{font-size:0.88em;background:#f3f4f6;padding:0.1em 0.35em;border-radius:4px}
  .warn{background:#fff8e6;border:1px solid #e6a100;padding:1rem;border-radius:8px;margin:1rem 0;font-size:0.92rem}
  .box{background:#f9fafb;border:1px solid #e5e7eb;padding:1rem;border-radius:8px;margin:1rem 0}
`;

export function privacyPageHtml(origin: string): string {
  const privacyUrl = `${origin}/legal/privacy`;
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
  <p class="muted">Última atualização: 4 de abril de 2026 · Aplicativo: <strong>Estou Vivo</strong> · Versão aplicável ao território brasileiro (Lei nº 13.709/2018 — LGPD), sem prejuízo de normas de proteção de dados de outros países quando o titular estiver fora do Brasil.</p>

  <div class="box">
    <h2 style="margin-top:0;border:none">1. Quem é o controlador dos seus dados</h2>
    ${legalIdentityBlock()}
  </div>

  <h2>2. Resumo do aplicativo</h2>
  <p>O Estou Vivo permite que você registe confirmações periódicas de bem-estar (“check-in”). Se o prazo que você definir expirar <strong>sem</strong> essa confirmação, o serviço pode, conforme a sua configuração, enviar mensagens automáticas aos <strong>contatos de confiança</strong> que você indicou, utilizando a integração com o <strong>WhatsApp</strong> por meio de sessão associada à sua conta no servidor.</p>
  <p class="muted">O aplicativo <strong>não substitui</strong> serviços de emergência, autoridades ou profissionais de saúde.</p>

  <h2>3. Dados pessoais que podemos tratar</h2>
  <ul>
    <li><strong>Dados de conta:</strong> endereço de e-mail; senha tratada com mecanismo de resumo criptográfico (hash) — não armazenamos a senha em texto puro.</li>
    <li><strong>Dados de configuração:</strong> intervalo entre check-ins, texto de alerta ou mensagem de emergência, datas ou registros de confirmação necessários ao funcionamento do serviço.</li>
    <li><strong>Contatos de confiança:</strong> nome (se fornecido) e número de telefone indicados por você para receber alertas.</li>
    <li><strong>Dados técnicos e de segurança:</strong> tokens de sessão, registros mínimos de conexão, identificadores necessários à autenticação e à prevenção de abuso, endereço IP e metadados usuais de comunicação em rede quando inevitáveis ao funcionamento do servidor.</li>
    <li><strong>WhatsApp (via Meta):</strong> o envio de mensagens ocorre por meio da infraestrutura do WhatsApp; a Meta trata dados conforme as políticas próprias do serviço, além do que for estritamente necessário no nosso servidor para manter a sessão e executar os envios que você autorizar.</li>
    <li><strong>Notificações locais:</strong> lembretes no aparelho são processados no próprio dispositivo, nos limites do sistema operacional.</li>
    <li><strong>Biometria (Face ID / impressão digital):</strong> quando você ativar, o sistema operacional pode usar dados biométricos para desbloquear o armazenamento seguro do token no aparelho; não recebemos a imagem biométrica nem armazenamos esse dado em nossos servidores.</li>
  </ul>

  <h2>4. Finalidades e bases legais (LGPD)</h2>
  <p>Tratamos dados pessoais para:</p>
  <ul>
    <li><strong>Prestação do serviço contratado ou utilizado por adesão aos termos</strong> (art. 7º, V, LGPD): criação de conta, autenticação, check-in, envio de alertas aos contatos indicados, operação do servidor e da sessão WhatsApp conforme sua configuração.</li>
    <li><strong>Legítimo interesse</strong> (art. 7º, IX), observado o equilíbrio com seus direitos: segurança da informação, prevenção a fraude e abuso, melhorias compatíveis com expectativa do usuário.</li>
    <li><strong>Consentimento</strong> (art. 7º, I), quando exigido — por exemplo, para notificações push, quando o sistema solicitar consentimento explícito, ou para funcionalidades opcionais que dependam de permissão específica.</li>
    <li><strong>Cumprimento de obrigação legal ou regulatória</strong> (art. 7º, II), quando aplicável.</li>
  </ul>

  <h2>5. Compartilhamento de dados</h2>
  <p>Não vendemos seus dados pessoais. Podemos envolver:</p>
  <ul>
    <li><strong>Meta / WhatsApp:</strong> para entrega das mensagens que você configurar.</li>
    <li><strong>Provedores de hospedagem, nuvem e conectividade</strong> que sustentam o servidor e o tráfego de dados, contratados com obrigações de confidencialidade e segurança compatíveis com a finalidade.</li>
    <li><strong>Autoridades públicas</strong>, mediante ordem judicial ou requisição legal válida.</li>
  </ul>
  <p>Há <strong>transferência internacional</strong> de dados na medida em que o WhatsApp e provedores globais processem informações fora do Brasil; recomendamos a leitura das políticas da Meta aplicáveis à sua região.</p>

  <h2>6. Prazo de conservação</h2>
  <p>Conservamos dados enquanto sua conta estiver ativa ou enquanto forem necessários para as finalidades descritas, resolução de litígios, cumprimento de obrigações legais e legítimo interesse documentado. Após exclusão da conta ou pedido fundamentado, excluímos ou anonimizamos os dados em prazo razoável, salvo retenção legal.</p>

  <h2>7. Segurança</h2>
  <p>Adotamos medidas técnicas e organizacionais adequadas ao risco, incluindo comunicação criptografada (HTTPS) na API pública, controles de acesso e boas práticas de armazenamento de credenciais. Nenhum sistema é absolutamente invulnerável.</p>

  <h2>8. Seus direitos como titular (art. 18 LGPD)</h2>
  <p>Você pode solicitar, conforme a lei:</p>
  <ul>
    <li>confirmação da existência de tratamento;</li>
    <li>acesso aos dados;</li>
    <li>correção de dados incompletos, inexatos ou desatualizados;</li>
    <li>anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
    <li>portabilidade, nas hipóteses legais;</li>
    <li>eliminação dos dados tratados com consentimento, quando aplicável;</li>
    <li>informação sobre entidades com as quais compartilhamos dados;</li>
    <li>informação sobre a possibilidade de não fornecer consentimento e sobre as consequências;</li>
    <li>revogação do consentimento, quando a base for essa.</li>
  </ul>
  <p>Para exercer direitos, utilize o e-mail de contato indicado na seção 1. Responderemos no prazo legal, podendo solicitar informações para confirmar sua identidade.</p>
  <p>Você também pode registrar reclamação à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>: <a href="https://www.gov.br/anpd" rel="noopener noreferrer">www.gov.br/anpd</a>.</p>

  <h2>9. Crianças e adolescentes</h2>
  <p>O serviço não se destina a menores de 16 anos sem o consentimento legalmente exigido (incluindo consentimento parental ou responsável, conforme o caso). Se tomarmos conhecimento de cadastro indevido, adotaremos medidas para exclusão.</p>

  <h2>10. Alterações desta política</h2>
  <p>Podemos atualizar este documento. A versão vigente estará sempre em: <a href="${esc(privacyUrl)}">${esc(privacyUrl)}</a>. Alterações relevantes podem ser comunicadas por meios razoáveis (por exemplo, aviso no aplicativo ou por e-mail).</p>

  <h2>11. Texto informativo</h2>
  <p class="muted">Este documento foi elaborado para refletir boas práticas e a LGPD, mas <strong>não substitui consulta jurídica</strong> personalizada ao seu negócio.</p>
</body>
</html>`;
}

export function termsPageHtml(origin: string): string {
  const termsUrl = `${origin}/legal/terms`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Termos e condições de uso — Estou Vivo</title>
  <style>${style}</style>
</head>
<body>
  <h1>Termos e condições de uso</h1>
  <p class="muted">Última atualização: 4 de abril de 2026 · Aplicativo: <strong>Estou Vivo</strong> · Estes termos regem o uso do aplicativo e dos serviços associados oferecidos pelo controlador identificado abaixo, em conformidade com a legislação brasileira aplicável, em especial o Código de Defesa do Consumidor (Lei nº 8.078/1990), quando você for consumidor.</p>

  <div class="box">
    <h2 style="margin-top:0;border:none">1. Partes</h2>
    ${legalIdentityBlock()}
    <p class="muted" style="margin-bottom:0">A seguir denominado <strong>“nós”</strong> ou <strong>“operador”</strong>. Você, pessoa física ou jurídica que instala e usa o app, será <strong>“usuário”</strong>.</p>
  </div>

  <h2>2. Aceitação</h2>
  <p>Ao criar conta, acessar ou usar o Estou Vivo, você declara que leu e concorda com estes Termos e com a <a href="${origin}/legal/privacy">Política de privacidade</a>. Se não concordar, não utilize o serviço.</p>

  <h2>3. Descrição do serviço</h2>
  <p>O Estou Vivo oferece ferramentas para: (i) definir intervalos de confirmação de bem-estar; (ii) receber lembretes; (iii) em caso de não confirmação dentro do prazo, disparar mensagens aos contatos que você cadastrar, <strong>mediante configuração e disponibilidade técnica</strong>, incluindo sessão WhatsApp vinculada no servidor e conectividade de rede.</p>

  <h2>4. Natureza essencial — não é serviço de emergência</h2>
  <div class="warn">
    <p style="margin:0"><strong>AVISO IMPORTANTE:</strong> O Estou Vivo <strong>não é</strong> serviço de emergência médica, policial, bombeiros ou de salvamento. <strong>Não substitui</strong> o telefone 190, 192, 193, 194 ou equivalentes. Em risco à vida, saúde ou integridade, <strong>contacte imediatamente os serviços competentes</strong>.</p>
  </div>
  <p>O funcionamento depende de fatores fora do nosso controle (rede, bateria, permissões do aparelho, políticas de terceiros, indisponibilidade do servidor ou do WhatsApp). <strong>Não garantimos</strong> que o alerta será entregue em tempo útil ou em qualquer circunstância.</p>

  <h2>5. Elegibilidade e cadastro</h2>
  <p>Você declara ter capacidade legal para contratar ou contar com autorização. As informações de cadastro devem ser verdadeiras. Você é responsável pela segurança da senha e do dispositivo.</p>

  <h2>6. Contatos de confiança e WhatsApp</h2>
  <p>Você declara possuir <strong>base legal e, quando necessário, consentimento</strong> dos números indicados para receber mensagens automáticas. O uso do WhatsApp está sujeito aos <a href="https://www.whatsapp.com/legal" rel="noopener noreferrer">termos e políticas da Meta</a>. Você é responsável por manter a sessão e as configurações compatíveis com o uso pretendido.</p>

  <h2>7. Uso permitido e proibições</h2>
  <p>É proibido: violar lei ou direitos de terceiros; usar o serviço para assédio, discriminação, spam ilícito ou conteúdo ilícito; tentar acessar contas ou sistemas de terceiros sem autorização; fazer engenharia reversa maliciosa ou sobrecarga indevida da infraestrutura; usar o app de forma que possa colocar terceiros em risco injustificado.</p>

  <h2>8. Propriedade intelectual</h2>
  <p>Marcas, layout, textos do aplicativo (exceto conteúdo gerado por você) e software licenciados permanecem de titularidade respectiva. Concedemos licença limitada, revogável e intransferível para uso do app conforme estes Termos.</p>

  <h2>9. Planos, preços e alterações</h2>
  <p>Se o serviço for gratuito ou pago, condições comerciais específicas poderão constar nas lojas de aplicativos ou em comunicação separada. Podemos alterar funcionalidades com aviso razoável quando exigido por lei ou por necessidade técnica relevante.</p>

  <h2>10. Limitação de responsabilidade</h2>
  <p>Na máxima extensão permitida pela lei aplicável, não respondemos por danos indiretos, lucros cessantes, perda de dados por culpa exclusiva do usuário ou de terceiros, ou falhas de rede e de serviços de terceiros. Em casos em que a lei não permita limitação, aplicar-se-á o limite legal correspondente.</p>

  <h2>11. Indenização</h2>
  <p>Você se obriga a nos defender e indenizar contra reclamações de terceiros decorrentes do seu uso indevido do serviço, de dados falsos ou de ausência de consentimento dos contatos cadastrados, na medida permitida pela lei.</p>

  <h2>12. Suspensão e encerramento</h2>
  <p>Podemos suspender ou encerrar contas em caso de violação destes Termos, risco à segurança ou exigência legal. Você pode encerrar o uso a qualquer momento; disposições que por natureza devam subsistir (limitação, lei aplicável) permanecem válidas.</p>

  <h2>13. Lei aplicável e foro</h2>
  <p>Estes Termos são regidos pelas leis da <strong>República Federativa do Brasil</strong>. Se você for consumidor, é assegurado o foro de seu domicílio para ações contra o fornecedor, nos termos do CDC. Na ausência de classificação como consumidor, fica eleito o foro da comarca do domicílio do operador, salvo disposição legal diversa.</p>

  <h2>14. Contato</h2>
  <p>Use o e-mail indicado na seção “Partes” para dúvidas sobre estes Termos ou a Política de privacidade.</p>

  <h2>15. Alterações dos termos</h2>
  <p>Podemos alterar este documento. A versão vigente estará em: <a href="${esc(termsUrl)}">${esc(termsUrl)}</a>. O uso continuado após a data de atualização pode constituir aceitação, quando permitido pela lei; alterações materiais podem exigir consentimento adicional conforme aplicável.</p>

  <p class="muted">Recomenda-se <strong>revisão jurídica</strong> antes da distribuição comercial em larga escala.</p>
</body>
</html>`;
}
