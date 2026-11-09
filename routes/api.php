<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CasualSpendController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\RecurringCostController;
use Illuminate\Support\Facades\Route;

Route::get('/account', [AccountController::class, 'show']);

Route::get('/recurring-costs', [RecurringCostController::class, 'index']);
Route::post('/recurring-costs', [RecurringCostController::class, 'store']);
Route::patch('/recurring-costs/{recurringCost}', [RecurringCostController::class, 'update']);
Route::delete('/recurring-costs/{recurringCost}', [RecurringCostController::class, 'destroy']);
Route::post('/recurring-costs/{recurringCost}/receipt', [RecurringCostController::class, 'storeReceipt']);
Route::get('/recurring-costs/{recurringCost}/receipt', [RecurringCostController::class, 'showReceipt']);

Route::get('/casual-spends', [CasualSpendController::class, 'index']);
Route::post('/casual-spends', [CasualSpendController::class, 'store']);
Route::patch('/casual-spends/{casualSpend}', [CasualSpendController::class, 'update']);
Route::delete('/casual-spends/{casualSpend}', [CasualSpendController::class, 'destroy']);

Route::get('/incomes', [IncomeController::class, 'index']);
Route::post('/incomes', [IncomeController::class, 'store']);
Route::patch('/incomes/{income}', [IncomeController::class, 'update']);
Route::delete('/incomes/{income}', [IncomeController::class, 'destroy']);

Route::post('/login', LoginController::class);
