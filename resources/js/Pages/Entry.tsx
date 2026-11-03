import { useEffect, useState } from 'react';
import AppShell from '../AppShell';
import { parseRecurringCosts, type PageStatus, type RecurringCost } from '../types';

type AccountResponse = {
    balance: number;
};

function parseAccount(data: unknown): AccountResponse {
    if (typeof data !== 'object' || data === null || !('balance' in data)) {
        throw new Error('Unexpected response');
    }

    const { balance } = data;

    if (typeof balance !== 'number') {
        throw new Error('Unexpected response');
    }

    return { balance };
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
            <path d="M2.5 6.5h11M5.5 2.5v2M10.5 2.5v2" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 3.5h1.5l1.2 6.2h6.6l1.2-4.2H5" />
            <circle cx="6.5" cy="12.5" r="0.8" />
            <circle cx="11" cy="12.5" r="0.8" />
        </svg>
    );
}

function CoinsIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <ellipse cx="8" cy="5" rx="4.5" ry="2" />
            <path d="M3.5 5v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2V5" />
            <path d="M3.5 8v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2V8" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg className="chevron" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" />
        </svg>
    );
}

function Sparkline() {
    return (
        <svg className="sparkline" viewBox="0 0 180 72" aria-hidden="true">
            <path d="M4 52c18-4 28-18 42-20 16-2 22 14 38 12 14-2 22-24 36-28 12-4 28 6 52 2" />
            <circle cx="168" cy="18" r="4" />
        </svg>
    );
}

function formatDue(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');

    if (!year || !month || !day) {
        return isoDate;
    }

    return `${day}/${month}/${year.slice(2)}`;
}

function formatCents(cents: number): string {
    return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

export default function Entry() {
    const [balance, setBalance] = useState<number | null>(null);
    const [status, setStatus] = useState<PageStatus>('loading');
    const [upcoming, setUpcoming] = useState<RecurringCost[]>([]);
    const [upcomingStatus, setUpcomingStatus] = useState<PageStatus>('loading');

    useEffect(() => {
        let ignore = false;

        fetch('/api/account', { headers: { Accept: 'application/json' } })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data: unknown) => {
                if (!ignore) {
                    setBalance(parseAccount(data).balance);
                    setStatus('ready');
                }
            })
            .catch(() => {
                if (!ignore) {
                    setStatus('error');
                }
            });

        fetch('/api/recurring-costs', { headers: { Accept: 'application/json' } })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data: unknown) => {
                if (!ignore) {
                    setUpcoming(parseRecurringCosts(data).slice(0, 3));
                    setUpcomingStatus('ready');
                }
            })
            .catch(() => {
                if (!ignore) {
                    setUpcomingStatus('error');
                }
            });

        return () => {
            ignore = true;
        };
    }, []);

    const amount = status === 'loading'
        ? 'Loading…'
        : status === 'error' || balance === null
            ? 'Unavailable'
            : balance.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            });

    return (
        <AppShell current="dashboard">
        <main className="entry">
            <div className="entry-body">
                <section className="balance-card" aria-label="Current account balance">
                    <div className="balance-top">
                        <div>
                            <p className="balance-label">Account balance</p>
                            <p className="balance-amount">{amount}</p>
                        </div>
                        <Sparkline />
                    </div>
                    {upcomingStatus === 'loading' && <p className="upcoming-note">Loading upcoming payments…</p>}
                    {upcomingStatus === 'error' && <p className="upcoming-note">Could not load upcoming payments.</p>}
                    {upcomingStatus === 'ready' && upcoming.length === 0 && (
                        <p className="upcoming-note">No automatic payments scheduled.</p>
                    )}
                    {upcomingStatus === 'ready' && upcoming.length > 0 && (
                        <ul className="upcoming">
                            {upcoming.map((cost, index) => (
                                <li key={cost.id}>
                                    <CalendarIcon />
                                    <span>
                                        {index === 0 ? 'Next automatic payment' : 'Automatic payment'}
                                        {` on ${formatDue(cost.next_due_on)}: ${formatCents(cost.amount_cents)} for ${cost.name}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <nav className="actions" aria-label="Add an entry">
                    <a href="/recurring-costs">
                        <span className="action-icon action-icon-calendar"><CalendarIcon /></span>
                        <span>
                            <span className="action-label">Recurring fixed</span>
                            <span className="action-detail">Bills that return on a schedule.</span>
                        </span>
                        <ChevronIcon />
                    </a>
                    <div className="action-group">
                        <a href="/casual-spends">
                            <span className="action-icon action-icon-cart"><CartIcon /></span>
                            <span>
                                <span className="action-label">Casual spend</span>
                                <span className="action-detail">One-off purchases.</span>
                            </span>
                            <ChevronIcon />
                        </a>
                        <p className="streak">0-day streak. Log a casual spend today to start one.</p>
                    </div>
                    <a href="/income">
                        <span className="action-icon action-icon-coins"><CoinsIcon /></span>
                        <span>
                            <span className="action-label">Income</span>
                            <span className="action-detail">Money coming in.</span>
                        </span>
                        <ChevronIcon />
                    </a>
                </nav>
            </div>
        </main>
        </AppShell>
    );
}
