<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IncomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_incomes_can_be_created_listed_updated_and_deleted(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $created = $this->postJson('/api/incomes', [
            'amount_cents' => 250000,
            'date' => '2026-11-15',
            'description' => 'November pay',
            'source' => 'Employer',
            'tax_rate' => 0.33,
        ]);

        $created->assertCreated()->assertJson([
            'amount_cents' => 250000,
            'date' => '2026-11-15',
            'description' => 'November pay',
            'source' => 'Employer',
            'tax_rate' => 0.33,
        ]);

        $id = $created->json('id');

        $this->postJson('/api/incomes', [
            'amount_cents' => 40000,
            'date' => '2026-10-20',
            'description' => 'Interest',
            'source' => 'Bank',
            'tax_rate' => 0.1,
        ])->assertCreated();

        $this->getJson('/api/incomes')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.description', 'Interest')
            ->assertJsonPath('1.description', 'November pay');

        $this->patchJson("/api/incomes/{$id}", [
            'amount_cents' => 260000,
            'date' => '2026-11-20',
            'description' => 'November pay',
            'source' => 'Employer',
            'tax_rate' => 0.33,
        ])->assertOk()->assertJsonPath('amount_cents', 260000);

        $this->deleteJson("/api/incomes/{$id}")->assertNoContent();

        $this->getJson('/api/incomes')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.description', 'Interest');
    }
}
