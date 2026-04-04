/** Página web para definir nova senha (abre a partir do link do e-mail). */
export function passwordResetPageHtml(publicOrigin: string, tokenFromQuery: string): string {
  const safeToken = tokenFromQuery.replace(/[<>&"']/g, '');
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Redefinir senha — Estou Vivo</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(165deg, #e8f4f3 0%, #ccfbf1 40%, #99f6e4 100%);
      color: #0f172a;
    }
    .wrap { max-width: 26rem; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
    .card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 16px 48px rgba(5, 42, 44, 0.12);
      overflow: hidden;
    }
    .head {
      background: linear-gradient(145deg, #0f766e 0%, #0d5c59 45%, #052a2c 100%);
      color: #fff;
      padding: 1.75rem 1.5rem 1.5rem;
      text-align: center;
    }
    .head h1 { margin: 0; font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; }
    .head p { margin: 0.5rem 0 0; font-size: 0.9rem; opacity: 0.9; line-height: 1.45; }
    .body { padding: 1.75rem 1.5rem 1.5rem; }
    .body > p { margin: 0 0 1.25rem; font-size: 0.95rem; line-height: 1.55; color: #334155; }
    label { display: block; margin-top: 1rem; font-weight: 600; font-size: 0.85rem; color: #134e4a; }
    input {
      width: 100%;
      padding: 0.7rem 0.85rem;
      margin-top: 0.35rem;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      font-size: 1rem;
    }
    input:focus { outline: none; border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2); }
    button {
      margin-top: 1.5rem;
      width: 100%;
      padding: 0.85rem;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      background: linear-gradient(180deg, #14b8a6, #0d9488);
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
    }
    button:active { transform: translateY(1px); }
    .err { color: #b91c1c; margin-top: 0.85rem; font-size: 0.9rem; }
    .ok { color: #0f766e; margin-top: 0.85rem; font-weight: 600; }
    .foot { margin-top: 1.5rem; font-size: 0.85rem; text-align: center; }
    a { color: #0d9488; font-weight: 500; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="head">
        <h1>Estou Vivo</h1>
        <p>Nova palavra-passe</p>
      </div>
      <div class="body">
        <p>Escolha uma palavra-passe com pelo menos 8 caracteres. Depois pode voltar a entrar na app.</p>
        <form id="f">
          <label for="tok">Código do link</label>
          <input id="tok" name="token" type="text" value="${safeToken}" required autocomplete="off"/>
          <label for="pw">Nova palavra-passe</label>
          <input id="pw" name="password" type="password" minlength="8" required autocomplete="new-password"/>
          <button type="submit">Guardar</button>
        </form>
        <p class="foot"><a href="${publicOrigin}/legal/privacy">Política de privacidade</a></p>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('f').addEventListener('submit', async function(e) {
      e.preventDefault();
      const fd = new FormData(this);
      const body = { token: fd.get('token'), password: fd.get('password') };
      const res = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await res.json().catch(function() { return {}; });
      var msg = document.getElementById('msg');
      if (!msg) { msg = document.createElement('div'); msg.id = 'msg'; this.appendChild(msg); }
      msg.className = res.ok ? 'ok' : 'err';
      msg.textContent = res.ok ? 'Palavra-passe atualizada. Já pode abrir a app e entrar.' : (j.error || 'Não foi possível redefinir.');
    });
  </script>
</body>
</html>`;
}
