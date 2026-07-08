import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './components/Dashboard.jsx';
import TeamPage from './components/TeamPage.jsx';
import EventsPage from './components/EventsPage.jsx';
import ProgramsPage from './components/ProgramsPage.jsx';
import ContactsPage from './components/ContactsPage.jsx';
import ApplicationsPage from './components/ApplicationsPage.jsx';
import SubscribersPage from './components/SubscribersPage.jsx';
import PartnersPage from './components/PartnersPage.jsx';
import MembershipsPage from './components/MembershipsPage.jsx';
import FeaturedImagesPage from './components/FeaturedImagesPage.jsx';
import HomeStatsPage from './components/HomeStatsPage.jsx';
import './index.css';

// No `basename` — the admin SPA is hosted at the subdomain root (e.g.
// https://admin.site.com/), so routes live at `/`, `/team`, `/events`, etc.
// `import.meta.env.BASE_URL` reflects Vite's `base` config (which we set
// to `/`), so this also keeps the router matching the served URL whether
// the bundle is loaded from `/` or any sub-path during local dev.
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'team', element: <TeamPage /> },
        { path: 'events', element: <EventsPage /> },
        { path: 'programs', element: <ProgramsPage /> },
        { path: 'contacts', element: <ContactsPage /> },
        { path: 'applications', element: <ApplicationsPage /> },
        { path: 'subscribers', element: <SubscribersPage /> },
        { path: 'partners', element: <PartnersPage /> },
        { path: 'memberships', element: <MembershipsPage /> },
        { path: 'featured', element: <FeaturedImagesPage /> },
        { path: 'home-stats', element: <HomeStatsPage /> },
        // Catch-all so an unmatched admin URL still renders the chrome
        // instead of leaving a blank page.
        { path: '*', element: <Dashboard /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);