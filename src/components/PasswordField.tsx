"use client";

import { useState } from "react";

/**
 * Works both controlled (pass `value`/`onChange`, e.g. RegisterForm which
 * needs the live value for other checks) and uncontrolled (omit them, the
 * form just reads it from FormData on submit).
 */
export function PasswordField({
  id,
  name,
  label,
  labelAddon,
  autoComplete,
  value,
  onChange,
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  label: string;
  labelAddon?: React.ReactNode;
  autoComplete: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isControlled = value !== undefined;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        {labelAddon}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          {...(isControlled
            ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) }
            : { defaultValue })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none h-4 w-4"
              aria-hidden="true"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none h-4 w-4"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
