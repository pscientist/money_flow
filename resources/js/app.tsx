import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import Entry from './Pages/Entry';
import RecurringCosts from './Pages/RecurringCosts';
import Section from './Pages/Section';

const root = document.getElementById('app');

if (!root) {
    throw new Error('Missing app root');
}

const pages: Record<string, ReactNode> = {
    '/': <Entry />,
    '/recurring-costs': <RecurringCosts />,
    '/income': <Section current="income" title="Income" detail="Money coming in will be listed here." />,
    '/goals': <Section current="goals" title="Goals" detail="Savings goals will be listed here." />,
    '/learn': <Section current="learn" title="Learn" detail="Short guides will be listed here." />,
};

createRoot(root).render(pages[window.location.pathname] ?? <Entry />);
