import Link from "next/link";
import { headers } from "next/headers";

export default async function DiagnosePage() {
  const h = await headers();
  const host = h.get("host") ?? "unknown";
  const forwardedProto = h.get("x-forwarded-proto");
  const proto = forwardedProto ?? "http";
  const baseUrl = `${proto}://${host}`;

  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "(not set)";
  const hasGoogleId = !!(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasGoogleSecret = !!(process.env.GOOGLE_CLIENT_SECRET?.trim());

  const callbackUrl = `${nextAuthUrl}/api/auth/callback/google`;
  const suggestedCallback = `${baseUrl}/api/auth/callback/google`;
  const urlMismatch = nextAuthUrl !== baseUrl;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8 text-zinc-100">
      <h1 className="text-2xl font-bold">Auth diagnostic</h1>

      <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-semibold">Current request</h2>
        <p className="font-mono text-sm">
          You are accessing from: <strong>{baseUrl}</strong>
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-semibold">Environment</h2>
        <table className="w-full text-left text-sm">
          <tbody>
            <tr>
              <td className="py-1 text-zinc-500">NEXTAUTH_URL</td>
              <td className="font-mono">{nextAuthUrl}</td>
            </tr>
            <tr>
              <td className="py-1 text-zinc-500">GOOGLE_CLIENT_ID</td>
              <td className={hasGoogleId ? "text-green-400" : "text-red-400"}>
                {hasGoogleId ? "Set" : "Missing or empty"}
              </td>
            </tr>
            <tr>
              <td className="py-1 text-zinc-500">GOOGLE_CLIENT_SECRET</td>
              <td className={hasGoogleSecret ? "text-green-400" : "text-red-400"}>
                {hasGoogleSecret ? "Set" : "Missing or empty"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {urlMismatch && (
        <div className="rounded-lg border border-amber-800 bg-amber-950/50 p-6 text-amber-200">
          <h2 className="font-semibold text-amber-100">URL mismatch</h2>
          <p className="mt-2">
            You are on <code className="rounded bg-amber-900/50 px-1">{baseUrl}</code> but{" "}
            <code className="rounded bg-amber-900/50 px-1">NEXTAUTH_URL</code> is{" "}
            <code className="rounded bg-amber-900/50 px-1">{nextAuthUrl}</code>.
          </p>
          <p className="mt-2">
            They must match. Either set <code className="rounded bg-amber-900/50 px-1">NEXTAUTH_URL={baseUrl}</code> in .env,
            or access the app at {nextAuthUrl}.
          </p>
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-semibold">Google Cloud Console</h2>
        <p className="text-sm text-zinc-400">
          Add these to your OAuth 2.0 Client (APIs & Services → Credentials):
        </p>
        <div className="space-y-2 font-mono text-sm">
          <div>
            <p className="text-zinc-500">Authorized JavaScript origins:</p>
            <p className="break-all rounded bg-zinc-800 p-2">{nextAuthUrl.replace(/\/$/, "")}</p>
          </div>
          <div>
            <p className="text-zinc-500">Authorized redirect URIs:</p>
            <p className="break-all rounded bg-zinc-800 p-2">{callbackUrl}</p>
          </div>
        </div>
        {urlMismatch && (
          <p className="text-amber-400 text-sm">
            If you want to use {baseUrl}, add that origin and{" "}
            <span className="font-mono">{suggestedCallback}</span> as well, and set NEXTAUTH_URL={baseUrl}.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-semibold">If it still fails</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-400">
          <li>
            <strong>OAuth consent screen → Test users:</strong> If your app is in &quot;Testing&quot; mode, add your Google account under Test users. Only those accounts can sign in.
          </li>
          <li>
            <strong>Client ID/Secret:</strong> Ensure .env uses the Client ID and Secret from this exact OAuth client (the one with these URIs).
          </li>
          <li>
            <strong>Save in Google Console:</strong> Click Save after changing URIs. Changes can take a few minutes.
          </li>
        </ul>
      </div>

      <Link
        href="/"
        className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-medium text-zinc-950 hover:bg-amber-400"
      >
        Back to home
      </Link>
    </div>
  );
}
