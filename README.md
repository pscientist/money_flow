# MoneyFlow

MoneyFlow is a personal finance app. Laravel serves a JSON API, and a React and TypeScript client renders the screens.

![MoneyFlow dashboard](docs/dashboard.png)

## Stack

- PHP 8.3
- Laravel 13
- SQLite
- React 19
- TypeScript
- Vite
- Tailwind
- PHPUnit
- AWS S3
- AWS SES

## Features

- A dashboard shows the account balance and the next recurring payments.
- Recurring costs can be added, edited, and deleted. Amounts are stored as integer cents.
- One receipt per cost is uploaded through the API, stored in a private S3 bucket, and opened with a short-lived signed URL. The browser never receives the AWS keys.
- Feature tests cover the API. 

## Run it

```sh
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
```

Start the API and the frontend in two terminals:

```sh
php artisan serve
npm run dev
```

Open http://127.0.0.1:8000.

Receipt upload and `php artisan mail:sample` need the AWS values filled in `.env`. That file stays out of git. The app runs without them; those two features fail until the bucket, the verified email address, and the keys are set.

Run the tests with:

```sh
php artisan test
```

Run only the casual spend API test with:

```sh
php artisan test --filter=CasualSpendTest
```

Working message thru Amazon SES

```sh
php artisan mail:sample 
```

## Future enhancements

- Financial goals setting and implementation.
- Personalised financail advice
