"use client";

import { useState, type FormEvent, type ReactNode } from "react";

export type FieldErrors = Record<string, string[] | undefined>;

export type AuthFormState = {
  busy: boolean;
  error: string | null;
  fieldErrors: FieldErrors;
};

export function useAuthFormState(): {
  state: AuthFormState;
  setBusy: (b: boolean) => void;
  setErrors: (e: { error?: string | null; fieldErrors?: FieldErrors }) => void;
  reset: () => void;
} {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  return {
    state: { busy, error, fieldErrors },
    setBusy,
    setErrors: ({ error: e, fieldErrors: f }) => {
      if (e !== undefined) setError(e);
      if (f !== undefined) setFieldErrors(f);
    },
    reset: () => {
      setError(null);
      setFieldErrors({});
    },
  };
}

export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <div className="err">{messages[0]}</div>;
}

export function FormCard({
  title,
  banner,
  children,
  onSubmit,
  footer,
}: {
  title: string;
  banner?: ReactNode;
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  footer?: ReactNode;
}) {
  return (
    <section className="card">
      <h1>{title}</h1>
      {banner}
      <form onSubmit={onSubmit} noValidate>
        {children}
      </form>
      {footer}
    </section>
  );
}

export async function postJson(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; data: { error?: string; fieldErrors?: FieldErrors } & Record<string, unknown> }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return { ok: res.ok, status: res.status, data: data as never };
}
