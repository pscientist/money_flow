import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import CasualSpends from './Pages/CasualSpends';
import Entry from './Pages/Entry';
import Incomes from './Pages/Incomes';
import Login from './Pages/Login';
import Profile from './Pages/Profile';
import RecurringCosts from './Pages/RecurringCosts';
import Section from './Pages/Section';

const root = document.getElementById('app');

if (!root) {
    throw new Error('Missing app root');
}

const pages: Record<string, ReactNode> = {
    '/': <Entry />,
    '/recurring-costs': <RecurringCosts />,
    '/casual-spends': <CasualSpends />,
    '/income': <Incomes />,
    '/goals': <Section current="goals" title="Goals" detail="Savings goals will be listed here." />,
    '/learn': <Section current="learn" title="Learn" detail="Short guides will be listed here." />,
    '/login': <Login />,
    '/profile': <Profile />,
};

const privatePaths = ['/', '/casual-spends', '/income', '/recurring-costs', '/profile'];
const path = window.location.pathname;
// An unknown address renders the dashboard, so it is private too.
const isPrivatePage = privatePaths.includes(path) || !(path in pages);

if (!localStorage.getItem('token') && isPrivatePage) {
    window.location.replace('/login');
} else {
    createRoot(root).render(pages[path] ?? <Entry />);
}
