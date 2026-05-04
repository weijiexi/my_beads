"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  FieldError,
  FormCard,
  postJson,
  useAuthFormState,
} from "@/components/AuthForm";

export default function LoginPage() {
  const router = useRouter();
  const { state, setBusy, setErrors, reset } = useAuthFormState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();
    setBusy(true);
    try {
      const { ok, data } = await postJson("/api/auth/login", { email, password });
      if (!ok) {
        setErrors({ error: data.error ?? "Sign in failed.", fieldErrors: data.fieldErrors ?? {} });
        return;
      }
      router.refresh();
      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormCard
      title="Sign in to MyApp"
      banner={state.error ? <div className="banner">{state.error}</div> : null}
      onSubmit={onSubmit}
      footer={
        <p className="muted center mt-16">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      }
    >
      <div className="field">
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

      <div className="field">
        <div className="row-between">
          <label htmlFor="password">Password</label>
          <Link href="/reset" className="muted">Forgot?</Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FieldError messages={state.fieldErrors.password} />
      </div>

      <button type="submit" className="btn" disabled={state.busy}>
        {state.busy ? "Signing in…" : "Sign in"}
      </button>
    </FormCard>
  );
}
