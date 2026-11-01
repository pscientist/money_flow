<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\RecurringCostController;
use Illuminate\Support\Facades\Route;

Route::get('/account', [AccountController::class, 'show']);

Route::get('/recurring-costs', [RecurringCostController::class, 'index']);
Route::post('/recurring-costs', [RecurringCostController::class, 'store']);
Route::patch('/recurring-costs/{recurringCost}', [RecurringCostController::class, 'update']);
Route::delete('/recurring-costs/{recurringCost}', [RecurringCostController::class, 'destroy']);
Route::post('/recurring-costs/{recurringCost}/receipt', [RecurringCostController::class, 'storeReceipt']);
Route::get('/recurring-costs/{recurringCost}/receipt', [RecurringCostController::class, 'showReceipt']);
