"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.push("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn secondary" onClick={onClick} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
