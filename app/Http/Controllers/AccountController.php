<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'balance' => 2480,
        ]);
    }
}
