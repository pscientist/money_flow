import { useEffect, useState } from 'react';

function PlusIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2.5v11M2.5 8h11" />
        </svg>
    );
}

export default function Entry() {
    const [balance, setBalance] = useState(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let ignore = false;

        fetch('/api/account')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data) => {
                if (!ignore) {
                    setBalance(data.balance);
                    setStatus('ready');
                }
            })
            .catch(() => {
                if (!ignore) {
                    setStatus('error');
                }
            });

        return () => {
            ignore = true;
        };
    }, []);

    const amount = status === 'loading'
        ? 'Loading…'
        : status === 'error'
            ? 'Unavailable'
            : Number(balance).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            });

    return (
        <main className="entry">
            <section className="balance" aria-label="Current account balance">
                <p className="balance-label">Account balance</p>
                <p className="balance-amount">{amount}</p>
            </section>

            <nav className="actions" aria-label="Add an entry">
                <button type="button">
                    <PlusIcon />
                    Recurring fixed
                </button>
                <button type="button">
                    <PlusIcon />
                    Casual spend
                </button>
                <button type="button">
                    <PlusIcon />
                    Income
                </button>
            </nav>
        </main>
    );
}
