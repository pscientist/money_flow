<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CasualSpendTest extends TestCase
{
    use RefreshDatabase;

    public function test_casual_spends_can_be_created_listed_updated_and_deleted(): void
    {
        $created = $this->postJson('/api/casual-spends', [
            'amount_cents' => 1250,
            'spent_on' => '2026-11-02',
            'description' => 'Coffee',
            'category' => 'Food',
        ]);

        $created->assertCreated()->assertJson([
            'amount_cents' => 1250,
            'spent_on' => '2026-11-02',
            'description' => 'Coffee',
            'category' => 'Food',
            'receipt_id' => null,
        ]);

        $id = $created->json('id');

        $this->postJson('/api/casual-spends', [
            'amount_cents' => 4800,
            'spent_on' => '2026-10-15',
            'description' => 'Train ticket',
            'category' => 'Transport',
        ])->assertCreated();

        $this->getJson('/api/casual-spends')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.description', 'Train ticket')
            ->assertJsonPath('1.description', 'Coffee');

        $this->patchJson("/api/casual-spends/{$id}", [
            'amount_cents' => 1500,
            'spent_on' => '2026-11-03',
            'description' => 'Coffee and a bun',
            'category' => 'Food',
        ])->assertOk()->assertJsonPath('amount_cents', 1500);

        $this->deleteJson("/api/casual-spends/{$id}")->assertNoContent();

        $this->getJson('/api/casual-spends')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.description', 'Train ticket');
    }
}
