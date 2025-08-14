import { updateSession } from "@/lib/superbase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";


export async function middleware(request: NextRequest) {

  const response = await updateSession(request);


  const supabase = createMiddlewareClient({ req: request, res: response });


  const { data: { session } } = await supabase.auth.getSession();

  const protectedPaths = ["/protected/chat", "/dashboard"];
  const isProtected = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/stripe/webhook).*)",
  ],
};
