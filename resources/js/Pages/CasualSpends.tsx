import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import AppShell from '../AppShell';
import {
    parseCasualSpends,
    type CasualSpend,
    type CasualSpendForm,
    type PageStatus,
} from '../types';

function blankForm(spentOn: string): CasualSpendForm {
    return {
        description: '',
        amount: '',
        category: '',
        spent_on: spentOn,
    };
}

function todayIso(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${now.getFullYear()}-${month}-${day}`;
}

function shiftIsoDate(isoDate: string, days: number): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
    const nextDay = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${nextMonth}-${nextDay}`;
}

function formatDay(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');

    if (!year || !month || !day) {
        return isoDate;
    }

    return `${day}/${month}/${year.slice(2)}`;
}

const shortcuts = [
    { description: 'Coffee', amount: '6.50', category: 'Coffee' },
    { description: 'Groceries', amount: '17.50', category: 'Groceries' },
    { description: 'Transport', amount: '8.00', category: 'Transport' },
] as const;

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
    const [selectedDay, setSelectedDay] = useState(todayIso);
    const [form, setForm] = useState<CasualSpendForm>(() => blankForm(todayIso()));
    // The date field follows the day on screen until the user edits that field.
    const [dateFollowsDay, setDateFollowsDay] = useState(true);
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

        if (name === 'spent_on') {
            setDateFollowsDay(false);
        }

        if (name === 'description' || name === 'amount' || name === 'category' || name === 'spent_on') {
            setForm((current) => ({ ...current, [name]: value }));
        }
    }

    function showDay(nextDay: string) {
        setSelectedDay(nextDay);

        if (editingId === null && dateFollowsDay) {
            setForm((current) => ({ ...current, spent_on: nextDay }));
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

    function applyShortcut(preset: (typeof shortcuts)[number]) {
        setEditingId(null);
        setSaveError('');
        setDateFollowsDay(true);
        setForm({
            description: preset.description,
            amount: preset.amount,
            category: preset.category,
            spent_on: selectedDay,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setSaveError('');
        setDateFollowsDay(true);
        setForm(blankForm(selectedDay));
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

                const savedDay = form.spent_on;

                setSaveError('');
                setEditingId(null);
                setDateFollowsDay(true);
                setSelectedDay(savedDay);
                setForm(blankForm(savedDay));

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

    const daySpends = spends
        .filter((spend) => spend.spent_on === selectedDay)
        .sort((left, right) => right.id - left.id);
    const dayTotal = daySpends.reduce((total, spend) => total + spend.amount_cents, 0);

    return (
        <AppShell current="casual">
        <main className="costs">
            <a className="back-link" href="/">Back</a>
            <h1>Casual spend</h1>

            <div className="shortcuts">
                {shortcuts.map((preset) => (
                    <button
                        key={preset.description}
                        type="button"
                        onClick={() => applyShortcut(preset)}
                    >
                        {preset.description}
                    </button>
                ))}
            </div>

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
            {status === 'ready' && (
                <>
                    <nav className="day-nav" aria-label="Spend day">
                        <button type="button" onClick={() => showDay(shiftIsoDate(selectedDay, -1))}>
                            Previous
                        </button>
                        <div className="day-label">
                            <p>{formatDay(selectedDay)}</p>
                            <p className="day-total">{centsToDollars(dayTotal)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => showDay(shiftIsoDate(selectedDay, 1))}
                            disabled={selectedDay === todayIso()}
                        >
                            Next
                        </button>
                    </nav>
                    {daySpends.length === 0 && <p>No casual spends on this day.</p>}
                    {daySpends.length > 0 && (
                        <ul className="cost-list">
                            {daySpends.map((spend) => (
                                <li key={spend.id}>
                                    <div>
                                        <p className="cost-name">{spend.description}</p>
                                        <p className="cost-meta">
                                            {centsToDollars(spend.amount_cents)}
                                            {' · '}
                                            {spend.category}
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
                </>
            )}
        </main>
        </AppShell>
    );
}
