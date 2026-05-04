"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import {
  FieldError,
  FormCard,
  postJson,
  useAuthFormState,
} from "@/components/AuthForm";

function RequestForm() {
  const { state, setBusy, setErrors, reset } = useAuthFormState();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();
    setBusy(true);
    try {
      const { ok, data } = await postJson("/api/auth/password-reset/request", { email });
      if (!ok) {
        setErrors({ error: data.error ?? "Could not send reset link.", fieldErrors: data.fieldErrors ?? {} });
        return;
      }
      setSubmitted(email);
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <section className="card">
        <h1>Check your inbox</h1>
        <p>
          If an account exists for <strong>{submitted}</strong>, we&apos;ve sent a password
          reset link. It expires in 60 minutes.
        </p>
        <p className="muted">In dev, the reset link is printed to the server console.</p>
        <p className="mt-16">
          <Link href="/login">Back to sign in</Link>
        </p>
      </section>
    );
  }

  return (
    <FormCard
      title="Reset your password"
      banner={state.error ? <div className="banner">{state.error}</div> : null}
      onSubmit={onSubmit}
      footer={
        <p className="muted center mt-16">
          <Link href="/login">Back to sign in</Link>
          {" · "}
          <Link href="/signup">Create an account</Link>
        </p>
      }
    >
      <p className="muted">
        Enter the email associated with your account and we&apos;ll send you a link to
        reset your password.
      </p>
      <div className="field mt-12">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FieldError messages={state.fieldErrors.email} />
      </div>
      <button type="submit" className="btn" disabled={state.busy}>
        {state.busy ? "Sending…" : "Send reset link"}
      </button>
    </FormCard>
  );
}

function ConfirmForm({ token }: { token: string }) {
  const router = useRouter();
  const { state, setBusy, setErrors, reset } = useAuthFormState();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();

    if (password !== confirm) {
      setErrors({ fieldErrors: { confirm: ["Passwords do not match."] } });
      return;
    }

    setBusy(true);
    try {
      const { ok, data } = await postJson("/api/auth/password-reset/confirm", { token, password });
      if (!ok) {
        setErrors({ error: data.error ?? "Could not reset password.", fieldErrors: data.fieldErrors ?? {} });
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="card">
        <h1>Password updated</h1>
        <p>Your password has been reset. You can now sign in with your new password.</p>
        <button type="button" className="btn mt-16" onClick={() => router.push("/login")}>
          Continue to sign in
        </button>
      </section>
    );
  }

  return (
    <FormCard
      title="Choose a new password"
      banner={state.error ? <div className="banner">{state.error}</div> : null}
      onSubmit={onSubmit}
      footer={
        <p className="muted center mt-16">
          <Link href="/login">Back to sign in</Link>
        </p>
      }
    >
      <div className="field">
        <label htmlFor="password">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FieldError messages={state.fieldErrors.password} />
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirm new password</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <FieldError messages={state.fieldErrors.confirm} />
      </div>
      <button type="submit" className="btn" disabled={state.busy}>
        {state.busy ? "Updating…" : "Update password"}
      </button>
    </FormCard>
  );
}

function ResetRouter() {
  const params = useSearchParams();
  const token = params.get("token");
  return token ? <ConfirmForm token={token} /> : <RequestForm />;
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="card"><h1>Loading…</h1></div>}>
      <ResetRouter />
    </Suspense>
  );
}
