<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_cathyl_receives_her_nickname_and_a_browser_token(): void
    {
        $cathyl = User::factory()->create([
            'username' => 'cathyl',
            'nickname' => 'cathyl',
        ]);

        $response = $this->postJson('/api/login', [
            'username' => 'cathyl',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('nickname', 'cathyl');

        $keys = array_keys($response->json());
        sort($keys);
        $this->assertSame(['nickname', 'token'], $keys);

        $token = PersonalAccessToken::findToken($response->json('token'));

        $this->assertInstanceOf(PersonalAccessToken::class, $token);
        $this->assertSame('browser', $token->name);
        $this->assertSame($cathyl->id, $token->tokenable_id);
    }

    public function test_returns_422_when_the_password_is_wrong(): void
    {
        User::factory()->create([
            'username' => 'cathyl',
            'nickname' => 'cathyl',
        ]);

        $this->postJson('/api/login', [
            'username' => 'cathyl',
            'password' => 'incorrect',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'username' => 'These credentials do not match our records.',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_returns_422_when_the_username_is_unknown(): void
    {
        User::factory()->create([
            'username' => 'someone',
            'nickname' => 'Someone',
        ]);

        $this->postJson('/api/login', [
            'username' => 'cathyl',
            'password' => 'password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'username' => 'These credentials do not match our records.',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_returns_422_when_username_and_password_are_missing(): void
    {
        $this->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'username' => 'The username field is required.',
                'password' => 'The password field is required.',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
