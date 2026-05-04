import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="card">
        <h1>Welcome to MyApp</h1>
        <p className="muted">Sign in to your account, or create a new one.</p>
        <div className="mt-16">
          <Link className="btn" href="/login">Sign in</Link>
        </div>
        <div className="mt-12">
          <Link className="btn secondary" href="/signup">Create an account</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>Your account</h1>
      <dl className="kv">
        <dt>Name</dt>
        <dd>{user.name ?? "—"}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>User ID</dt>
        <dd><code>{user.id}</code></dd>
      </dl>
      <div className="mt-20">
        <LogoutButton />
      </div>
    </section>
  );
}
