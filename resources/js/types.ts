export type Interval = 'weekly' | 'monthly' | 'yearly';

export type RecurringCostForm = {
    name: string;
    amount: string;
    interval: Interval;
    next_due_on: string;
};

export type RecurringCost = {
    id: number;
    name: string;
    amount_cents: number;
    interval: Interval;
    next_due_on: string;
    receipt_path: string | null;
};

export type CasualSpendForm = {
    description: string;
    amount: string;
    category: string;
    spent_on: string;
};

export type CasualSpend = {
    id: number;
    amount_cents: number;
    spent_on: string;
    description: string;
    category: string;
    receipt_id: string | null;
};

export type PageStatus = 'loading' | 'ready' | 'error';

export function isInterval(value: unknown): value is Interval {
    return value === 'weekly' || value === 'monthly' || value === 'yearly';
}

export function parseRecurringCosts(data: unknown): RecurringCost[] {
    if (!Array.isArray(data)) {
        throw new Error('Unexpected response');
    }

    return data.map((item) => {
        if (typeof item !== 'object' || item === null) {
            throw new Error('Unexpected response');
        }

        const record = item as Record<string, unknown>;
        const receiptPath = record.receipt_path;

        if (
            typeof record.id !== 'number'
            || typeof record.name !== 'string'
            || typeof record.amount_cents !== 'number'
            || !isInterval(record.interval)
            || typeof record.next_due_on !== 'string'
            || (receiptPath !== null && typeof receiptPath !== 'string')
        ) {
            throw new Error('Unexpected response');
        }

        return {
            id: record.id,
            name: record.name,
            amount_cents: record.amount_cents,
            interval: record.interval,
            next_due_on: record.next_due_on,
            receipt_path: receiptPath,
        };
    });
}

export function parseCasualSpends(data: unknown): CasualSpend[] {
    if (!Array.isArray(data)) {
        throw new Error('Unexpected response');
    }

    return data.map((item) => {
        if (typeof item !== 'object' || item === null) {
            throw new Error('Unexpected response');
        }

        const record = item as Record<string, unknown>;
        const receiptId = record.receipt_id;

        if (
            typeof record.id !== 'number'
            || typeof record.amount_cents !== 'number'
            || typeof record.spent_on !== 'string'
            || typeof record.description !== 'string'
            || typeof record.category !== 'string'
            || (receiptId !== null && typeof receiptId !== 'string')
        ) {
            throw new Error('Unexpected response');
        }

        return {
            id: record.id,
            amount_cents: record.amount_cents,
            spent_on: record.spent_on,
            description: record.description,
            category: record.category,
            receipt_id: receiptId,
        };
    });
}
