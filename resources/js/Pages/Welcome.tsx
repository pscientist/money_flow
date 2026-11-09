import AppShell from '../AppShell';

const features = [
    'The dashboard shows the account balance and the next recurring payments.',
    'Recurring costs can be added, edited, and deleted, with one receipt each.',
    'Casual spend is logged one day at a time.',
    'Income is recorded with its source and tax rate.',
];

export default function Welcome() {
    const signedIn = Boolean(localStorage.getItem('token'));

    return (
        <AppShell current="welcome">
            <main className="section-page">
                <h1>MoneyFlow</h1>
                <p>Track what comes in, what repeats, and what you spend.</p>
                <ul className="welcome-features">
                    {features.map((feature) => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>
                <a className="back-link" href={signedIn ? '/dashboard' : '/login'}>
                    {signedIn ? 'Dashboard' : 'Login'}
                </a>
            </main>
        </AppShell>
    );
}
