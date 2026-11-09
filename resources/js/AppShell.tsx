import type { ReactNode } from 'react';

const links = [
    { id: 'dashboard', href: '/', label: 'Dashboard', icon: HomeIcon },
    { id: 'expenses', href: '/recurring-costs', label: 'Expenses', icon: ExpensesIcon },
    { id: 'casual', href: '/casual-spends', label: 'Casual spend', icon: CartIcon },
    { id: 'income', href: '/income', label: 'Income', icon: IncomeIcon },
    { id: 'goals', href: '/goals', label: 'Goals', icon: GoalsIcon },
    { id: 'learn', href: '/learn', label: 'Learn', icon: LearnIcon },
    { id: 'login', href: '/login', label: 'Login', icon: LoginIcon },
] as const;

export type NavId = (typeof links)[number]['id'];

function logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    window.location.assign('/');
}

export default function AppShell({ current, children }: { current: NavId; children: ReactNode }) {
    const nickname = localStorage.getItem('nickname');
    const menuLinks = nickname ? links.filter((link) => link.id !== 'login') : links;

    return (
        <div className="shell">
            <header className="topbar">
                <div className="topbar-main">
                    <a className="brand" href="/">
                        <span className="app-name">
                            <LeafIcon />
                            Money<span className="app-name-accent">Flow</span>
                        </span>
                        <span className="tagline">Track what comes in, what repeats, and what you spend.</span>
                    </a>
                    <nav className="main-nav" aria-label="Main">
                        {menuLinks.map((link) => {
                            const Icon = link.icon;

                            return (
                                <a
                                    key={link.id}
                                    href={link.href}
                                    aria-current={link.id === current ? 'page' : undefined}
                                >
                                    <Icon />
                                    {link.label}
                                </a>
                            );
                        })}
                    </nav>
                </div>
                {nickname && (
                    <div className="account-bar">
                        <button type="button" className="logout" onClick={logOut}>
                            Log out
                        </button>
                        <a
                            className="account"
                            href="/login"
                            aria-current={current === 'login' ? 'page' : undefined}
                        >
                            <span className="account-name">{nickname}</span>
                            <span className="account-avatar" aria-hidden="true">
                                <LoginIcon />
                            </span>
                        </a>
                    </div>
                )}
                <img className="header-art" src="/images/header-morning.jpg" alt="" />
            </header>
            {children}
        </div>
    );
}

function LeafIcon() {
    return (
        <svg className="leaf" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z" />
            <path d="M8 16c2-3 5-6 9-8" />
        </svg>
    );
}

function HomeIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 7.5 8 2.5l5.5 5V13a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V7.5Z" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 3.5h1.5l1.2 6.2h6.6l1.2-4.2H5" />
            <circle cx="6.5" cy="12.5" r="0.8" />
            <circle cx="11" cy="12.5" r="0.8" />
        </svg>
    );
}

function ExpensesIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h7" />
        </svg>
    );
}

function IncomeIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 12.5 6.5 8 9 10.5 13 5" />
            <path d="M10 5h3v3" />
        </svg>
    );
}

function GoalsIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="5.25" />
            <circle cx="8" cy="8" r="2.25" />
        </svg>
    );
}

function LoginIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="5.5" r="2.25" />
            <path d="M3.5 13.25c.6-2.2 2.3-3.25 4.5-3.25s3.9 1.05 4.5 3.25" />
        </svg>
    );
}

function LearnIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 4.5 8 2.5l5.5 2V12L8 13.5 2.5 12V4.5Z" />
            <path d="M8 2.5v11" />
        </svg>
    );
}
