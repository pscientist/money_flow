import AppShell from '../AppShell';

function ProfileAvatar() {
    return (
        <span className="profile-avatar" aria-hidden="true">
            <svg viewBox="0 0 16 16">
                <circle cx="8" cy="5.5" r="2.25" />
                <path d="M3.5 13.25c.6-2.2 2.3-3.25 4.5-3.25s3.9 1.05 4.5 3.25" />
            </svg>
        </span>
    );
}

export default function Profile() {
    const nickname = localStorage.getItem('nickname');
    // A sign-in from before these fields were stored has a nickname and nothing else.
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    return (
        <AppShell current="profile">
        <main className="costs">
            <h1>Profile</h1>
            {nickname ? (
                <div className="profile">
                    <ProfileAvatar />
                    <p className="profile-label">Name</p>
                    <p className="profile-value">{nickname}</p>
                    <p className="profile-label">Username</p>
                    <p className="profile-value">
                        {username ? username : 'Sign in again to see your username.'}
                    </p>
                    <p className="profile-label">Email</p>
                    <p className="profile-value">
                        {email ? email : 'Sign in again to see your email.'}
                    </p>
                </div>
            ) : (
                <p><a className="back-link" href="/login">Login</a> to see your profile.</p>
            )}
        </main>
        </AppShell>
    );
}
