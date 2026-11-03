<?php

namespace App\Http\Controllers;

use App\Models\CasualSpend;
use App\Models\Income;
use App\Models\RecurringCost;
use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
    public function show(): JsonResponse
    {
        $from = '2026-11-01';
        $to = '2026-11-30';

        $incomeCents = (int) Income::query()
            ->whereBetween('date', [$from, $to])
            ->sum('amount_cents');

        $spendCents = (int) CasualSpend::query()
            ->whereBetween('spent_on', [$from, $to])
            ->sum('amount_cents');

        $recurringCents = (int) RecurringCost::query()
            ->whereBetween('next_due_on', [$from, $to])
            ->sum('amount_cents');

        return response()->json([
            'balance' => ($incomeCents - $spendCents - $recurringCents) / 100,
        ]);
    }
}
