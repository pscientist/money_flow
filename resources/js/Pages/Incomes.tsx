import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import AppShell from '../AppShell';
import {
    parseIncomes,
    type Income,
    type IncomeForm,
    type PageStatus,
} from '../types';

const emptyForm: IncomeForm = {
    description: '',
    amount: '',
    source: '',
    tax_rate: '',
    date: '',
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

function taxRate(value: string): number | null {
    const rate = Number(value);

    if (!Number.isFinite(rate) || rate < 0) {
        return null;
    }

    return rate;
}

export default function Incomes() {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [status, setStatus] = useState<PageStatus>('loading');
    const [form, setForm] = useState<IncomeForm>(emptyForm);
    // null means the form is creating a new income. A number means it is editing that row.
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saveError, setSaveError] = useState('');

    function loadIncomes(): Promise<void> {
        return fetch('/api/incomes', {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data: unknown) => {
                setIncomes(parseIncomes(data));
                setStatus('ready');
            })
            .catch(() => {
                setStatus('error');
            });
    }

    useEffect(() => {
        // Skip the response if this component unmounts before fetch finishes.
        let ignore = false;

        fetch('/api/incomes', {
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
                    setIncomes(parseIncomes(data));
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

        if (name === 'description' || name === 'amount' || name === 'source' 
            || name === 'tax_rate' || name === 'date') {
            setForm((current) => ({ ...current, [name]: value }));
        }
    }

    function startEdit(income: Income) {
        setEditingId(income.id);
        setSaveError('');
        setForm({
            description: income.description,
            amount: (income.amount_cents / 100).toFixed(2),
            source: income.source,
            tax_rate: String(income.tax_rate),
            date: income.date,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setSaveError('');
        setForm(emptyForm);
    }

    function saveIncome(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const amountCents = dollarsToCents(form.amount);
        const rate = taxRate(form.tax_rate);

        if (amountCents === null) {
            setSaveError('Enter an amount greater than zero.');

            return;
        }

        if (rate === null) {
            setSaveError('Enter a tax rate of zero or more.');

            return;
        }

        const payload = {
            description: form.description,
            amount_cents: amountCents,
            source: form.source,
            tax_rate: rate,
            date: form.date,
        };

        // Same form: POST creates a row, PATCH updates the one being edited.
        const url = editingId
            ? `/api/incomes/${editingId}`
            : '/api/incomes';

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

                // save to database
                await loadIncomes();
            })
            .catch(() => {
                setSaveError('Could not save this income.');
            });
    }

    function deleteIncome(income: Income) {
        if (!window.confirm(`Delete ${income.description}?`)) {
            return;
        }

        fetch(`/api/incomes/${income.id}`, {
            method: 'DELETE',
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                if (editingId === income.id) {
                    cancelEdit();
                }
                
                return loadIncomes();
            })
            .catch(() => {
                setSaveError('Could not delete this income.');
            });
    }

    return (
        <AppShell current="income">
        <main className="costs">
            <a className="back-link" href="/">Back</a>
            <h1>Income</h1>

            <form className="cost-form" onSubmit={saveIncome}>
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
                    Source
                    <input name="source" value={form.source} onChange={updateField} required />
                </label>
                <label>
                    Tax rate
                    <input
                        name="tax_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.tax_rate}
                        onChange={updateField}
                        required
                    />
                </label>
                <label>
                    Date
                    <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={updateField}
                        required
                    />
                </label>
                <div className="form-actions">
                    <button type="submit">{editingId ? 'Save changes' : 'Add income'}</button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit}>Cancel</button>
                    )}
                </div>
                {saveError && <p className="form-error">{saveError}</p>}
            </form>

            {status === 'loading' && <p>Loading…</p>}
            {status === 'error' && <p>Could not load income.</p>}
            {status === 'ready' && incomes.length === 0 && <p>No income yet.</p>}
            {status === 'ready' && incomes.length > 0 && (
                <ul className="cost-list">
                    {incomes.map((income) => (
                        <li key={income.id}>
                            <div>
                                <p className="cost-name">{income.description}</p>
                                <p className="cost-meta">
                                    {centsToDollars(income.amount_cents)}
                                    {' · '}
                                    {income.source}
                                    {' · '}
                                    {income.tax_rate}
                                    {' · '}
                                    {income.date}
                                </p>
                            </div>
                            <div className="row-actions">
                                <button type="button" onClick={() => startEdit(income)}>Edit</button>
                                <button type="button" onClick={() => deleteIncome(income)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
        </AppShell>
    );
}
