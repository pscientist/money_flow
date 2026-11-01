import AppShell, { type NavId } from '../AppShell';

export default function Section({ current, title, detail }: { current: NavId; title: string; detail: string }) {
    return (
        <AppShell current={current}>
            <main className="section-page">
                <h1>{title}</h1>
                <p>{detail}</p>
            </main>
        </AppShell>
    );
}
