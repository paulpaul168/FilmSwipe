"use client";

import { useEffect } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Error constructing the authorization URL.",
  OAuthCallback: "Error handling the OAuth provider response. Usually: redirect URI mismatch (NEXTAUTH_URL vs Google Console), wrong client ID/secret, or expired/invalid code.",
  OAuthCreateAccount: "Could not create the user in the database.",
  OAuthAccountNotLinked: "This email is already linked to another account.",
  EmailCreateAccount: "Could not create the user in the database.",
  Callback: "Error in the OAuth callback handler.",
  Default: "An error occurred during sign-in.",
  google: "OAuth callback failed (provider: Google). Check the terminal where npm run dev runs for the exact error. Common causes: redirect URI mismatch, NEXTAUTH_URL wrong, or invalid Google credentials.",
};

export function AuthErrorDisplay({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  useEffect(() => {
    console.error("[Auth error] Full URL params:", params);
  }, [params]);

  const error = typeof params.error === "string" ? params.error : params.error?.[0];
  const description = typeof params.error_description === "string"
    ? params.error_description
    : params.error_description?.[0];

  const knownMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <div className="max-w-lg space-y-4 rounded-lg border border-red-800 bg-red-950/50 p-4 text-left">
      <div className="font-mono text-sm">
        <p><span className="text-red-400">error:</span> {error ?? "(none)"}</p>
        {description && (
          <p className="mt-1"><span className="text-red-400">error_description:</span> {description}</p>
        )}
      </div>
      {knownMessage && (
        <p className="text-red-200">{knownMessage}</p>
      )}
      <details className="text-xs text-red-400">
        <summary>All params (for debugging)</summary>
        <pre className="mt-2 overflow-auto rounded bg-black/30 p-2">
          {JSON.stringify(params, null, 2)}
        </pre>
      </details>
    </div>
  );
}
