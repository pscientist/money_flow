<?php

namespace App\Http\Controllers;

use App\Models\CasualSpend;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CasualSpendController extends Controller
{
    public function index(): JsonResponse
    {
        $spends = CasualSpend::query()
            ->orderBy('spent_on')
            ->orderBy('id')
            ->get()
            ->map(fn (CasualSpend $spend) => $this->payload($spend));

        return response()->json($spends);
    }

    public function store(Request $request): JsonResponse
    {
        $spend = CasualSpend::create($this->validated($request));

        return response()->json($this->payload($spend), 201);
    }

    public function update(Request $request, CasualSpend $casualSpend): JsonResponse
    {
        $casualSpend->update($this->validated($request));

        return response()->json($this->payload($casualSpend));
    }

    public function destroy(CasualSpend $casualSpend): JsonResponse
    {
        $casualSpend->delete();

        return response()->json(null, 204);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'amount_cents' => ['required', 'integer', 'min:1'],
            'spent_on' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(CasualSpend $spend): array
    {
        return [
            'id' => $spend->id,
            'amount_cents' => $spend->amount_cents,
            'spent_on' => $spend->spent_on->toDateString(),
            'description' => $spend->description,
            'category' => $spend->category,
            'receipt_id' => $spend->receipt_id,
        ];
    }
}
