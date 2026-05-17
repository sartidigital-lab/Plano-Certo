import React, { useEffect, useState } from 'react';
import Home from '../pages/Home.jsx';
import { normalizePath, routes } from './routes.js';
import { getCurrentSession, subscribeToAuthChanges } from '../services/authService.js';

const publicPaths = new Set(['/', '/login', '/landing']);

export default function App() {
  const [path, setPath] = useState(normalizePath(window.location.pathname));
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const Page = routes[path] || Home;

  function navigate(nextPath) {
    const normalized = normalizePath(nextPath);
    window.history.pushState({}, '', normalized === '/' ? '/' : normalized);
    setPath(normalized);
  }

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let mounted = true;

    getCurrentSession().then((currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setAuthReady(true);
    });

    const unsubscribe = subscribeToAuthChanges((nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!session && !publicPaths.has(path)) navigate('/login');
  }, [authReady, session, path]);

  if (!authReady && !publicPaths.has(path)) {
    return <main className="loading-page"><span className="pill">Carregando acesso</span></main>;
  }

  if (!session && !publicPaths.has(path)) {
    return <Home path="/login" navigate={navigate} onSessionChange={setSession} />;
  }

  return <Page path={path} navigate={navigate} session={session} onSessionChange={setSession} />;
}
