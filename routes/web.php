<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app');
});

Route::get('/recurring-costs', function () {
    return view('app');
});

Route::get('/income', function () {
    return view('app');
});

Route::get('/goals', function () {
    return view('app');
});

Route::get('/learn', function () {
    return view('app');
});
