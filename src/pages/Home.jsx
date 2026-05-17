import { useState } from 'react';
import AppLink from '../components/navigation/AppLink.jsx';
import Brand from '../components/navigation/Brand.jsx';
import { getRuntimeDataMode } from '../services/dataModeService.js';

export default function Home({ navigate }) {
  const dataMode = getRuntimeDataMode();
  const [email, setEmail] = useState('operacao@planocerto.com.br');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  function enterWorkspace(event) {
    event.preventDefault();
    window.localStorage.setItem('plano-certo-session', JSON.stringify({
      email,
      remember,
      signedInAt: new Date().toISOString(),
    }));
    navigate('/dashboard');
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
              <p className="muted">Use o acesso demo para entrar no workspace enquanto a autenticacao final e configurada.</p>
            </div>

            <label className="field">
              <span>Email</span>
              <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>

            <label className="field">
              <span>Senha</span>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Acesso demo" />
            </label>

            <label className="check-control">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>Manter este dispositivo conectado</span>
            </label>

            <button className="btn btn--primary login-submit" type="submit">Entrar no dashboard</button>

            <div className="login-shortcuts" aria-label="Atalhos do produto">
              <AppLink to="/agentes" navigate={navigate}>Agentes</AppLink>
              <AppLink to="/catalogo" navigate={navigate}>Catalogo</AppLink>
              <AppLink to="/ans" navigate={navigate}>Base ANS</AppLink>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
