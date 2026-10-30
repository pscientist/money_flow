<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('entry', [
        'balance' => 2480,
    ]);
});
