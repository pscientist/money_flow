<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_main_sections_return_the_app_shell(): void
    {
        $this->get('/income')->assertOk();
        $this->get('/goals')->assertOk();
        $this->get('/learn')->assertOk();
        $this->get('/recurring-costs')->assertOk();
        $this->get('/login')->assertOk();
    }

    public function test_the_account_endpoint_returns_the_balance(): void
    {
        $this->getJson('/api/account')->assertOk()->assertExactJson([
            'balance' => 0,
        ]);

        $this->postJson('/api/incomes', [
            'amount_cents' => 250000,
            'date' => '2026-11-15',
            'description' => 'November pay',
            'source' => 'Employer',
            'tax_rate' => 0.33,
        ])->assertCreated();

        $this->postJson('/api/incomes', [
            'amount_cents' => 40000,
            'date' => '2026-10-20',
            'description' => 'Interest',
            'source' => 'Bank',
            'tax_rate' => 0.1,
        ])->assertCreated();

        $this->postJson('/api/casual-spends', [
            'amount_cents' => 1750,
            'spent_on' => '2026-11-02',
            'description' => 'Coffee',
            'category' => 'Food',
        ])->assertCreated();

        $this->postJson('/api/recurring-costs', [
            'name' => 'Power',
            'amount_cents' => 8000,
            'interval' => 'monthly',
            'next_due_on' => '2026-11-05',
        ])->assertCreated();

        $this->postJson('/api/recurring-costs', [
            'name' => 'Internet',
            'amount_cents' => 5000,
            'interval' => 'monthly',
            'next_due_on' => '2026-12-01',
        ])->assertCreated();

        $this->getJson('/api/account')->assertOk()->assertExactJson([
            'balance' => 2402.5,
        ]);
    }
}
