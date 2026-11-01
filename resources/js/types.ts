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

        if (
            typeof record.id !== 'number'
            || typeof record.name !== 'string'
            || typeof record.amount_cents !== 'number'
            || !isInterval(record.interval)
            || typeof record.next_due_on !== 'string'
        ) {
            throw new Error('Unexpected response');
        }

        return {
            id: record.id,
            name: record.name,
            amount_cents: record.amount_cents,
            interval: record.interval,
            next_due_on: record.next_due_on,
        };
    });
}
