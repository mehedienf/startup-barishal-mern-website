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
import './index.css';

const router = createBrowserRouter([
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
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);