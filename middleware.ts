import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/signin",
    "/signup",
    "/auth-callback"
  ],
  ignoredRoutes: [
    "/api/webhook"
  ]
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};