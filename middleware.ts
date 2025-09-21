export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/api/history/:path*", "/api/summarize"],
};
