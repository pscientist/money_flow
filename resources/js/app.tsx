import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import CasualSpends from './Pages/CasualSpends';
import Entry from './Pages/Entry';
import Incomes from './Pages/Incomes';
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
};

createRoot(root).render(pages[window.location.pathname] ?? <Entry />);
