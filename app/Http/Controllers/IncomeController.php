<?php

namespace App\Http\Controllers;

use App\Models\Income;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index(): JsonResponse
    {
        $incomes = Income::query()
            ->orderBy('date')
            ->orderBy('id')
            ->get()
            ->map(fn (Income $income) => $this->payload($income));

        return response()->json($incomes);
    }

    public function store(Request $request): JsonResponse
    {
        $income = Income::create($this->validated($request));

        return response()->json($this->payload($income), 201);
    }

    public function update(Request $request, Income $income): JsonResponse
    {
        $income->update($this->validated($request));

        return response()->json($this->payload($income));
    }

    public function destroy(Income $income): JsonResponse
    {
        $income->delete();

        return response()->json(null, 204);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'amount_cents' => ['required', 'integer', 'min:1'],
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'source' => ['required', 'string', 'max:255'],
            'tax_rate' => ['required', 'numeric', 'min:0'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Income $income): array
    {
        return [
            'id' => $income->id,
            'amount_cents' => $income->amount_cents,
            'date' => $income->date->toDateString(),
            'description' => $income->description,
            'source' => $income->source,
            'tax_rate' => $income->tax_rate,
        ];
    }
}
