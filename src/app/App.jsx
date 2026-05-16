import React, { useEffect, useState } from 'react';
import Home from '../pages/Home.jsx';
import { normalizePath, routes } from './routes.js';

export default function App() {
  const [path, setPath] = useState(normalizePath(window.location.pathname));
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

  return <Page path={path} navigate={navigate} />;
}
