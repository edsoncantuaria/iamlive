/** Texto amigável para o prazo do link (PT-BR). */
export function formatPasswordResetTtl(ms: number): string {
  const m = Math.max(1, Math.round(ms / 60000));
  if (m < 60) return m === 1 ? '1 hora' : `${m} minutos`;
  const h = Math.round(m / 60);
  return h === 1 ? '1 hora' : `${h} horas`;
}

function escAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * HTML para clientes de e-mail: estilos inline, tabela simples, botão com fallback de link.
 */
export function buildPasswordResetEmailContent(
  resetUrl: string,
  ttlLabel: string,
): { html: string; text: string } {
  const href = escAttr(resetUrl);
  const text =
    `Estou Vivo — redefinir senha\n\n` +
    `Recebemos um pedido para criar uma nova senha na sua conta.\n\n` +
    `Abra este link no telemóvel ou computador (válido por ${ttlLabel}):\n${resetUrl}\n\n` +
    `Se não foi você, pode ignorar este e-mail — a sua palavra-passe atual mantém-se.\n\n` +
    `— Equipa Estou Vivo`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>Redefinir senha</title>
</head>
<body style="margin:0;padding:0;background-color:#e8f4f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#e8f4f3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(5,42,44,0.12);">
          <tr>
            <td bgcolor="#052a2c" style="background:linear-gradient(145deg,#0f766e 0%,#0d5c59 45%,#052a2c 100%);padding:36px 40px 28px;text-align:center;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.15);line-height:56px;font-size:28px;margin-bottom:12px;">✓</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Estou Vivo</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.88);font-size:15px;line-height:1.45;">Redefinição de palavra-passe</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 8px;">
              <p style="margin:0 0 16px;color:#134e4a;font-size:16px;line-height:1.6;">Olá,</p>
              <p style="margin:0 0 20px;color:#0f172a;font-size:16px;line-height:1.65;">
                Recebemos um pedido para <strong style="color:#0f766e;">criar uma nova palavra-passe</strong> na sua conta.
                Toque no botão aberto para continuar — o link é válido por <strong>${escAttr(ttlLabel)}</strong>.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 24px;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(180deg,#14b8a6,#0d9488);box-shadow:0 4px 14px rgba(13,148,136,0.35);">
                    <a href="${href}" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;border-radius:12px;">Redefinir palavra-passe</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.5;">
                Se o botão não funcionar, copie e cole este endereço no navegador:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;font-size:13px;line-height:1.5;">
                <a href="${href}" style="color:#0d9488;">${escAttr(resetUrl)}</a>
              </p>
              <div style="border-top:1px solid #e2e8f0;padding-top:24px;margin-top:8px;">
                <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.55;">
                  Se <strong>não foi você</strong> a pedir esta alteração, ignore este e-mail — a sua palavra-passe atual mantém-se segura.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;color:#cbd5e1;font-size:12px;text-align:center;">
                Mensagem automática · Estou Vivo
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}
