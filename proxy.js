import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) return false;

        // Allow only operator or admin
        return token.role === "cpo" || token.role === "admin";
      },
    },
  }
);

export const config = {
  matcher: ["/cpo/:path*"],
};