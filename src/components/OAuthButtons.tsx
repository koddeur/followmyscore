import { oauthSignIn } from "@/app/actions/auth";

const buttonClass =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:border-accent";

export function OAuthButtons({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <div className="space-y-2">
      <form action={oauthSignIn}>
        <input type="hidden" name="provider" value="google" />
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
        <button type="submit" className={buttonClass}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.6 26.7 36.5 24 36.5c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C39.9 37.6 44 32.3 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          Continuer avec Google
        </button>
      </form>
      <form action={oauthSignIn}>
        <input type="hidden" name="provider" value="facebook" />
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
        <button type="submit" className={buttonClass}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" className="h-4 w-4" aria-hidden="true">
            <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
          </svg>
          Continuer avec Facebook
        </button>
      </form>
    </div>
  );
}
