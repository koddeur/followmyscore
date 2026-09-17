"use client";

import { useState } from "react";

const iconButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-border text-zinc-500 transition hover:border-accent hover:text-accent";

function openShareWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
}

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const shareMessage = `${title}, venez suivre le match en direct !`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — nothing else to do.
    }
  }

  function handleShareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}&quote=${encodeURIComponent(shareMessage)}`;
    openShareWindow(url);
  }

  function handleShareX() {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(shareMessage)}`;
    openShareWindow(url);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={handleCopyLink}
        className={iconButtonClass}
        aria-label="Copier le lien du match"
        title={copied ? "Lien copié !" : "Copier le lien"}
      >
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none h-4 w-4 text-emerald-600"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
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
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={handleShareFacebook}
        className={iconButtonClass}
        aria-label="Partager sur Facebook"
        title="Partager sur Facebook"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="pointer-events-none h-4 w-4"
          aria-hidden="true"
        >
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleShareX}
        className={iconButtonClass}
        aria-label="Partager sur X"
        title="Partager sur X"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="pointer-events-none h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
        </svg>
      </button>
    </div>
  );
}
