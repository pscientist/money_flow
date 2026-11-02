import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import AppShell from '../AppShell';
import {
    parseCasualSpends,
    type CasualSpend,
    type CasualSpendForm,
    type PageStatus,
} from '../types';

const emptyForm: CasualSpendForm = {
    description: '',
    amount: '',
    category: '',
    spent_on: '',
};

// The amount field is dollars as typed. The API stores integer cents.
function dollarsToCents(value: string): number | null {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
        return null;
    }

    return Math.round(amount * 100);
}

function centsToDollars(cents: number): string {
    return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}

export default function CasualSpends() {
    const [spends, setSpends] = useState<CasualSpend[]>([]);
    const [status, setStatus] = useState<PageStatus>('loading');
    const [form, setForm] = useState<CasualSpendForm>(emptyForm);
    // null means the form is creating a new spend. A number means it is editing that row.
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saveError, setSaveError] = useState('');

    function loadSpends(): Promise<void> {
        return fetch('/api/casual-spends', {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data: unknown) => {
                setSpends(parseCasualSpends(data));
                setStatus('ready');
            })
            .catch(() => {
                setStatus('error');
            });
    }

    useEffect(() => {
        // Skip the response if this component unmounts before fetch finishes.
        let ignore = false;

        fetch('/api/casual-spends', {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data: unknown) => {
                if (!ignore) {
                    setSpends(parseCasualSpends(data));
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

    function updateField(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        if (name === 'description' || name === 'amount' || name === 'category' || name === 'spent_on') {
            setForm((current) => ({ ...current, [name]: value }));
        }
    }

    function startEdit(spend: CasualSpend) {
        setEditingId(spend.id);
        setSaveError('');
        setForm({
            description: spend.description,
            amount: (spend.amount_cents / 100).toFixed(2),
            category: spend.category,
            spent_on: spend.spent_on,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setSaveError('');
        setForm(emptyForm);
    }

    function saveSpend(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const amountCents = dollarsToCents(form.amount);

        if (amountCents === null) {
            setSaveError('Enter an amount greater than zero.');

            return;
        }

        const payload = {
            description: form.description,
            amount_cents: amountCents,
            category: form.category,
            spent_on: form.spent_on,
        };

        // Same form: POST creates a row, PATCH updates the one being edited.
        const url = editingId
            ? `/api/casual-spends/${editingId}`
            : '/api/casual-spends';

        fetch(url, {
            method: editingId ? 'PATCH' : 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                setSaveError('');
                setEditingId(null);
                setForm(emptyForm);

                // load the casual spends
                await loadSpends();
            })
            .catch(() => {
                setSaveError('Could not save this spend.');
            });
    }

    function deleteSpend(spend: CasualSpend) {
        if (!window.confirm(`Delete ${spend.description}?`)) {
            return;
        }

        fetch(`/api/casual-spends/${spend.id}`, {
            method: 'DELETE',
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                if (editingId === spend.id) {
                    cancelEdit();
                }

                return loadSpends();
            })
            .catch(() => {
                setSaveError('Could not delete this spend.');
            });
    }

    return (
        <AppShell current="casual">
        <main className="costs">
            <a className="back-link" href="/">Back</a>
            <h1>Casual spend</h1>

            <form className="cost-form" onSubmit={saveSpend}>
                <label>
                    Description
                    <input name="description" value={form.description} onChange={updateField} required />
                </label>
                <label>
                    Amount
                    <input
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.amount}
                        onChange={updateField}
                        required
                    />
                </label>
                <label>
                    Category
                    <input name="category" value={form.category} onChange={updateField} required />
                </label>
                <label>
                    Date
                    <input
                        name="spent_on"
                        type="date"
                        value={form.spent_on}
                        onChange={updateField}
                        required
                    />
                </label>
                <div className="form-actions">
                    <button type="submit">{editingId ? 'Save changes' : 'Add spend'}</button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit}>Cancel</button>
                    )}
                </div>
                {saveError && <p className="form-error">{saveError}</p>}
            </form>

            {status === 'loading' && <p>Loading…</p>}
            {status === 'error' && <p>Could not load casual spends.</p>}
            {status === 'ready' && spends.length === 0 && <p>No casual spends yet.</p>}
            {status === 'ready' && spends.length > 0 && (
                <ul className="cost-list">
                    {spends.map((spend) => (
                        <li key={spend.id}>
                            <div>
                                <p className="cost-name">{spend.description}</p>
                                <p className="cost-meta">
                                    {centsToDollars(spend.amount_cents)}
                                    {' · '}
                                    {spend.category}
                                    {' · '}
                                    {spend.spent_on}
                                </p>
                            </div>
                            <div className="row-actions">
                                <button type="button" onClick={() => startEdit(spend)}>Edit</button>
                                <button type="button" onClick={() => deleteSpend(spend)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
        </AppShell>
    );
}
