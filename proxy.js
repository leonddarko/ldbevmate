// import { withAuth } from "next-auth/middleware";

// export default withAuth(
//   function middleware(req) {},
//   {
//     callbacks: {
//       authorized: ({ token }) => {
//         if (!token) return false;

//         // Allow only operator or admin
//         return token.role === "cpo" || token.role === "admin";
//       },
//     },
//   }
// );

// export const config = {
//   matcher: ["/cpo/:path*"],
// };



import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (!token) return false;

        const path = req.nextUrl.pathname;

        // 🔒 Admin routes
        if (path.startsWith("/admin")) {
          return token.role === "admin";
        }

        // 🔒 CPO routes
        if (path.startsWith("/cpo")) {
          return token.role === "cpo" || token.role === "admin";
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/cpo/:path*",
    "/admin/:path*",
  ],
};