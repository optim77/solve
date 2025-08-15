import { updateSession } from "@/lib/superbase/middleware";
import { type NextRequest, NextResponse } from "next/server";



export async function middleware(request: NextRequest) {


}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/stripe/webhook).*)",
  ],
};