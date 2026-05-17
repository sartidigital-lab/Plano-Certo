import Dashboard from '../pages/Dashboard.jsx';
import DesktopApp from '../pages/DesktopApp.jsx';
import Home from '../pages/Home.jsx';
import Inbox from '../pages/Inbox.jsx';
import Landing from '../pages/Landing.jsx';
import AgentConsole from '../pages/AgentConsole.jsx';
import AnsBase from '../pages/AnsBase.jsx';
import AssistedQuote from '../pages/AssistedQuote.jsx';
import Lead360 from '../pages/Lead360.jsx';
import PlanCatalog from '../pages/PlanCatalog.jsx';
import PriceTables from '../pages/PriceTables.jsx';
import MobileAndroid from '../pages/MobileAndroid.jsx';
import Outbound from '../pages/Outbound.jsx';
import Pipeline from '../pages/Pipeline.jsx';
import Widgets from '../pages/Widgets.jsx';

export const routes = {
  '/': Home,
  '/login': Home,
  '/landing': Landing,
  '/dashboard': Dashboard,
  '/inbox': Inbox,
  '/outbound': Outbound,
  '/pipeline': Pipeline,
  '/agentes': AgentConsole,
  '/lead-360': Lead360,
  '/cotacao': AssistedQuote,
  '/catalogo': PlanCatalog,
  '/tabelas': PriceTables,
  '/ans': AnsBase,
  '/mobile': MobileAndroid,
  '/desktop': DesktopApp,
  '/widgets': Widgets,
};

export function normalizePath(path) {
  const clean = path.replace(/\.html$/, '');
  if (clean === '/index') return '/';
  if (clean === '/mobile-android') return '/mobile';
  if (clean === '/desktop-app') return '/desktop';
  return clean || '/';
}
