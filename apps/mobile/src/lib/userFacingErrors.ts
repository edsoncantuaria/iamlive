/**
 * Mensagens para o usuário com próximo passo (rede / WhatsApp / servidor).
 */

function raw(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Texto para alerta quando falha envio de emergência aos contatos. */
export function emergencySendUserMessage(err: unknown): string {
  const msg = raw(err);
  const base =
    'Não foi possível enviar pelo WhatsApp agora.\n\n' +
    'O que pode fazer:\n' +
    '• Verifique Wi‑Fi ou dados móveis.\n' +
    '• Abra Estou Vivo → WhatsApp para alertas e confirme se a sessão está ligada.\n' +
    '• Tente de novo daqui a pouco.\n\n';
  return base + (msg && msg !== 'timeout' ? `Detalhe técnico: ${msg}` : '');
}

/** Texto quando falha o aviso de boas-vindas ao novo contato. */
export function welcomeSendUserMessage(err: unknown): string {
  const msg = raw(err);
  return (
    'O contato foi guardado. Não enviamos mensagem no WhatsApp desta vez.\n\n' +
    'O que pode fazer:\n' +
    '• Verifique a internet.\n' +
    '• Em Estou Vivo → WhatsApp para alertas, confirme que está conectado.\n' +
    '• Pode avisar a pessoa por fora, se quiser.\n\n' +
    (msg && msg !== 'Tempo esgotado' ? `Detalhe: ${msg}` : '')
  );
}

/** Título + corpo + dica para caixa de erro na tela WhatsApp (socket). */
export function socketErrorPresentation(errMsg: string): {
  title: string;
  detail: string;
  hint: string;
} {
  const m = (errMsg || '').toLowerCase();
  const hint =
    'Verifique a internet (Wi‑Fi ou dados). Se estiver ok, abra as configurações do celular e confirme que o app pode usar rede. ' +
    'Depois toque em “Atualizar conexão” nesta tela. Se o servidor estiver em manutenção, tente mais tarde.';

  if (m.includes('xhr poll error') || m.includes('websocket') || m.includes('network')) {
    return {
      title: 'Sem ligação ao servidor',
      detail: errMsg || 'Falha de rede.',
      hint,
    };
  }
  if (m.includes('timeout') || m.includes('timed out')) {
    return {
      title: 'Tempo esgotado',
      detail: errMsg || 'O servidor demorou a responder.',
      hint,
    };
  }
  return {
    title: 'Não foi possível ligar',
    detail: errMsg || 'Erro desconhecido.',
    hint,
  };
}
