import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const protectedRoute = [
    "account-information",
    "address-book",
    "order-history",
  ];
  let verify = request.cookies.get("ARIELBATH_COOKIE_PERSISTENCE__auth_token");
  let url = request.url;

  const currentURL = url.split("/")[3];

  if (!verify && protectedRoute.includes(currentURL)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

