"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction } from "./actions";

function FormInner() {
  const params = useSearchParams();
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="surface mt-8 space-y-4 p-6">
      <input
        type="hidden"
        name="callbackUrl"
        value={params.get("callbackUrl") || "/dashboard"}
      />
      <div>
        <label className="label" htmlFor="identifier">
          Username or email
        </label>
        <input
          id="identifier"
          name="identifier"
          required
          className="field"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="field"
          autoComplete="current-password"
        />
      </div>
      {state?.error && <p className="text-sm text-coral">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="surface mt-8 p-6 text-cream-muted">Loading…</div>}>
      <FormInner />
    </Suspense>
  );
}
