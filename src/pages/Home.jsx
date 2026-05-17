import { useState } from 'react';
import Brand from '../components/navigation/Brand.jsx';
import { createDemoSession, signInWithEmail } from '../services/authService.js';
import { getRuntimeDataMode } from '../services/dataModeService.js';

export default function Home({ navigate, onSessionChange }) {
  const dataMode = getRuntimeDataMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function enterWorkspace(event) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const nextSession = await signInWithEmail(email, password);
      onSessionChange?.(nextSession);
      navigate('/dashboard');
    } catch (error) {
      setStatus('error');
      setMessage(formatAuthError(error));
    }
  }

  function enterDemo(nextPath = '/dashboard') {
    const nextSession = createDemoSession(email || 'operacao@planocerto.com.br', remember);
    onSessionChange?.(nextSession);
    navigate(nextPath);
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Acesso ao Plano Certo">
        <div className="login-brand">
          <Brand navigate={navigate} />
          <span className={`status ${dataMode.mode === 'supabase-configured' ? 'status--success' : 'status--warn'}`}>
            {dataMode.mode === 'supabase-configured' ? 'Dados conectados' : 'Modo demo'}
          </span>
        </div>

        <div className="login-layout">
          <section className="login-copy">
            <p className="eyebrow">Console operacional</p>
            <h1>Entre para priorizar leads, revisar agentes e acompanhar propostas.</h1>
            <p className="lede">A primeira tela agora abre como produto: foco em rotina comercial, fila de atendimento, governanca dos agentes e base de planos.</p>
            <div className="login-metrics" aria-label="Resumo da operacao">
              <div><strong>42</strong><span>leads qualificados</span></div>
              <div><strong>4</strong><span>agentes ativos</span></div>
              <div><strong>3</strong><span>tabelas vigentes</span></div>
            </div>
          </section>

          <form className="login-panel" onSubmit={enterWorkspace}>
            <div>
              <p className="eyebrow">Acesso</p>
              <h2>Plano Certo</h2>
              <p className="muted">Entre com a conta da corretora ou use o modo demo enquanto os usuarios finais sao provisionados.</p>
            </div>

            <label className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="voce@corretora.com.br" required />
            </label>

            <label className="field">
              <span>Senha</span>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Sua senha" required />
            </label>

            <label className="check-control">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>Manter este dispositivo conectado</span>
            </label>

            {message && <p className="form-message" role="alert">{message}</p>}

            <button className="btn btn--primary login-submit" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Entrando...' : 'Entrar no dashboard'}
            </button>
            <button className="btn login-submit" type="button" onClick={() => enterDemo()}>Usar modo demo</button>

            <div className="login-shortcuts" aria-label="Atalhos do produto">
              <button type="button" onClick={() => enterDemo('/agentes')}>Agentes</button>
              <button type="button" onClick={() => enterDemo('/catalogo')}>Catalogo</button>
              <button type="button" onClick={() => enterDemo('/ans')}>Base ANS</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function formatAuthError(error) {
  const message = error?.message || '';
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'Nao foi possivel conectar ao Supabase Auth agora. Use o modo demo ou tente novamente em instantes.';
  }
  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Email ou senha invalidos. Confira os dados ou use o modo demo.';
  }
  return 'Nao foi possivel entrar. Confira email e senha ou use o modo demo.';
}
