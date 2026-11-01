<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecurringCostTest extends TestCase
{
    use RefreshDatabase;

    public function test_recurring_costs_can_be_created_listed_updated_and_deleted(): void
    {
        $created = $this->postJson('/api/recurring-costs', [
            'name' => 'Rent',
            'amount_cents' => 180000,
            'interval' => 'monthly',
            'next_due_on' => '2026-11-01',
        ]);

        $created->assertCreated()->assertJson([
            'name' => 'Rent',
            'amount_cents' => 180000,
            'interval' => 'monthly',
            'next_due_on' => '2026-11-01',
        ]);

        $id = $created->json('id');

        $this->postJson('/api/recurring-costs', [
            'name' => 'Insurance',
            'amount_cents' => 4000,
            'interval' => 'yearly',
            'next_due_on' => '2026-10-15',
        ])->assertCreated();

        $this->getJson('/api/recurring-costs')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.name', 'Insurance')
            ->assertJsonPath('1.name', 'Rent');

        $this->patchJson("/api/recurring-costs/{$id}", [
            'name' => 'Rent',
            'amount_cents' => 185000,
            'interval' => 'monthly',
            'next_due_on' => '2026-12-01',
        ])->assertOk()->assertJsonPath('amount_cents', 185000);

        $this->deleteJson("/api/recurring-costs/{$id}")->assertNoContent();

        $this->getJson('/api/recurring-costs')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Insurance');
    }

    public function test_recurring_cost_amount_must_be_a_positive_number_of_cents(): void
    {
        $this->postJson('/api/recurring-costs', [
            'name' => 'Rent',
            'amount_cents' => 0,
            'interval' => 'monthly',
            'next_due_on' => '2026-11-01',
        ])->assertUnprocessable()->assertJsonValidationErrors('amount_cents');
    }
}
