import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/signin",
    "/signup"
  ],
  ignoredRoutes: [
    "/api/webhook"
  ],
  afterAuth(auth, req) {
    // Handle after auth logic here if needed
  }
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};