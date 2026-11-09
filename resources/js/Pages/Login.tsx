import { useState, type FormEvent } from 'react';
import { apiHeaders } from '../api';
import AppShell from '../AppShell';

type LoginResponse = {
    token: string;
    nickname: string;
    username: string;
    email: string;
};

function parseLogin(data: unknown): LoginResponse {
    if (
        typeof data !== 'object'
        || data === null
        || !('token' in data)
        || !('nickname' in data)
        || !('username' in data)
        || !('email' in data)
    ) {
        throw new Error('Unexpected response');
    }

    const { token, nickname, username, email } = data;

    if (
        typeof token !== 'string'
        || typeof nickname !== 'string'
        || typeof username !== 'string'
        || typeof email !== 'string'
        || token === ''
        || username === ''
        || email === ''
    ) {
        throw new Error('Unexpected response');
    }

    return { token, nickname, username, email };
}

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function signIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        fetch('/api/login', {
            method: 'POST',
            headers: apiHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ username, password }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Request failed');
                }

                return response.json();
            })
            .then((data: unknown) => {
                const session = parseLogin(data);

                localStorage.setItem('token', session.token);
                localStorage.setItem('nickname', session.nickname);
                localStorage.setItem('username', session.username);
                localStorage.setItem('email', session.email);
                window.location.assign('/');
            })
            .catch(() => {
                setError('Could not sign in.');
            });
    }

    return (
        <AppShell current="login">
        <main className="costs">
            <h1>Login</h1>

            <form className="cost-form" onSubmit={signIn}>
                <label>
                    Username
                    <input
                        name="username"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </label>
                <div className="form-actions">
                    <button type="submit">Log in</button>
                </div>
                {error && <p className="form-error">{error}</p>}
            </form>
        </main>
        </AppShell>
    );
}
