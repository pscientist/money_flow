const features = [
    'The dashboard shows the account balance and the next recurring payments.',
    'Recurring costs can be added, edited, and deleted, with one receipt each.',
    'Casual spend is logged one day at a time.',
    'Income is recorded with its source and tax rate.',
];

export default function Welcome() {
    const signedIn = Boolean(localStorage.getItem('token'));

    return (
        <div className="welcome">
            <header className="welcome-bar">
                <a className="welcome-brand" href="/">MoneyFlow</a>
                <a className="welcome-action" href={signedIn ? '/dashboard' : '/login'}>
                    {signedIn ? 'Dashboard' : 'Login'}
                </a>
            </header>
            <main>
                <section className="hero" aria-label="Welcome">
                    <div className="hero-promise">
                        <h1>Where does your money go?</h1>
                        <p>Track what comes in, what repeats, and what you spend.</p>
                    </div>
                    <img className="hero-photo" src="/images/header-morning.jpg" alt="" />
                </section>
                <ul className="welcome-features">
                    {features.map((feature) => (
                        <li key={feature}>{feature}</li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
