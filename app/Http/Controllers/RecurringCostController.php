<?php

namespace App\Http\Controllers;

use App\Models\RecurringCost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringCostController extends Controller
{
    public function index(): JsonResponse
    {
        $costs = RecurringCost::query()
            ->orderBy('next_due_on')
            ->orderBy('id')
            ->get()
            ->map(fn (RecurringCost $cost) => $this->payload($cost));

        return response()->json($costs);
    }

    public function store(Request $request): JsonResponse
    {
        $cost = RecurringCost::create($this->validated($request));

        return response()->json($this->payload($cost), 201);
    }

    public function update(Request $request, RecurringCost $recurringCost): JsonResponse
    {
        $recurringCost->update($this->validated($request));

        return response()->json($this->payload($recurringCost));
    }

    public function destroy(RecurringCost $recurringCost): JsonResponse
    {
        $recurringCost->delete();

        return response()->json(null, 204);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount_cents' => ['required', 'integer', 'min:1'],
            'interval' => ['required', 'in:weekly,monthly,yearly'],
            'next_due_on' => ['required', 'date'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(RecurringCost $cost): array
    {
        return [
            'id' => $cost->id,
            'name' => $cost->name,
            'amount_cents' => $cost->amount_cents,
            'interval' => $cost->interval,
            'next_due_on' => $cost->next_due_on->toDateString(),
        ];
    }
}
