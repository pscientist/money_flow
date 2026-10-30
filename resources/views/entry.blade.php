<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Money Flow') }}</title>
        @fonts
        <style>
            * { box-sizing: border-box; }

            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f4f1ea;
                color: #1c1915;
                font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
            }

            .entry {
                display: flex;
                align-items: center;
                gap: 4.5rem;
                padding: 1.5rem;
            }

            .balance {
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
            }

            .balance-label {
                margin: 0;
                font-size: 0.85rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #6d655c;
            }

            .balance-amount {
                margin: 0;
                font-size: 3rem;
                font-weight: 600;
                letter-spacing: -0.03em;
                line-height: 1;
            }

            .actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                min-width: 14rem;
            }

            .actions button {
                appearance: none;
                border: 1px solid #1c1915;
                background: #fff;
                color: #1c1915;
                border-radius: 0.6rem;
                padding: 0.85rem 1.25rem;
                font: inherit;
                font-size: 1rem;
                text-align: left;
                cursor: pointer;
            }

            .actions button:hover {
                background: #1c1915;
                color: #fff;
            }

            .actions button:focus-visible {
                outline: 2px solid #1c1915;
                outline-offset: 3px;
            }

            @media (max-width: 640px) {
                .entry {
                    gap: 1.5rem;
                    padding: 1rem;
                }

                .balance-amount {
                    font-size: 2rem;
                }

                .actions {
                    min-width: 10.5rem;
                }
            }
        </style>
    </head>
    <body>
        <main class="entry">
            <section class="balance" aria-label="Current account balance">
                <p class="balance-label">Account balance</p>
                <p class="balance-amount">${{ number_format($balance, 2) }}</p>
            </section>

            <nav class="actions" aria-label="Add an entry">
                <button type="button">recurring fixed</button>
                <button type="button">casual spend</button>
                <button type="button">income</button>
            </nav>
        </main>
    </body>
</html>
