<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecurringCostTest extends TestCase
{
    use RefreshDatabase;

    public function test_recurring_costs_can_be_created_listed_updated_and_deleted(): void
    {
        Sanctum::actingAs(User::factory()->create());

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

    public function test_a_receipt_can_be_uploaded_replaced_and_opened_with_a_signed_url(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Storage::fake('s3');

        $id = $this->postJson('/api/recurring-costs', [
            'name' => 'Rent',
            'amount_cents' => 180000,
            'interval' => 'monthly',
            'next_due_on' => '2026-11-01',
        ])->assertCreated()->json('id');

        $this->getJson("/api/recurring-costs/{$id}/receipt")->assertNotFound();

        $first = $this->withHeaders(['Accept' => 'application/json'])
            ->post("/api/recurring-costs/{$id}/receipt", [
                'receipt' => UploadedFile::fake()->image('rent.jpg'),
            ]);

        $first->assertOk();
        $firstPath = $first->json('receipt_path');
        $this->assertIsString($firstPath);
        Storage::disk('s3')->assertExists($firstPath);
        $this->assertDatabaseHas('recurring_costs', [
            'id' => $id,
            'receipt_path' => $firstPath,
        ]);

        $second = $this->withHeaders(['Accept' => 'application/json'])
            ->post("/api/recurring-costs/{$id}/receipt", [
                'receipt' => UploadedFile::fake()->image('rent.png'),
            ]);

        $second->assertOk();
        $secondPath = $second->json('receipt_path');
        $this->assertIsString($secondPath);
        $this->assertNotSame($firstPath, $secondPath);
        Storage::disk('s3')->assertMissing($firstPath);
        Storage::disk('s3')->assertExists($secondPath);

        $signed = $this->getJson("/api/recurring-costs/{$id}/receipt")->assertOk();
        $this->assertIsString($signed->json('url'));
        $this->assertNotSame('', $signed->json('url'));
    }

    public function test_recurring_cost_amount_must_be_a_positive_number_of_cents(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/recurring-costs', [
            'name' => 'Rent',
            'amount_cents' => 0,
            'interval' => 'monthly',
            'next_due_on' => '2026-11-01',
        ])->assertUnprocessable()->assertJsonValidationErrors('amount_cents');
    }
}
