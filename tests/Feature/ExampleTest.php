<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_the_account_endpoint_returns_the_balance(): void
    {
        $response = $this->getJson('/api/account');

        $response->assertOk()->assertExactJson([
            'balance' => 2480,
        ]);
    }
}
