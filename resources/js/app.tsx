import { createRoot } from 'react-dom/client';
import Entry from './Pages/Entry';
import RecurringCosts from './Pages/RecurringCosts';

const root = document.getElementById('app');

if (!root) {
    throw new Error('Missing app root');
}

const page = window.location.pathname === '/recurring-costs'
    ? <RecurringCosts />
    : <Entry />;

createRoot(root).render(page);
