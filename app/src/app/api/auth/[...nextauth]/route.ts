import { GET as AuthGET, POST as AuthPOST } from "@/lib/auth";

async function withErrorLog(
  handler: (req: Request, context: { params: Promise<{ nextauth: string[] }> }) => Promise<Response>,
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    const res = await handler(req, context);
    const url = new URL(req.url);
    if (url.pathname.includes("callback") && res.status >= 302 && res.status < 400) {
      const loc = res.headers.get("location") ?? "";
      if (loc.includes("error=")) {
        console.error("\n[AUTH] Callback failed. Incoming:", req.url, "→ Redirect:", loc);
      }
    }
    return res;
  } catch (e) {
    console.error("[AUTH] Exception:", e);
    throw e;
  }
}

export async function GET(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  return withErrorLog(AuthGET, req, context);
}

export async function POST(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  return withErrorLog(AuthPOST, req, context);
}
