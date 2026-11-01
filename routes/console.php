<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:sample', function () {
    $to = config('mail.from.address');

    Mail::raw('Sample summary: Rent is due next week.', function ($message) use ($to) {
        $message->to($to)->subject('Money flow sample');
    });

    $this->info("Sent a sample message to {$to}.");
})->purpose('Send one hardcoded message through the configured mailer');
