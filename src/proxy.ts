import nextAuthMiddleware from "next-auth/middleware";

export const proxy = nextAuthMiddleware;

export const config = {
  matcher: ["/api/history/:path*", "/api/summarize"],
};
