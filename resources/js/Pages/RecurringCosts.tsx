import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import AppShell from '../AppShell';
import {
    parseRecurringCosts,
    type Interval,
    type PageStatus,
    type RecurringCost,
    type RecurringCostForm,
} from '../types';

const emptyForm: RecurringCostForm = {
    name: '',
    amount: '',
    interval: 'monthly',
    next_due_on: '',
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

export default function RecurringCosts() {
    const [costs, setCosts] = useState<RecurringCost[]>([]);
    const [status, setStatus] = useState<PageStatus>('loading');
    const [form, setForm] = useState<RecurringCostForm>(emptyForm);
    // null means the form is creating a new cost. A number means it is editing that row.
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saveError, setSaveError] = useState('');

    function loadCosts(): Promise<void> {
        return fetch('/api/recurring-costs', {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data: unknown) => {
                setCosts(parseRecurringCosts(data));
                setStatus('ready');
            })
            .catch(() => {
                setStatus('error');
            });
    }

    useEffect(() => {
        // Skip the response if this component unmounts before fetch finishes.
        let ignore = false;

        fetch('/api/recurring-costs', {
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
                    setCosts(parseRecurringCosts(data));
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

    function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = event.target;

        // A select's value is a plain string, so narrow it to the Interval union.
        if (name === 'interval') {
            setForm((current) => ({ ...current, interval: value as Interval }));

            return;
        }

        if (name === 'name' || name === 'amount' || name === 'next_due_on') {
            setForm((current) => ({ ...current, [name]: value }));
        }
    }

    function startEdit(cost: RecurringCost) {
        setEditingId(cost.id);
        setSaveError('');
        setForm({
            name: cost.name,
            amount: (cost.amount_cents / 100).toFixed(2),
            interval: cost.interval,
            next_due_on: cost.next_due_on,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setSaveError('');
        setForm(emptyForm);
    }

    function saveCost(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const amountCents = dollarsToCents(form.amount);

        if (amountCents === null) {
            setSaveError('Enter an amount greater than zero.');

            return;
        }

        const payload = {
            name: form.name,
            amount_cents: amountCents,
            interval: form.interval,
            next_due_on: form.next_due_on,
        };

        // Same form: POST creates a row, PATCH updates the one being edited.
        const url = editingId
            ? `/api/recurring-costs/${editingId}`
            : '/api/recurring-costs';

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
                await loadCosts();
            })
            .catch(() => {
                setSaveError('Could not save this cost.');
            });
    }

    function uploadReceipt(event: FormEvent<HTMLFormElement>, cost: RecurringCost) {
        event.preventDefault();

        const formElement = event.currentTarget;
        const body = new FormData(formElement);
        const file = body.get('receipt');

        if (!(file instanceof File) || file.size === 0) {
            setSaveError('Choose a receipt file.');

            return;
        }

        // Leave Content-Type unset so the browser adds the multipart boundary.
        fetch(`/api/recurring-costs/${cost.id}/receipt`, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                formElement.reset();
                setSaveError('');
                await loadCosts();
            })
            .catch(() => {
                setSaveError('Could not upload this receipt.');
            });
    }

    function viewReceipt(cost: RecurringCost) {
        fetch(`/api/recurring-costs/${cost.id}/receipt`, {
            headers: { Accept: 'application/json' },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                const data: unknown = await response.json();

                if (typeof data !== 'object' || data === null) {
                    throw new Error('Unexpected response');
                }

                const url = (data as Record<string, unknown>).url;

                if (typeof url !== 'string' || url === '') {
                    throw new Error('Unexpected response');
                }

                window.open(url, '_blank', 'noopener');
            })
            .catch(() => {
                setSaveError('Could not open this receipt.');
            });
    }

    function deleteCost(cost: RecurringCost) {
        if (!window.confirm(`Delete ${cost.name}?`)) {
            return;
        }

        fetch(`/api/recurring-costs/${cost.id}`, {
            method: 'DELETE',
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                if (editingId === cost.id) {
                    cancelEdit();
                }

                // loadCosts() returns a promise. 
                // Returning it here makes .catch() below run
                //  if the reload fails.
                return loadCosts();
            })
            .catch(() => {
                setSaveError('Could not delete this cost.');
            });
    }

    return (
        <AppShell current="expenses">
        <main className="costs">
            <a className="back-link" href="/">Back</a>
            <h1>Recurring costs</h1>

            <form className="cost-form" onSubmit={saveCost}>
                <label>
                    Name
                    <input name="name" value={form.name} onChange={updateField} required />
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
                    Repeats
                    <select name="interval" value={form.interval} onChange={updateField}>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </label>
                <label>
                    Next due
                    <input
                        name="next_due_on"
                        type="date"
                        value={form.next_due_on}
                        onChange={updateField}
                        required
                    />
                </label>
                <div className="form-actions">
                    <button type="submit">{editingId ? 'Save changes' : 'Add cost'}</button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit}>Cancel</button>
                    )}
                </div>
                {saveError && <p className="form-error">{saveError}</p>}
            </form>

            {status === 'loading' && <p>Loading…</p>}
            {status === 'error' && <p>Could not load recurring costs.</p>}
            {status === 'ready' && costs.length === 0 && <p>No recurring costs yet.</p>}
            {status === 'ready' && costs.length > 0 && (
                <ul className="cost-list">
                    {costs.map((cost) => (
                        <li key={cost.id}>
                            <div>
                                <p className="cost-name">{cost.name}</p>
                                <p className="cost-meta">
                                    {centsToDollars(cost.amount_cents)}
                                    {' · '}
                                    {cost.interval}
                                    {' · '}
                                    {cost.next_due_on}
                                </p>
                            </div>
                            <form className="receipt-form" onSubmit={(event) => uploadReceipt(event, cost)}>
                                <input
                                    type="file"
                                    name="receipt"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    aria-label={`Receipt for ${cost.name}`}
                                />
                                <button type="submit">Upload receipt</button>
                                {cost.receipt_path && (
                                    <button type="button" onClick={() => viewReceipt(cost)}>
                                        View receipt
                                    </button>
                                )}
                            </form>
                            <div className="row-actions">
                                <button type="button" onClick={() => startEdit(cost)}>Edit</button>
                                <button type="button" onClick={() => deleteCost(cost)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
        </AppShell>
    );
}
