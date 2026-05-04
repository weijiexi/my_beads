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

export default function SignupPage() {
  const router = useRouter();
  const { state, setBusy, setErrors, reset } = useAuthFormState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();

    if (password !== confirm) {
      setErrors({ fieldErrors: { confirm: ["Passwords do not match."] } });
      return;
    }

    setBusy(true);
    try {
      const { ok, data } = await postJson("/api/auth/signup", {
        email,
        password,
        name: name.trim() || undefined,
      });
      if (!ok) {
        setErrors({ error: data.error ?? "Sign up failed.", fieldErrors: data.fieldErrors ?? {} });
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
      title="Create your account"
      banner={state.error ? <div className="banner">{state.error}</div> : null}
      onSubmit={onSubmit}
      footer={
        <p className="muted center mt-16">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      }
    >
      <div className="field">
        <label htmlFor="name">Full name (optional)</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FieldError messages={state.fieldErrors.name} />
      </div>

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
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FieldError messages={state.fieldErrors.password} />
      </div>

      <div className="field">
        <label htmlFor="confirm">Confirm password</label>
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
        {state.busy ? "Creating account…" : "Create account"}
      </button>
    </FormCard>
  );
}
